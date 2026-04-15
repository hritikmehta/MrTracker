'use client'

import { useState, useEffect } from 'react'
import { createSupabaseBrowser } from '@/lib/supabase'

// ─── Styles ──────────────────────────────────────────────────────────────────
const CSS = `
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
body:has(.sc-root) { background: #a69c97; }

.sc-root {
  min-height: 100dvh;
  background-color: #a69c97;
  font-family: 'Outfit', sans-serif;
  color: #2d2d2d;
  -webkit-font-smoothing: antialiased;
  position: relative;
  padding: 0 0 80px;
}
.sc-ambient {
  position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
  z-index: 0; pointer-events: none;
  background:
    radial-gradient(circle at 20% 30%, #c4b8b1 0%, transparent 50%),
    radial-gradient(circle at 80% 70%, #8a827d 0%, transparent 50%),
    radial-gradient(circle at 50% 50%, #e2dcd8 0%, transparent 60%);
  filter: blur(60px);
  animation: scBreathe 20s infinite alternate ease-in-out;
}
@keyframes scBreathe {
  0%   { transform: scale(1);   opacity: 0.8; }
  100% { transform: scale(1.1); opacity: 1; }
}

/* Header */
.sc-header {
  position: relative; z-index: 10;
  display: flex; align-items: center; justify-content: space-between;
  padding: 22px 36px;
  max-width: 900px; margin: 0 auto;
}
.sc-badge {
  background: #1c1c1e; color: #fff;
  padding: 8px 16px; border-radius: 20px;
  font-size: 12px; font-weight: 300; letter-spacing: 0.04em;
  box-shadow: inset 0 1px 1px rgba(255,255,255,0.10), 0 8px 16px rgba(0,0,0,0.15);
  text-decoration: none;
}
.sc-back {
  font-size: 12px; font-weight: 300; color: rgba(45,45,45,0.55);
  text-decoration: none; padding: 6px 14px;
  border: 1px solid rgba(255,255,255,0.25); border-radius: 999px;
  background: rgba(255,255,255,0.12);
  transition: background 0.2s;
}
.sc-back:hover { background: rgba(255,255,255,0.22); }

/* Content */
.sc-content {
  position: relative; z-index: 10;
  max-width: 900px; margin: 0 auto;
  padding: 0 36px;
}
.sc-hero {
  padding: 32px 0 32px;
  animation: scFadeUp 0.6s ease both;
}
@keyframes scFadeUp {
  from { opacity: 0; transform: translateY(12px); }
  to   { opacity: 1; transform: translateY(0); }
}
.sc-hero h1 {
  font-size: clamp(1.6rem, 4vw, 2.4rem);
  font-weight: 200; letter-spacing: -0.03em; color: #111;
  margin-bottom: 10px;
}
.sc-hero p {
  font-size: 14px; font-weight: 300; color: rgba(45,45,45,0.55);
  line-height: 1.6; max-width: 520px;
}

/* Card */
.sc-card {
  background: rgba(255,255,255,0.08);
  backdrop-filter: blur(40px) saturate(120%);
  -webkit-backdrop-filter: blur(40px) saturate(120%);
  border: 1px solid rgba(255,255,255,0.15);
  border-radius: 24px; padding: 24px 26px;
  position: relative;
  box-shadow: 0 20px 40px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,0.28);
  animation: scFadeUp 0.6s ease both;
}
.sc-card::before {
  content: '';
  position: absolute; top: 0; left: 16px; right: 16px; height: 1px;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.55), transparent);
  pointer-events: none;
}
.sc-card-label {
  font-size: 10px; font-weight: 400; letter-spacing: 0.10em;
  text-transform: uppercase; color: rgba(45,45,45,0.42);
  margin-bottom: 16px;
}

/* Works On — horizontal devices */
.sc-devices {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
}
.sc-device {
  display: flex; flex-direction: column; align-items: flex-start; gap: 8px;
  padding: 14px 14px;
  background: rgba(255,255,255,0.10);
  border: 1px solid rgba(255,255,255,0.18);
  border-radius: 16px;
}
.sc-device-icon { font-size: 22px; line-height: 1; }
.sc-device-name { font-size: 13px; font-weight: 400; color: #2d2d2d; }
.sc-device-desc { font-size: 11.5px; font-weight: 300; color: rgba(45,45,45,0.50); line-height: 1.5; }

/* Two-col layout */
.sc-two-col {
  display: grid;
  grid-template-columns: 1fr 340px;
  gap: 14px;
  margin-top: 14px;
  align-items: start;
}

/* Steps */
.sc-steps { display: flex; flex-direction: column; gap: 8px; }
.sc-step {
  display: flex; gap: 12px; align-items: flex-start;
  padding: 12px 14px;
  background: rgba(255,255,255,0.10);
  border: 1px solid rgba(255,255,255,0.18);
  border-radius: 14px;
}
.sc-step-num {
  width: 22px; height: 22px; border-radius: 50%; flex-shrink: 0;
  background: #1c1c1e; color: #fff;
  display: flex; align-items: center; justify-content: center;
  font-size: 10px; font-weight: 400;
  margin-top: 1px;
}
.sc-step-body { flex: 1; }
.sc-step-title {
  font-size: 12.5px; font-weight: 400; color: #2d2d2d;
  margin-bottom: 4px;
}
.sc-step-desc {
  font-size: 11.5px; font-weight: 300; color: rgba(45,45,45,0.52);
  line-height: 1.55;
}
.sc-step-code {
  display: block; margin-top: 5px;
  font-size: 11px; font-weight: 300;
  background: rgba(255,255,255,0.22);
  border: 1px solid rgba(255,255,255,0.35);
  border-radius: 8px; padding: 5px 10px;
  color: rgba(45,45,45,0.72); letter-spacing: 0.01em;
  word-break: break-all;
}
.sc-step-token {
  display: block; margin-top: 5px;
  font-size: 11px; font-weight: 400;
  background: rgba(212,224,190,0.20);
  border: 1px solid rgba(212,224,190,0.40);
  border-radius: 8px; padding: 5px 10px;
  color: rgba(45,45,45,0.80); letter-spacing: 0.01em;
  word-break: break-all;
}

/* Download card */
.sc-download-card {
  display: flex; flex-direction: column; gap: 16px;
  height: 100%;
}
.sc-download-note {
  font-size: 12px; font-weight: 300; color: rgba(45,45,45,0.50);
  line-height: 1.6;
}
.sc-download-note strong { color: rgba(45,45,45,0.70); font-weight: 400; }
.sc-download-btn {
  display: flex; align-items: center; justify-content: center; gap: 8px;
  padding: 13px 20px;
  background: #1c1c1e; color: #fff;
  font-family: 'Outfit', sans-serif;
  font-size: 13px; font-weight: 300; letter-spacing: 0.02em;
  border-radius: 16px; text-decoration: none;
  box-shadow: 0 4px 12px rgba(0,0,0,0.18);
  transition: opacity 0.15s, transform 0.15s;
}
.sc-download-btn:hover { opacity: 0.82; transform: translateY(-1px); }
.sc-download-prompt {
  font-size: 11px; font-weight: 300; color: rgba(45,45,45,0.40);
  line-height: 1.55; text-align: center;
}

/* Loading / unauthed */
.sc-center {
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  min-height: 60vh;
  font-size: 13px; font-weight: 300; color: rgba(45,45,45,0.50);
  gap: 16px;
}
.sc-center a {
  color: rgba(45,45,45,0.70); font-weight: 400;
  text-decoration: underline; text-underline-offset: 2px;
}

@media (max-width: 700px) {
  .sc-header { padding: 16px 20px; }
  .sc-content { padding: 0 18px; }
  .sc-hero { padding: 24px 0 24px; }
  .sc-devices { grid-template-columns: 1fr; }
  .sc-two-col { grid-template-columns: 1fr; }
}
`

