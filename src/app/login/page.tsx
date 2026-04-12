'use client'

import { useState, useEffect } from 'react'
import { createSupabaseBrowser } from '@/lib/supabase'

// ─── Styles ─────────────────────────────────────────────────────────────────
const CSS = `
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

body:has(.v1-login) { background: #a69c97; }

.v1-login {
  min-height: 100dvh;
  background-color: #a69c97;
  font-family: 'Outfit', sans-serif;
  color: #2d2d2d;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: relative;
  -webkit-font-smoothing: antialiased;
  padding: 24px;
}

.v1-login-ambient {
  position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
  z-index: 0; pointer-events: none;
  background:
    radial-gradient(circle at 20% 30%, #c4b8b1 0%, transparent 50%),
    radial-gradient(circle at 80% 70%, #8a827d 0%, transparent 50%),
    radial-gradient(circle at 50% 50%, #e2dcd8 0%, transparent 60%);
  filter: blur(60px);
  animation: v3AuthBreathe 20s infinite alternate ease-in-out;
}
@keyframes v3AuthBreathe {
  0%   { transform: scale(1);   opacity: 0.8; }
  100% { transform: scale(1.1); opacity: 1; }
}

.v1-login-badge {
  background: #1c1c1e; color: #fff;
  padding: 8px 16px; border-radius: 20px;
  font-size: 12px; font-weight: 300; letter-spacing: 0.04em;
  box-shadow: inset 0 1px 1px rgba(255,255,255,0.10), 0 8px 16px rgba(0,0,0,0.15);
  margin-bottom: 40px;
  position: relative; z-index: 1;
}

.v1-login-card {
  position: relative; z-index: 1;
  width: 100%; max-width: 420px;
  background: rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(40px) saturate(120%);
  -webkit-backdrop-filter: blur(40px) saturate(120%);
  border-radius: 32px;
  border: 1px solid rgba(255, 255, 255, 0.15);
  box-shadow:
    0 30px 60px rgba(0,0,0,0.05),
    inset 0 1px 0 rgba(255,255,255,0.30),
    inset 0 0 40px rgba(255,255,255,0.10);
  padding: 40px 36px 36px;
}

.v1-login-heading {
  font-size: 28px; font-weight: 200;
  letter-spacing: -0.02em; line-height: 1.1;
  color: #111; margin-bottom: 8px;
}
.v1-login-subtext {
  font-size: 14px; font-weight: 300; line-height: 1.6;
  color: rgba(45,45,45,0.55);
  margin-bottom: 32px;
}

.v1-login-label {
  display: block;
  font-size: 11px; font-weight: 400;
  text-transform: uppercase; letter-spacing: 0.08em;
  color: rgba(45,45,45,0.5);
  margin-bottom: 8px;
}
.v1-login-input {
  width: 100%;
  background: rgba(255,255,255,0.18);
  border: 1px solid rgba(255,255,255,0.30);
  border-radius: 14px;
  padding: 14px 16px;
  font-family: 'Outfit', sans-serif;
  font-size: 15px; font-weight: 300;
  color: #1a1a1a;
  outline: none;
  transition: border-color 0.2s, background 0.2s;
  margin-bottom: 20px;
}
.v1-login-input::placeholder { color: rgba(45,45,45,0.35); }
.v1-login-input:focus {
  border-color: rgba(255,255,255,0.55);
  background: rgba(255,255,255,0.26);
}

.v1-login-btn {
  width: 100%;
  background: #1c1c1e; color: #fff;
  border: none; cursor: pointer;
  padding: 15px 24px; border-radius: 30px;
  font-family: 'Outfit', sans-serif;
  font-size: 14px; font-weight: 300; letter-spacing: 0.02em;
  box-shadow: inset 0 1px 1px rgba(255,255,255,0.10), 0 10px 20px rgba(0,0,0,0.18);
  transition: transform 0.2s ease, box-shadow 0.2s ease, opacity 0.2s;
  display: flex; align-items: center; justify-content: center; gap: 10px;
}
.v1-login-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: inset 0 1px 1px rgba(255,255,255,0.15), 0 14px 28px rgba(0,0,0,0.22);
}
.v1-login-btn:disabled { opacity: 0.55; cursor: not-allowed; }

.v1-login-spinner {
  width: 14px; height: 14px;
  border: 1.5px solid rgba(255,255,255,0.3);
  border-top-color: #fff;
  border-radius: 50%;
  animation: v3AuthSpin 0.7s linear infinite;
}
@keyframes v3AuthSpin { to { transform: rotate(360deg); } }

.v1-login-sent {
  text-align: center;
  padding: 8px 0 4px;
}
.v1-login-sent-icon {
  width: 48px; height: 48px;
  background: rgba(212,224,190,0.5);
  border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  margin: 0 auto 16px;
  border: 1px solid rgba(212,224,190,0.7);
}
.v1-login-sent-heading {
  font-size: 20px; font-weight: 300;
  color: #111; margin-bottom: 8px;
  letter-spacing: -0.01em;
}
.v1-login-sent-body {
  font-size: 13px; font-weight: 300; line-height: 1.6;
  color: rgba(45,45,45,0.55);
}
.v1-login-sent-email {
  font-weight: 400; color: #2d2d2d;
}

.v1-login-error {
  font-size: 12px; font-weight: 300;
  color: rgba(180,60,40,0.85);
  margin-top: -12px; margin-bottom: 16px;
  padding-left: 4px;
}

.v1-login-notice {
  font-size: 12px; font-weight: 300;
  color: rgba(45,45,45,0.60);
  background: rgba(255,255,255,0.14);
  border: 1px solid rgba(255,255,255,0.22);
  border-radius: 10px;
  padding: 10px 14px;
  margin-bottom: 20px;
  line-height: 1.5;
}

.v1-login-back {
  position: relative; z-index: 1;
  margin-top: 24px;
  font-size: 12px; font-weight: 300; letter-spacing: 0.02em;
  color: rgba(45,45,45,0.5);
  text-decoration: none;
  transition: color 0.15s;
}
.v1-login-back:hover { color: rgba(45,45,45,0.8); }

.v1-login-toggle {
  position: relative; z-index: 1;
  margin-top: 16px;
  font-size: 12px; font-weight: 300;
  color: rgba(45,45,45,0.48);
  text-align: center;
}
.v1-login-toggle-link {
  color: rgba(45,45,45,0.70); font-weight: 400;
  text-decoration: underline; text-underline-offset: 2px;
  cursor: pointer; background: none; border: none;
  font-family: 'Outfit', sans-serif; font-size: 12px;
  padding: 0;
}
.v1-login-toggle-link:hover { color: #2d2d2d; }
`

