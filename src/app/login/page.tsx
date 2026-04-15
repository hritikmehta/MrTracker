'use client'

import { useState, useEffect } from 'react'
import { createSupabaseBrowser } from '@/lib/supabase'

const SIGNIN_EMAILS = [
  'hritikmehta.77@gmail.com',
  'mehta.hritik2001@gmail.com',
  'm.hritik999@gmail.com',
]

const QUESTIONS = [
  {
    q: 'Do you actively try to track or build any recurring habits in your daily life?',
    type: 'single' as const,
    options: ['Yes, consistently', 'Yes, but on and off', "I've tried but stopped", 'No, never really tried'],
  },
  {
    q: 'Have you ever used an app or tool to track your habits or fitness activity?',
    type: 'single' as const,
    options: ['Yes, currently using one', "Yes, used one in the past but don't anymore", 'Tried a few, nothing stuck', 'Never used one'],
  },
  {
    q: "If you've used a habit tracking app — how long did you actually stick with it?",
    type: 'single' as const,
    options: ['Less than a week', '1–3 weeks', '1–2 months', '3+ months consistently'],
  },
  {
    q: 'What was the biggest reason you stopped using it?',
    type: 'single' as const,
    options: [
      'Too much effort to log things manually every day',
      'Missed a few days and lost motivation to restart',
      'Notifications felt annoying or pushy',
      'The app felt complicated or cluttered',
      'Just forgot about it over time',
      "I didn't stop — still using it",
    ],
  },
  {
    q: 'What would make a habit tracker actually stick for you?',
    type: 'multi' as const,
    options: [
      "If I didn't have to open the app to log anything",
      "If it didn't punish me for missing days",
      'If it gave me insights without me asking',
      'If it was genuinely low effort to set up',
      'If it felt less like a chore and more like a check-in',
    ],
  },
]

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
  position: relative;
  -webkit-font-smoothing: antialiased;
  padding: 40px 24px 80px;
}
.v1-login-ambient {
  position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
  z-index: 0; pointer-events: none;
  background:
    radial-gradient(circle at 20% 30%, #c4b8b1 0%, transparent 50%),
    radial-gradient(circle at 80% 70%, #8a827d 0%, transparent 50%),
    radial-gradient(circle at 50% 50%, #e2dcd8 0%, transparent 60%);
  filter: blur(60px);
  animation: lBreathe 20s infinite alternate ease-in-out;
}
@keyframes lBreathe {
  0%   { transform: scale(1);   opacity: 0.8; }
  100% { transform: scale(1.1); opacity: 1; }
}

.v1-login-badge {
  background: #1c1c1e; color: #fff;
  padding: 8px 16px; border-radius: 20px;
  font-size: 12px; font-weight: 300; letter-spacing: 0.04em;
  box-shadow: inset 0 1px 1px rgba(255,255,255,0.10), 0 8px 16px rgba(0,0,0,0.15);
  margin-bottom: 32px;
  position: relative; z-index: 1;
}

/* ── Shared card ── */
.lp-card {
  position: relative; z-index: 1;
  width: 100%; max-width: 440px;
  background: rgba(255,255,255,0.08);
  backdrop-filter: blur(40px) saturate(120%);
  -webkit-backdrop-filter: blur(40px) saturate(120%);
  border-radius: 28px;
  border: 1px solid rgba(255,255,255,0.15);
  box-shadow: 0 24px 48px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,0.28);
  padding: 30px 28px;
  margin-bottom: 12px;
}
.lp-card::before {
  content: '';
  position: absolute; top: 0; left: 16px; right: 16px; height: 1px;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.55), transparent);
  pointer-events: none;
}

