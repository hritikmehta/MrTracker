import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseAdmin } from '@/lib/supabase-server'

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { answers, email } = body

  if (!answers || typeof answers !== 'object') {
    return NextResponse.json({ error: 'answers required' }, { status: 400 })
  }

  const db = createSupabaseAdmin()
  const { error } = await db.from('survey_responses').insert({
    email: email?.trim().toLowerCase() || null,
    q1: answers[0] ?? null,
    q2: answers[1] ?? null,
    q3: answers[2] ?? null,
    q4: answers[3] ?? null,
    q5: Array.isArray(answers[4]) ? answers[4].join(', ') : (answers[4] ?? null),
  })

  if (error) {
    console.error('Survey insert error:', error)
    return NextResponse.json({ error: 'failed to save' }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