// ─── Component ───────────────────────────────────────────────────────────────
export default function ShortcutSetupPage() {
  const [userId, setUserId] = useState<string | null>(null)
  const [authReady, setAuthReady] = useState(false)
  const [appUrl, setAppUrl] = useState('')

  useEffect(() => {
    setAppUrl(process.env.NEXT_PUBLIC_APP_URL || window.location.origin)
    const supabase = createSupabaseBrowser()
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUserId(user?.id ?? null)
      setAuthReady(true)
    })
  }, [])

  const endpointUrl = `${appUrl}/api/log`

  if (!authReady) {
    return (
      <>
        <style dangerouslySetInnerHTML={{ __html: CSS }} />
        <div className="sc-root"><div className="sc-ambient" aria-hidden="true" />
          <div className="sc-center">Loading…</div>
        </div>
      </>
    )
  }

  if (!userId) {
    return (
      <>
        <style dangerouslySetInnerHTML={{ __html: CSS }} />
        <div className="sc-root"><div className="sc-ambient" aria-hidden="true" />
          <div className="sc-center">
            <span>You need to be signed in to set up shortcuts.</span>
            <a href="/login">Sign in →</a>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <div className="sc-root">
        <div className="sc-ambient" aria-hidden="true" />

        <header className="sc-header">
          <a href="/dashboard" className="sc-badge">MrTracker 1.0</a>
          <a href="/dashboard" className="sc-back">← Dashboard</a>
        </header>

        <div className="sc-content">
          <div className="sc-hero">
            <h1>Setup iOS Shortcut</h1>
            <p>
              One setup. Then just speak — from your iPhone, Apple Watch, or Mac.
              No screen taps. No app to open.
            </p>
          </div>

          {/* Works On — horizontal grid */}
          <div className="sc-card">
            <div className="sc-card-label">Works On</div>
            <div className="sc-devices">
              <div className="sc-device">
                <span className="sc-device-icon">📱</span>
                <div className="sc-device-name">iPhone</div>
                <div className="sc-device-desc">Say &ldquo;Hey Siri, run Tracker&rdquo; or tap a home screen button</div>
              </div>
              <div className="sc-device">
                <span className="sc-device-icon">⌚</span>
                <div className="sc-device-name">Apple Watch</div>
                <div className="sc-device-desc">Raise wrist, say &ldquo;Hey Siri, run Tracker&rdquo; — log from the gym floor</div>
              </div>
              <div className="sc-device">
                <span className="sc-device-icon">💻</span>
                <div className="sc-device-name">Mac</div>
                <div className="sc-device-desc">Use Siri or the menu bar shortcut to log from your desktop</div>
              </div>
            </div>
          </div>

          {/* Two-col: Steps left, Download right */}
          <div className="sc-two-col">

            {/* Left — Manual setup steps */}
            <div className="sc-card" style={{ animationDelay: '0.08s' }}>
              <div className="sc-card-label">Manual Setup — if not using the download</div>
              <div className="sc-steps">
                <div className="sc-step">
                  <div className="sc-step-num">1</div>
                  <div className="sc-step-body">
                    <div className="sc-step-title">Open Shortcuts app → tap +</div>
                    <div className="sc-step-desc">Name it <strong>Tracker</strong> to trigger with &ldquo;Hey Siri, run Tracker&rdquo;</div>
                  </div>
                </div>

                <div className="sc-step">
                  <div className="sc-step-num">2</div>
                  <div className="sc-step-body">
                    <div className="sc-step-title">Add: Dictate Text</div>
                    <div className="sc-step-desc">Captures your voice — workout, meal, weight, anything.</div>
                  </div>
                </div>

                <div className="sc-step">
                  <div className="sc-step-num">3</div>
                  <div className="sc-step-body">
                    <div className="sc-step-title">Add: Get Contents of URL</div>
                    <div className="sc-step-desc">Method: POST &nbsp;·&nbsp; URL:</div>
                    <span className="sc-step-code">{endpointUrl}</span>
                    <div className="sc-step-desc" style={{ marginTop: 8 }}>Authorization header:</div>
                    <span className="sc-step-token">Bearer {userId}</span>
                    <div className="sc-step-desc" style={{ marginTop: 8 }}>Body → JSON:</div>
                    <span className="sc-step-code">text → Dictated Text</span>
                    <span className="sc-step-code" style={{ marginTop: 4 }}>source → shortcut</span>
                  </div>
                </div>

                <div className="sc-step">
                  <div className="sc-step-num">4</div>
                  <div className="sc-step-body">
                    <div className="sc-step-title">Add: Show Notification</div>
                    <div className="sc-step-desc">Body: <strong>Logged ✓</strong> — quick confirmation after each log.</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right — Download */}
            <div className="sc-card" style={{ animationDelay: '0.12s' }}>
              <div className="sc-card-label">Quick Install</div>
              <div className="sc-download-card">
                <p className="sc-download-note">
                  Download the shortcut directly to your iPhone.
                  Your token is <strong>pre-configured</strong> — install and you&apos;re ready.
                </p>
                <a href="/api/shortcut" className="sc-download-btn">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="7 10 12 15 17 10" />
                    <line x1="12" x2="12" y1="15" y2="3" />
                  </svg>
                  Download MrTracker.shortcut
                </a>
                <p className="sc-download-prompt">
                  iOS will show a one-time prompt — &ldquo;Allow Untrusted Shortcut&rdquo;.<br />
                  Enable it once in <strong>Settings → Shortcuts</strong> and install.
                </p>
              </div>
            </div>

          </div>
        </div>
      </div>
    </>
  )
}