/* ── Waitlist card ── */
.lp-wl-heading {
  font-size: 13px; font-weight: 400; letter-spacing: 0.08em;
  text-transform: uppercase; color: rgba(45,45,45,0.42);
  margin-bottom: 10px;
}
.lp-wl-sub {
  font-size: 13px; font-weight: 300; line-height: 1.6;
  color: rgba(45,45,45,0.52); margin-bottom: 22px;
}
.lp-input-row {
  display: flex; gap: 8px;
}
.lp-input {
  flex: 1;
  background: rgba(255,255,255,0.18);
  border: 1px solid rgba(255,255,255,0.30);
  border-radius: 12px;
  padding: 12px 14px;
  font-family: 'Outfit', sans-serif;
  font-size: 14px; font-weight: 300; color: #1a1a1a;
  outline: none;
  transition: border-color 0.2s, background 0.2s;
}
.lp-input::placeholder { color: rgba(45,45,45,0.35); }
.lp-input:focus { border-color: rgba(255,255,255,0.55); background: rgba(255,255,255,0.26); }
.lp-submit-btn {
  flex-shrink: 0;
  background: #1c1c1e; color: #fff;
  border: none; cursor: pointer;
  padding: 12px 20px; border-radius: 12px;
  font-family: 'Outfit', sans-serif;
  font-size: 13px; font-weight: 300; letter-spacing: 0.02em;
  box-shadow: 0 6px 16px rgba(0,0,0,0.15);
  transition: opacity 0.15s, transform 0.15s;
  display: flex; align-items: center; gap: 8px;
  white-space: nowrap;
}
.lp-submit-btn:hover:not(:disabled) { opacity: 0.85; transform: translateY(-1px); }
.lp-submit-btn:disabled { opacity: 0.50; cursor: not-allowed; }
.lp-spinner {
  width: 12px; height: 12px;
  border: 1.5px solid rgba(255,255,255,0.3);
  border-top-color: #fff; border-radius: 50%;
  animation: lSpin 0.7s linear infinite;
}
@keyframes lSpin { to { transform: rotate(360deg); } }
.lp-error {
  font-size: 12px; font-weight: 300; color: rgba(180,60,40,0.85);
  margin-top: 10px; padding-left: 2px;
}

