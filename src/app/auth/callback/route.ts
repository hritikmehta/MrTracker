import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServer, createSupabaseAdmin } from '@/lib/supabase-server'

/**
 * Supabase magic link callback.
 *
 * Access control: after a successful sign-in we check the `allowed_users` table.
 * Add a row there (just the email) to grant access. Anyone not on the list is
 * signed out immediately and sent to the waitlist page.
 *
 * Manage access at: Supabase Dashboard → Table Editor → allowed_users
 */
export async function GET(req: NextRequest) {
  const { searchParams, origin } = new URL(req.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/dashboard'

  if (code) {
    const supabase = await createSupabaseServer()
    const { error, data } = await supabase.auth.exchangeCodeForSession(code)

    if (!error && data.user) {
      const userEmail = data.user.email?.toLowerCase() ?? ''

      // Check allowed_users table via service role (bypasses RLS)
      const admin = createSupabaseAdmin()
      const { data: allowed } = await admin
        .from('allowed_users')
        .select('email')
        .eq('email', userEmail)
        .maybeSingle()

      if (!allowed) {
        // Not on the allow list — revoke session and send to waitlist
        await supabase.auth.signOut()
        return NextResponse.redirect(`${origin}/login?error=access_denied`)
      }

      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth_failed`)
}
