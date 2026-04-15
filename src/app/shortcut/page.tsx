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
  max-width: 800px; margin: 0 auto;
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
  max-width: 800px; margin: 0 auto;
  padding: 0 36px;
}
.sc-hero {
  padding: 32px 0 40px;
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
  line-height: 1.6; max-width: 480px;
}

/* Cards */
.sc-card {
  background: rgba(255,255,255,0.08);
  backdrop-filter: blur(40px) saturate(120%);
  -webkit-backdrop-filter: blur(40px) saturate(120%);
  border: 1px solid rgba(255,255,255,0.15);
  border-radius: 24px; padding: 24px 26px;
  position: relative;
  box-shadow:
    0 20px 40px rgba(0,0,0,0.06),
    inset 0 1px 0 rgba(255,255,255,0.28);
  margin-bottom: 14px;
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
  margin-bottom: 14px;
}

/* Token row */
.sc-token-row {
  display: flex; align-items: center; gap: 10px;
}
.sc-token-val {
  flex: 1; min-width: 0;
  font-size: 13px; font-weight: 300; color: rgba(45,45,45,0.70);
  background: rgba(255,255,255,0.16);
  border: 1px solid rgba(255,255,255,0.28);
  border-radius: 10px; padding: 10px 14px;
  overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
  letter-spacing: 0.02em;
}
.sc-copy-btn {
  flex-shrink: 0;
  padding: 9px 16px;
  background: rgba(255,255,255,0.18); color: rgba(45,45,45,0.65);
  font-family: 'Outfit', sans-serif;
  font-size: 12px; font-weight: 300; letter-spacing: 0.02em;
  border-radius: 20px; border: 1px solid rgba(255,255,255,0.30); cursor: pointer;
  transition: background 0.15s, transform 0.15s;
  white-space: nowrap;
}
.sc-copy-btn:hover { background: rgba(255,255,255,0.30); transform: translateY(-1px); }
.sc-copy-btn.copied {
  background: rgba(212,224,190,0.30);
  border-color: rgba(212,224,190,0.45);
  color: rgba(45,45,45,0.80);
}
.sc-token-note {
  font-size: 11.5px; font-weight: 300; color: rgba(45,45,45,0.42);
  margin-top: 8px; line-height: 1.5;
}

/* Steps */
.sc-steps { display: flex; flex-direction: column; gap: 10px; }
.sc-step {
  display: flex; gap: 14px; align-items: flex-start;
  padding: 14px 16px;
  background: rgba(255,255,255,0.10);
  border: 1px solid rgba(255,255,255,0.18);
  border-radius: 14px;
}
.sc-step-num {
  width: 24px; height: 24px; border-radius: 50%; flex-shrink: 0;
  background: #1c1c1e; color: #fff;
  display: flex; align-items: center; justify-content: center;
  font-size: 11px; font-weight: 400;
  margin-top: 1px;
}
.sc-step-body { flex: 1; }
.sc-step-title {
  font-size: 13px; font-weight: 400; color: #2d2d2d;
  margin-bottom: 4px;
}
.sc-step-desc {
  font-size: 12px; font-weight: 300; color: rgba(45,45,45,0.52);
  line-height: 1.55;
}
.sc-step-code {
  display: inline-block; margin-top: 6px;
  font-size: 11.5px; font-weight: 300;
  background: rgba(255,255,255,0.22);
  border: 1px solid rgba(255,255,255,0.35);
  border-radius: 8px; padding: 5px 10px;
  color: rgba(45,45,45,0.72); letter-spacing: 0.01em;
  font-family: 'Outfit', monospace;
}

/* Test button */
.sc-test-row {
  display: flex; align-items: center; gap: 12px;
  margin-top: 6px; flex-wrap: wrap;
}
.sc-test-btn {
  display: inline-flex; align-items: center; gap: 7px;
  padding: 10px 18px;
  background: rgba(212,224,190,0.18); color: rgba(45,45,45,0.72);
  font-family: 'Outfit', sans-serif;
  font-size: 12px; font-weight: 300; letter-spacing: 0.02em;
  border-radius: 20px; border: 1px solid rgba(212,224,190,0.35); cursor: pointer;
  box-shadow: inset 0 1px 0 rgba(255,255,255,0.22);
  transition: transform 0.15s, background 0.15s, opacity 0.15s;
}
.sc-test-btn:hover:not(:disabled) { transform: translateY(-1px); background: rgba(212,224,190,0.28); }
.sc-test-btn:disabled { opacity: 0.50; cursor: not-allowed; }
.sc-test-spinner {
  width: 11px; height: 11px;
  border: 1.5px solid rgba(45,45,45,0.2);
  border-top-color: rgba(45,45,45,0.65);
  border-radius: 50%;
  animation: scSpin 0.65s linear infinite;
}
@keyframes scSpin { to { transform: rotate(360deg); } }
.sc-test-result {
  font-size: 11.5px; font-weight: 300; letter-spacing: 0.02em;
}
.sc-test-ok  { color: rgba(212,224,190,0.95); }
.sc-test-err { color: rgba(220,80,60,0.9); }

