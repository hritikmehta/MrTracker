import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseAdmin } from '@/lib/supabase-server'

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { answers, email, sessionId, completed } = body

  if (!sessionId) {
    return NextResponse.json({ error: 'sessionId required' }, { status: 400 })
  }

  const db = createSupabaseAdmin()
  const { error } = await db.from('survey_responses').upsert({
    session_id: sessionId,
    email: email?.trim().toLowerCase() || null,
    q1: answers[0] ?? null,
    q2: answers[1] ?? null,
    q3: answers[2] ?? null,
    q4: answers[3] ?? null,
    q5: Array.isArray(answers[4]) ? answers[4].join(', ') : (answers[4] ?? null),
    completed: completed ?? false,
  }, { onConflict: 'session_id' })

  if (error) {
    console.error('Survey upsert error:', error)
    return NextResponse.json({ error: 'failed to save' }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