/* Done state */
.lp-done {
  display: flex; align-items: center; gap: 14px;
}
.lp-done-icon {
  width: 38px; height: 38px; flex-shrink: 0;
  background: rgba(212,224,190,0.4);
  border: 1px solid rgba(212,224,190,0.65);
  border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
}
.lp-done-title { font-size: 15px; font-weight: 300; color: #111; margin-bottom: 3px; }
.lp-done-sub { font-size: 12px; font-weight: 300; color: rgba(45,45,45,0.52); line-height: 1.5; }
.lp-done-email { font-weight: 400; color: #2d2d2d; }

/* ── Survey card ── */
.sv-card-header {
  display: flex; align-items: center; justify-content: space-between;
  margin-bottom: 20px;
}
.sv-label {
  font-size: 10px; font-weight: 400; letter-spacing: 0.10em;
  text-transform: uppercase; color: rgba(45,45,45,0.38);
}
.sv-progress-wrap { display: flex; align-items: center; gap: 8px; }
.sv-progress-bar {
  width: 72px; height: 3px;
  background: rgba(255,255,255,0.20); border-radius: 99px; overflow: hidden;
}
.sv-progress-fill {
  height: 100%; background: #1c1c1e; border-radius: 99px;
  transition: width 0.35s ease;
}
.sv-progress-text {
  font-size: 10px; font-weight: 300; color: rgba(45,45,45,0.38); white-space: nowrap;
}

.sv-question {
  font-size: 15px; font-weight: 300; line-height: 1.5;
  color: #111; letter-spacing: -0.01em;
  margin-bottom: 18px;
}

.sv-options { display: flex; flex-direction: column; gap: 7px; }

.sv-option {
  display: flex; align-items: center; gap: 10px;
  padding: 10px 13px;
  background: rgba(255,255,255,0.10);
  border: 1px solid rgba(255,255,255,0.20);
  border-radius: 12px;
  cursor: pointer;
  font-size: 12.5px; font-weight: 300; color: rgba(45,45,45,0.75);
  line-height: 1.4; text-align: left;
  font-family: 'Outfit', sans-serif;
  transition: background 0.12s, border-color 0.12s;
  width: 100%;
}
.sv-option:hover { background: rgba(255,255,255,0.18); }
.sv-option.selected {
  background: rgba(212,224,190,0.22);
  border-color: rgba(212,224,190,0.45);
  color: #2d2d2d;
}

/* Radio dot */
.sv-radio {
  width: 15px; height: 15px; border-radius: 50%; flex-shrink: 0;
  border: 1.5px solid rgba(45,45,45,0.25);
  display: flex; align-items: center; justify-content: center;
  transition: border-color 0.12s;
}
.sv-option.selected .sv-radio { border-color: #1c1c1e; }
.sv-radio-dot {
  width: 7px; height: 7px; border-radius: 50%;
  background: #1c1c1e;
  transform: scale(0); transition: transform 0.12s;
}
.sv-option.selected .sv-radio-dot { transform: scale(1); }

/* Checkbox */
.sv-checkbox {
  width: 15px; height: 15px; border-radius: 4px; flex-shrink: 0;
  border: 1.5px solid rgba(45,45,45,0.25);
  display: flex; align-items: center; justify-content: center;
  transition: background 0.12s, border-color 0.12s;
}
.sv-option.selected .sv-checkbox { background: #1c1c1e; border-color: #1c1c1e; }

.sv-continue-btn {
  width: 100%; margin-top: 14px;
  padding: 12px 20px;
  background: #1c1c1e; color: #fff;
  border: none; border-radius: 12px; cursor: pointer;
  font-family: 'Outfit', sans-serif;
  font-size: 13px; font-weight: 300; letter-spacing: 0.02em;
  transition: opacity 0.15s;
}
.sv-continue-btn:hover:not(:disabled) { opacity: 0.82; }
.sv-continue-btn:disabled { opacity: 0.35; cursor: not-allowed; }

/* Slide animation */
.sv-slide { animation: svIn 0.25s ease both; }
@keyframes svIn {
  from { opacity: 0; transform: translateX(18px); }
  to   { opacity: 1; transform: translateX(0); }
}

/* Thanks */
.sv-thanks { text-align: center; padding: 8px 0; }
.sv-thanks p:first-child { font-size: 15px; font-weight: 300; color: #111; margin-bottom: 4px; }
.sv-thanks p:last-child { font-size: 13px; font-weight: 300; color: rgba(45,45,45,0.50); }

.v1-login-back {
  position: relative; z-index: 1;
  margin-top: 8px;
  font-size: 12px; font-weight: 300;
  color: rgba(45,45,45,0.45); text-decoration: none;
  transition: color 0.15s;
}
.v1-login-back:hover { color: rgba(45,45,45,0.75); }
`

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [wlDone, setWlDone] = useState(false)
  const [wlDoneType, setWlDoneType] = useState<'signin' | 'waitlist'>('waitlist')
  const [error, setError] = useState('')
  const [accessDenied, setAccessDenied] = useState(false)

  // Survey
  const [sessionId] = useState(() => crypto.randomUUID())
  const [qIndex, setQIndex] = useState(0)
  const [animKey, setAnimKey] = useState(0)
  const [answers, setAnswers] = useState<(string | string[] | null)[]>(Array(QUESTIONS.length).fill(null))
  const [surveyDone, setSurveyDone] = useState(false)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    if (params.get('error') === 'access_denied') setAccessDenied(true)
  }, [])

  const isOwner = SIGNIN_EMAILS.includes(email.trim().toLowerCase())
  const currentQ = QUESTIONS[qIndex]
  const currentAnswer = answers[qIndex]
  const progress = ((qIndex + (surveyDone ? 1 : 0)) / QUESTIONS.length) * 100

  async function handleWaitlist(e: React.FormEvent) {
    e.preventDefault()
    if (!email.trim()) return
    setLoading(true); setError('')
    try {
      if (isOwner) {
        const supabase = createSupabaseBrowser()
        const appUrl = process.env.NEXT_PUBLIC_APP_URL || window.location.origin
        const { error: sbError } = await supabase.auth.signInWithOtp({
          email: email.trim(),
          options: { emailRedirectTo: `${appUrl}/auth/callback` },
        })
        if (sbError) throw sbError
        setWlDoneType('signin')
      } else {
        const res = await fetch('/api/waitlist', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: email.trim() }),
        })
        if (!res.ok) throw new Error('Could not save. Try again.')
        setWlDoneType('waitlist')
        // attach email to the session (whether survey is done or partial)
        saveSurvey(answers, surveyDone, email.trim())
      }
      setWlDone(true)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong.')
    } finally {
      setLoading(false)
    }
  }

  function saveSurvey(ans: (string | string[] | null)[], completed = false, emailOverride?: string) {
    fetch('/api/survey', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sessionId,
        answers: ans,
        completed,
        email: emailOverride ?? null,
      }),
    }).catch(() => {})
  }

  function selectSingle(opt: string) {
    const next = answers.map((a, i) => i === qIndex ? opt : a)
    setAnswers(next)
    saveSurvey(next, false)
    setTimeout(() => advance(next), 280)
  }

  function toggleMulti(opt: string) {
    const cur = (currentAnswer as string[] | null) ?? []
    const updated = cur.includes(opt) ? cur.filter(o => o !== opt) : [...cur, opt]
    const next = answers.map((a, i) => i === qIndex ? updated : a)
    setAnswers(next)
    saveSurvey(next, false)
  }

  function advance(latestAnswers?: (string | string[] | null)[]) {
    const ans = latestAnswers ?? answers
    if (qIndex < QUESTIONS.length - 1) {
      setQIndex(q => q + 1)
      setAnimKey(k => k + 1)
    } else {
      setSurveyDone(true)
      saveSurvey(ans, true)
    }
  }

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <div className="v1-login">
        <div className="v1-login-ambient" aria-hidden="true" />
        <span className="v1-login-badge">MrTracker 1.0</span>

        {/* ── Waitlist card ── */}
        <div className="lp-card">
          {wlDone ? (
            <div className="lp-done">
              <div className="lp-done-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#5a7a40" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
              <div>
                {wlDoneType === 'signin' ? (
                  <>
                    <p className="lp-done-title">Check your inbox</p>
                    <p className="lp-done-sub">Link sent to <span className="lp-done-email">{email}</span></p>
                  </>
                ) : (
                  <>
                    <p className="lp-done-title">You&apos;re on the list</p>
                    <p className="lp-done-sub">We&apos;ll reach out to <span className="lp-done-email">{email}</span></p>
                  </>
                )}
              </div>
            </div>
          ) : (
            <>
              <p className="lp-wl-heading">{accessDenied ? 'Not quite yet' : 'Join the waitlist'}</p>
              <p className="lp-wl-sub">
                {accessDenied
                  ? "Your account isn't set up yet. Drop your email and we'll reach out when ready."
                  : "We're improving MrTracker for more requests and more in-depth digests — till then, drop your email and we'll reach out when your spot is ready."}
              </p>
              <form onSubmit={handleWaitlist}>
                <div className="lp-input-row">
                  <input
                    className="lp-input"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    autoComplete="email"
                    required
                  />
                  <button className="lp-submit-btn" type="submit" disabled={loading || !email.trim()}>
                    {loading && <span className="lp-spinner" />}
                    {loading ? '' : isOwner ? 'Sign in' : 'Join'}
                  </button>
                </div>
                {error && <p className="lp-error">{error}</p>}
              </form>
            </>
          )}
        </div>

        {/* ── Survey card ── */}
        <div className="lp-card">
          {surveyDone ? (
            <div className="sv-thanks">
              <p>Thanks for your time.</p>
              <p>We&apos;ll make it worth it.</p>
            </div>
          ) : (
            <div key={animKey} className="sv-slide">
              <div className="sv-card-header">
                <span className="sv-label">Quick questions</span>
                <div className="sv-progress-wrap">
                  <div className="sv-progress-bar">
                    <div className="sv-progress-fill" style={{ width: `${progress}%` }} />
                  </div>
                  <span className="sv-progress-text">{qIndex + 1} / {QUESTIONS.length}</span>
                </div>
              </div>

              <p className="sv-question">{currentQ.q}</p>

              <div className="sv-options">
                {currentQ.options.map(opt => {
                  const isSelected = currentQ.type === 'single'
                    ? currentAnswer === opt
                    : Array.isArray(currentAnswer) && currentAnswer.includes(opt)
                  return (
                    <button
                      key={opt}
                      className={`sv-option${isSelected ? ' selected' : ''}`}
                      onClick={() => currentQ.type === 'single' ? selectSingle(opt) : toggleMulti(opt)}
                    >
                      {currentQ.type === 'single' ? (
                        <span className="sv-radio">
                          <span className="sv-radio-dot" />
                        </span>
                      ) : (
                        <span className="sv-checkbox">
                          {isSelected && (
                            <svg width="9" height="7" viewBox="0 0 10 8" fill="none">
                              <polyline points="1,4 4,7 9,1" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          )}
                        </span>
                      )}
                      {opt}
                    </button>
                  )
                })}
              </div>

              {currentQ.type === 'multi' && (
                <button
                  className="sv-continue-btn"
                  onClick={() => advance()}
                  disabled={!Array.isArray(currentAnswer) || currentAnswer.length === 0}
                >
                  Continue
                </button>
              )}
            </div>
          )}
        </div>

        <span className="v1-login-back">← Back</span>
      </div>
    </>
  )
}
