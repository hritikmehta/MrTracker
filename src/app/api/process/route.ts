import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServer, createSupabaseAdmin } from '@/lib/supabase-server'
import { processPendingLogs } from '@/lib/processor'

export async function POST(req: NextRequest) {
  let userId: string | null = null

  // Bearer token path (Siri Shortcut / direct API call)
  const authHeader = req.headers.get('authorization')
  if (authHeader?.startsWith('Bearer ')) {
    const token = authHeader.replace('Bearer ', '').trim()
    const db = createSupabaseAdmin()
    const { data } = await db.from('profiles').select('id').eq('id', token).single()
    if (data) userId = data.id
  } else {
    // Web session path
    const supabase = await createSupabaseServer()
    const { data: { user } } = await supabase.auth.getUser()
    if (user) userId = user.id
  }

  if (!userId) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }

  try {
    const result = await processPendingLogs(userId)
    return NextResponse.json(result)
  } catch (err) {
    console.error('Process error:', err)
    return NextResponse.json({ error: 'processing failed' }, { status: 500 })
  }
}