/* Download button */
.sc-download-btn {
  display: inline-flex; align-items: center; gap: 8px;
  padding: 11px 20px;
  background: #1c1c1e; color: #fff;
  font-family: 'Outfit', sans-serif;
  font-size: 13px; font-weight: 300; letter-spacing: 0.02em;
  border-radius: 999px; text-decoration: none;
  box-shadow: 0 4px 12px rgba(0,0,0,0.18);
  transition: opacity 0.15s, transform 0.15s;
}
.sc-download-btn:hover { opacity: 0.82; transform: translateY(-1px); }

/* Devices */
.sc-devices { display: flex; flex-direction: column; gap: 12px; }
.sc-device {
  display: flex; align-items: flex-start; gap: 14px;
  padding: 12px 14px;
  background: rgba(255,255,255,0.10);
  border: 1px solid rgba(255,255,255,0.18);
  border-radius: 14px;
}
.sc-device-icon { font-size: 22px; line-height: 1; margin-top: 2px; }
.sc-device-name { font-size: 13px; font-weight: 400; color: #2d2d2d; margin-bottom: 3px; }
.sc-device-desc { font-size: 12px; font-weight: 300; color: rgba(45,45,45,0.52); line-height: 1.5; }

/* Loading / unauthed states */
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

@media (max-width: 600px) {
  .sc-header { padding: 16px 20px; }
  .sc-content { padding: 0 18px; }
  .sc-hero { padding: 24px 0 28px; }
}
`

// ─── Component ───────────────────────────────────────────────────────────────
export default function ShortcutSetupPage() {
  const [userId, setUserId] = useState<string | null>(null)
  const [authReady, setAuthReady] = useState(false)
  const [appUrl, setAppUrl] = useState('')

  // Copy states
  const [copiedId, setCopiedId] = useState(false)
  const [copiedUrl, setCopiedUrl] = useState(false)

  // Test ping
  const [testing, setTesting] = useState(false)
  const [testResult, setTestResult] = useState<{ ok: boolean; msg: string } | null>(null)

  useEffect(() => {
    setAppUrl(process.env.NEXT_PUBLIC_APP_URL || window.location.origin)
    const supabase = createSupabaseBrowser()
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUserId(user?.id ?? null)
      setAuthReady(true)
    })
  }, [])

  function copy(text: string, which: 'id' | 'url') {
    navigator.clipboard.writeText(text)
    if (which === 'id') { setCopiedId(true); setTimeout(() => setCopiedId(false), 2000) }
    else { setCopiedUrl(true); setTimeout(() => setCopiedUrl(false), 2000) }
  }

  async function testShortcut() {
    setTesting(true)
    setTestResult(null)
    try {
      const res = await fetch('/api/log', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userId}`,
        },
        body: JSON.stringify({ text: 'Shortcut test ping', source: 'shortcut' }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed')
      setTestResult({ ok: true, msg: 'Connection works ✓' })
    } catch (err: unknown) {
      setTestResult({ ok: false, msg: err instanceof Error ? err.message : 'Failed' })
    } finally {
      setTesting(false)
      setTimeout(() => setTestResult(null), 5000)
    }
  }

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
              No screen taps. No app to open. MrTracker logs and analyses everything for you.
            </p>
          </div>

          {/* Works on */}
          <div className="sc-card">
            <div className="sc-card-label">Works on</div>
            <div className="sc-devices">
              <div className="sc-device">
                <span className="sc-device-icon">📱</span>
                <div>
                  <div className="sc-device-name">iPhone</div>
                  <div className="sc-device-desc">Say &ldquo;Hey Siri, run Tracker&rdquo; or tap a home screen button</div>
                </div>
              </div>
              <div className="sc-device">
                <span className="sc-device-icon">⌚</span>
                <div>
                  <div className="sc-device-name">Apple Watch</div>
                  <div className="sc-device-desc">Raise wrist, say &ldquo;Hey Siri, run Tracker&rdquo; — log from the gym floor</div>
                </div>
              </div>
              <div className="sc-device">
                <span className="sc-device-icon">💻</span>
                <div>
                  <div className="sc-device-name">Mac</div>
                  <div className="sc-device-desc">Use Siri or the menu bar shortcut to log from your desktop</div>
                </div>
              </div>
            </div>
          </div>

          {/* Your token */}
          <div className="sc-card" style={{ animationDelay: '0.05s' }}>
            <div className="sc-card-label">Your Private Token</div>
            <div className="sc-token-row">
              <div className="sc-token-val">{userId}</div>
              <button className={`sc-copy-btn${copiedId ? ' copied' : ''}`}
                onClick={() => copy(userId!, 'id')}>
                {copiedId ? 'Copied ✓' : 'Copy'}
              </button>
            </div>
            <p className="sc-token-note">
              This identifies you when Siri logs your entry. Keep it private — paste it into the shortcut once and forget it.
            </p>
          </div>

          {/* Download */}
          <div className="sc-card" style={{ animationDelay: '0.10s' }}>
            <div className="sc-card-label">Download Shortcut</div>
            <p className="sc-token-note" style={{ marginBottom: 14 }}>
              Tap on your iPhone to install. Then open it, find the <strong>Authorization</strong> header, and replace the value with <strong>Bearer + your token above</strong>.
            </p>
            <a href="/MrTracker.shortcut" className="sc-download-btn">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" x2="12" y1="15" y2="3" />
              </svg>
              Download MrTracker.shortcut
            </a>
          </div>

          {/* Setup steps */}
          <div className="sc-card" style={{ animationDelay: '0.15s' }}>
            <div className="sc-card-label">Setup — 5 steps, done once</div>
            <div className="sc-steps">
              <div className="sc-step">
                <div className="sc-step-num">1</div>
                <div className="sc-step-body">
                  <div className="sc-step-title">Open Shortcuts app → tap +</div>
                  <div className="sc-step-desc">Name it <strong>Tracker</strong> — this lets you say &ldquo;Hey Siri, run Tracker&rdquo; from any Apple device.</div>
                </div>
              </div>

              <div className="sc-step">
                <div className="sc-step-num">2</div>
                <div className="sc-step-body">
                  <div className="sc-step-title">Add action: Dictate Text</div>
                  <div className="sc-step-desc">This captures your voice. Speak anything — workout, meal, weight, how you feel.</div>
                </div>
              </div>

              <div className="sc-step">
                <div className="sc-step-num">3</div>
                <div className="sc-step-body">
                  <div className="sc-step-title">Add action: Get Contents of URL</div>
                  <div className="sc-step-desc">Tap <strong>Show More</strong> → Method: <strong>POST</strong>. Configure:</div>
                  <div className="sc-step-code">URL: {endpointUrl}</div>
                  <br />
                  <div className="sc-step-desc">Under <strong>Headers</strong>, add:</div>
                  <div className="sc-step-code">Authorization: Bearer {userId}</div>
                  <br />
                  <div className="sc-step-desc">Under <strong>Request Body</strong> → JSON, add two fields:</div>
                  <div className="sc-step-code">text → Dictated Text</div>
                  <div className="sc-step-code">source → shortcut</div>
                </div>
              </div>

              <div className="sc-step">
                <div className="sc-step-num">4</div>
                <div className="sc-step-body">
                  <div className="sc-step-title">Add action: Show Notification</div>
                  <div className="sc-step-desc">Quick confirmation so you know it logged. Set body to <strong>Logged ✓</strong></div>
                </div>
              </div>

              <div className="sc-step">
                <div className="sc-step-num">5</div>
                <div className="sc-step-body">
                  <div className="sc-step-title">Test it — then you&apos;re done forever</div>
                  <div className="sc-step-desc">
                    Say &ldquo;Hey Siri, run Tracker&rdquo; and speak a log. Then come back and hit <strong>Test connection</strong> below to confirm it&apos;s working.
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Test */}
          <div className="sc-card" style={{ animationDelay: '0.20s' }}>
            <div className="sc-card-label">Test Your Connection</div>
            <p className="sc-token-note" style={{ marginBottom: 12 }}>
              Once you&apos;ve set up the shortcut, tap below to confirm MrTracker can receive your logs.
            </p>
            <div className="sc-token-row">
              <div className="sc-token-val" style={{ fontSize: 11 }}>{endpointUrl}</div>
              <button className={`sc-copy-btn${copiedUrl ? ' copied' : ''}`}
                onClick={() => copy(endpointUrl, 'url')}>
                {copiedUrl ? 'Copied ✓' : 'Copy'}
              </button>
            </div>
            <div className="sc-test-row">
              <button className="sc-test-btn" onClick={testShortcut} disabled={testing}>
                {testing && <span className="sc-test-spinner" />}
                {testing ? 'Testing…' : 'Test connection'}
              </button>
              {testResult && (
                <span className={`sc-test-result ${testResult.ok ? 'sc-test-ok' : 'sc-test-err'}`}>
                  {testResult.msg}
                </span>
              )}
            </div>
          </div>

        </div>
      </div>
    </>
  )
}
