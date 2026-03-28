import { NextResponse } from 'next/server'
import { createSupabaseServer } from '@/lib/supabase-server'
import { processPendingLogs } from '@/lib/processor'

export async function POST() {
  const supabase = await createSupabaseServer()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }

  try {
    const result = await processPendingLogs(user.id)
    return NextResponse.json(result)
  } catch (err) {
    console.error('Process error:', err)
    return NextResponse.json({ error: 'processing failed' }, { status: 500 })
  }
}
