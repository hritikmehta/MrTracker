import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServer } from '@/lib/supabase-server'

/**
 * Supabase magic link callback.
 * Supabase redirects here after the user clicks their email link.
 * We exchange the one-time code for a session, then send the user to /dashboard.
 */
export async function GET(req: NextRequest) {
  const { searchParams, origin } = new URL(req.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/dashboard'

  if (code) {
    const supabase = await createSupabaseServer()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  // Auth failed — send back to login with an error hint
  return NextResponse.redirect(`${origin}/login?error=auth_failed`)
}
