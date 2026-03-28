import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServer, createSupabaseAdmin } from '@/lib/supabase-server'

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { text, timestamp, source = 'web' } = body

  if (!text?.trim()) {
    return NextResponse.json({ error: 'text is required' }, { status: 400 })
  }

  // Two auth paths:
  // 1. Web users — authenticated via Supabase session cookie
  // 2. Siri shortcut — sends user_id as Bearer token in Authorization header

  let userId: string | null = null

  const authHeader = req.headers.get('authorization')
  if (authHeader?.startsWith('Bearer ')) {
    const token = authHeader.replace('Bearer ', '').trim()
    const db = createSupabaseAdmin()
    const { data } = await db.from('profiles').select('id').eq('id', token).single()
    if (data) userId = data.id
  } else {
    const supabase = await createSupabaseServer()
    const { data: { user } } = await supabase.auth.getUser()
    if (user) userId = user.id
  }

  if (!userId) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }

  let loggedAt: string
  try {
    loggedAt = timestamp ? new Date(timestamp).toISOString() : new Date().toISOString()
  } catch {
    loggedAt = new Date().toISOString()
  }

  const db = createSupabaseAdmin()
  const { data, error } = await db
    .from('raw_logs')
    .insert({ user_id: userId, text: text.trim(), source, logged_at: loggedAt })
    .select('id')
    .single()

  if (error) {
    console.error('Insert error:', error)
    return NextResponse.json({ error: 'failed to save' }, { status: 500 })
  }

  return NextResponse.json({ ok: true, id: data.id, logged_at: loggedAt })
}
