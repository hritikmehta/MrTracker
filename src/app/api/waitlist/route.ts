import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseAdmin } from '@/lib/supabase-server'

export async function POST(req: NextRequest) {
  const body = await req.json()
  const email = body.email?.trim().toLowerCase()

  if (!email) {
    return NextResponse.json({ error: 'email required' }, { status: 400 })
  }

  const db = createSupabaseAdmin()
  const { error } = await db.from('waitlist').insert({ email })

  if (error) {
    // Treat duplicate as success — don't expose whether email already exists
    if (error.code === '23505') {
      return NextResponse.json({ ok: true })
    }
    console.error('Waitlist insert error:', error)
    return NextResponse.json({ error: 'failed to save' }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
