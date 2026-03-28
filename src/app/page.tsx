import { redirect } from 'next/navigation'

// Root always lands on the dashboard.
// Dashboard detects auth client-side — shows demo data when logged out,
// real data when logged in. No forced redirect to /login.
export default function Home() {
  redirect('/dashboard')
}
