// lib/processor.ts
import Anthropic from '@anthropic-ai/sdk'
import { createSupabaseAdmin } from './supabase-server'

const claude = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

const SYSTEM_PROMPT = `You are a fitness and nutrition log parser. You receive a list of raw log entries from a user, each with a timestamp. Parse ALL entries and return ONLY valid JSON — no markdown fences, no explanation.

Return this exact structure:
{
  "workouts": [
    {
      "raw_log_id": "uuid from input",
      "workout_date": "YYYY-MM-DD",
      "exercise": "canonical name e.g. Bench Press",
      "sets": 3,
      "reps": "8,8,6",
      "weights_kg": "60,70,80",
      "notes": "optional string or null"
    }
  ],
  "nutrition": [
    {
      "raw_log_id": "uuid from input",
      "meal_date": "YYYY-MM-DD",
      "meal_name": "descriptive name",
      "calories": 450,
      "protein_g": 35.0,
      "carbs_g": 40.0,
      "fat_g": 12.0,
      "notes": "optional or null"
    }
  ]
}

Rules:
- Use timestamps to infer dates if not explicitly stated
- Normalise exercises: "bench" → "Bench Press", "ohp" → "Overhead Press", "dl" → "Deadlift"
- If one weight applies to all sets, repeat it: 3×80kg → "80,80,80"
- A log can produce multiple workout rows (one per exercise) or multiple nutrition rows (one per food item)
- Use standard nutrition databases for calorie/macro estimates from food descriptions
- If a log is ambiguous (could be workout or food), use context clues from other logs same day
- Ignore logs that are clearly not workout or food (greetings, random text)
- Always include the raw_log_id from the input so rows can be linked back`

export async function processPendingLogs(userId: string): Promise<{ processed: number }> {
  const db = createSupabaseAdmin()

  // Fetch all unprocessed logs for this user, ordered by time
  const { data: pending, error } = await db
    .from('raw_logs')
    .select('id, text, logged_at, source')
    .eq('user_id', userId)
    .eq('processed', false)
    .order('logged_at', { ascending: true })

  if (error) throw error
  if (!pending || pending.length === 0) return { processed: 0 }

  // Format for Claude — include timestamps so it has temporal context
  const logsForClaude = pending.map(l => ({
    id: l.id,
    timestamp: l.logged_at,
    source: l.source,
    text: l.text,
  }))

  const userMessage = `Today's date context: ${new Date().toISOString().split('T')[0]}

Raw logs to parse:
${JSON.stringify(logsForClaude, null, 2)}`

  // Single Claude call for all pending logs
  const response = await claude.messages.create({
    model: 'claude-opus-4-6',
    max_tokens: 4000,
    system: SYSTEM_PROMPT,
    messages: [{ role: 'user', content: userMessage }],
  })

  let parsed: { workouts: any[]; nutrition: any[] }
  try {
    const raw = response.content[0].type === 'text' ? response.content[0].text : ''
    parsed = JSON.parse(raw.replace(/```json|```/g, '').trim())
  } catch (e) {
    console.error('Claude parse error:', e)
    throw new Error('Failed to parse Claude response')
  }

  // Insert workouts
  if (parsed.workouts?.length > 0) {
    const workoutRows = parsed.workouts.map((w: any) => ({
      user_id: userId,
      raw_log_id: w.raw_log_id,
      workout_date: w.workout_date,
      exercise: w.exercise,
      sets: w.sets,
      reps: w.reps,
      weights_kg: w.weights_kg,
      notes: w.notes,
    }))
    await db.from('workouts').insert(workoutRows)

    // Update personal records
    for (const w of parsed.workouts) {
      if (!w.weights_kg) continue
      const weights = String(w.weights_kg).split(',').map(Number).filter(Boolean)
      const best = Math.max(...weights)
      if (!best) continue
      await db.from('personal_records').upsert({
        user_id: userId,
        exercise: w.exercise,
        best_weight_kg: best,
        achieved_on: w.workout_date,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'user_id,exercise', ignoreDuplicates: false })
    }
  }

  // Insert nutrition
  if (parsed.nutrition?.length > 0) {
    const nutritionRows = parsed.nutrition.map((n: any) => ({
      user_id: userId,
      raw_log_id: n.raw_log_id,
      meal_date: n.meal_date,
      meal_name: n.meal_name,
      calories: n.calories,
      protein_g: n.protein_g,
      carbs_g: n.carbs_g,
      fat_g: n.fat_g,
      notes: n.notes,
    }))
    await db.from('nutrition').insert(nutritionRows)
  }

  // Mark all as processed
  const processedIds = pending.map(l => l.id)
  await db
    .from('raw_logs')
    .update({ processed: true, processed_at: new Date().toISOString() })
    .in('id', processedIds)

  return { processed: pending.length }
}