// ─── Component ───────────────────────────────────────────────────────────────
export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')
  const [mode, setMode] = useState<'signin' | 'waitlist'>('signin')
  const [waitlistSent, setWaitlistSent] = useState(false)
  const [accessNotice, setAccessNotice] = useState('')

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    if (params.get('error') === 'access_denied') {
      setAccessNotice("Your account isn't set up yet. Join the waitlist and we'll reach out.")
      setMode('waitlist')
    }
  }, [])

  async function handleSignIn(e: React.FormEvent) {
    e.preventDefault()
    if (!email.trim()) return
    setLoading(true)
    setError('')
    try {
      const supabase = createSupabaseBrowser()
      const { error: sbError } = await supabase.auth.signInWithOtp({
        email: email.trim(),
        options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
      })
      if (sbError) throw sbError
      setSent(true)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Try again.')
    } finally {
      setLoading(false)
    }
  }

  async function handleWaitlist(e: React.FormEvent) {
    e.preventDefault()
    if (!email.trim()) return
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      })
      if (!res.ok) throw new Error('Could not save. Try again.')
      setWaitlistSent(true)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <div className="v1-login">
        <div className="v1-login-ambient" aria-hidden="true" />

        <span className="v1-login-badge">MrTracker 1.0</span>

        <div className="v1-login-card">
          {/* ── Sign-in mode ── */}
          {mode === 'signin' && !sent && (
            <form onSubmit={handleSignIn}>
              <h1 className="v1-login-heading">Sign in</h1>
              <p className="v1-login-subtext">
                Enter your email and we&apos;ll send you a link.
                No password required.
              </p>
              <label className="v1-login-label" htmlFor="v1-email">Email</label>
              <input
                id="v1-email"
                className="v1-login-input"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                autoComplete="email"
                autoFocus
                required
              />
              {error && <p className="v1-login-error">{error}</p>}
              <button className="v1-login-btn" type="submit" disabled={loading || !email.trim()}>
                {loading && <span className="v1-login-spinner" />}
                {loading ? 'Sending…' : 'Send link'}
              </button>
            </form>
          )}

          {/* ── Sign-in sent ── */}
          {mode === 'signin' && sent && (
            <div className="v1-login-sent">
              <div className="v1-login-sent-icon">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#5a7a40" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
              <p className="v1-login-sent-heading">Check your inbox</p>
              <p className="v1-login-sent-body">
                We sent a link to{' '}
                <span className="v1-login-sent-email">{email}</span>.
                <br />Click it to sign in — no password needed.
              </p>
            </div>
          )}

          {/* ── Waitlist mode ── */}
          {mode === 'waitlist' && !waitlistSent && (
            <form onSubmit={handleWaitlist}>
              <h1 className="v1-login-heading">Join the waitlist</h1>
              <p className="v1-login-subtext">
                MrTracker is invite-only right now.
                Drop your email and we&apos;ll reach out when a spot opens.
              </p>
              {accessNotice && (
                <div className="v1-login-notice">{accessNotice}</div>
              )}
              <label className="v1-login-label" htmlFor="v1-waitlist-email">Email</label>
              <input
                id="v1-waitlist-email"
                className="v1-login-input"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                autoComplete="email"
                autoFocus
                required
              />
              {error && <p className="v1-login-error">{error}</p>}
              <button className="v1-login-btn" type="submit" disabled={loading || !email.trim()}>
                {loading && <span className="v1-login-spinner" />}
                {loading ? 'Saving…' : 'Join waitlist'}
              </button>
            </form>
          )}

          {/* ── Waitlist sent ── */}
          {mode === 'waitlist' && waitlistSent && (
            <div className="v1-login-sent">
              <div className="v1-login-sent-icon">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#5a7a40" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
              <p className="v1-login-sent-heading">You&apos;re on the list</p>
              <p className="v1-login-sent-body">
                We&apos;ll reach out to{' '}
                <span className="v1-login-sent-email">{email}</span>{' '}
                when your spot is ready.
              </p>
            </div>
          )}
        </div>

        {/* ── Toggle between modes ── */}
        {!sent && !waitlistSent && (
          <p className="v1-login-toggle">
            {mode === 'signin' ? (
              <>
                No access yet?{' '}
                <button className="v1-login-toggle-link" onClick={() => { setMode('waitlist'); setError('') }}>
                  Join the waitlist
                </button>
              </>
            ) : (
              <>
                Have access?{' '}
                <button className="v1-login-toggle-link" onClick={() => { setMode('signin'); setError(''); setAccessNotice('') }}>
                  Sign in
                </button>
              </>
            )}
          </p>
        )}

        <a href="/" className="v1-login-back">← Back</a>
      </div>
    </>
  )
}
