'use client'

import { useState, useEffect, useRef } from 'react'
import { createSupabaseBrowser } from '@/lib/supabase'

// ─── Content ────────────────────────────────────────────────────────────────
const TYPEWRITER_PHRASES = [
  'Hey Siri, run Tracker…',
  'Bench 3×8 at 80kg done.',
  'Chicken salad, 2 shakes.',
  'Weight 72.4 this morning.',
  'AI digest ready. ✓',
]

const LOGS = [
  {
    raw: 'Bench press 3 sets of 8 at 80kg, good pump. Finished with cable flys.',
    tags: ['Bench: 80kg × 3×8', 'Cable Flys', '~45min'],
    time: 'Just now',
  },
  {
    raw: 'Had chicken caesar salad and two protein shakes after gym.',
    tags: ['Lunch: Caesar Salad', 'Protein × 2', '~680 kcal'],
    time: '1:30 PM',
  },
  {
    raw: 'Weight 72.4 this morning, feeling good',
    tags: ['72.4 kg', 'Week avg: 72.1 kg'],
    time: '7:08 AM',
  },
]

// ─── Styles ─────────────────────────────────────────────────────────────────
const CSS = `
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

body:has(.v1-root) { background: #a69c97; }

/* ── Root ──────────────────────────────────────────────── */
.v1-root {
  min-height: 100dvh;
  background-color: #a69c97;
  font-family: 'Outfit', sans-serif;
  color: #2d2d2d;
  position: relative;
  -webkit-font-smoothing: antialiased;
}

/* ── Demo banner ────────────────────────────────────────── */
.v1-demo-banner {
  position: relative; z-index: 20;
  text-align: center; padding: 7px 20px;
  font-size: 11.5px; font-weight: 300; letter-spacing: 0.01em;
  color: rgba(45,45,45,0.52);
  background: rgba(255,255,255,0.10);
  border-bottom: 1px solid rgba(255,255,255,0.13);
}
.v1-demo-link {
  color: rgba(45,45,45,0.72); font-weight: 400;
  text-decoration: underline; text-underline-offset: 2px;
}
.v1-demo-link:hover { color: #2d2d2d; }
.v1-ambient {
  position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
  z-index: 0; pointer-events: none;
  background:
    radial-gradient(circle at 20% 30%, #c4b8b1 0%, transparent 50%),
    radial-gradient(circle at 80% 70%, #8a827d 0%, transparent 50%),
    radial-gradient(circle at 50% 50%, #e2dcd8 0%, transparent 60%);
  filter: blur(60px);
  animation: breathe 20s infinite alternate ease-in-out;
}
@keyframes breathe {
  0%   { transform: scale(1);   opacity: 0.8; }
  100% { transform: scale(1.1); opacity: 1; }
}

/* ── Header ────────────────────────────────────────────── */
.v1-header {
  position: relative; z-index: 20;
  display: flex; align-items: center; justify-content: space-between;
  padding: 22px 36px;
  max-width: 1240px; margin: 0 auto;
}
.v1-logo-badge {
  background: #1c1c1e; color: #fff;
  padding: 8px 16px; border-radius: 20px;
  font-size: 12px; font-weight: 300; letter-spacing: 0.04em;
  box-shadow: inset 0 1px 1px rgba(255,255,255,0.10), 0 8px 16px rgba(0,0,0,0.15);
}
.v1-header-actions { display: flex; gap: 8px; align-items: center; }
.v1-icon-btn {
  width: 32px; height: 32px; border-radius: 50%;
  border: 1px solid rgba(255,255,255,0.22); background: transparent;
  display: flex; align-items: center; justify-content: center;
  color: #2d2d2d; cursor: pointer;
  transition: background 0.2s, border-color 0.2s;
}
.v1-icon-btn:hover { background: rgba(255,255,255,0.20); border-color: rgba(255,255,255,0.45); }
.v1-icon-btn svg { width: 14px; height: 14px; }
.v1-signin-link {
  font-size: 12px; font-weight: 300; color: rgba(45,45,45,0.65);
  text-decoration: none; padding: 6px 14px;
  border: 1px solid rgba(255,255,255,0.25); border-radius: 999px;
  background: rgba(255,255,255,0.12);
  transition: background 0.2s;
}
.v1-signin-link:hover { background: rgba(255,255,255,0.22); }
.v1-signout-btn {
  font-size: 12px; font-weight: 300; color: rgba(45,45,45,0.55);
  cursor: pointer; padding: 6px 14px;
  border: 1px solid rgba(255,255,255,0.20); border-radius: 999px;
  background: transparent; font-family: 'Outfit', sans-serif;
  transition: background 0.2s;
}
.v1-signout-btn:hover { background: rgba(255,255,255,0.14); }
.v1-user-email {
  font-size: 11.5px; font-weight: 300; color: rgba(45,45,45,0.45);
  max-width: 140px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
}

/* ── Hero ──────────────────────────────────────────────── */
.v1-hero {
  position: relative; z-index: 10;
  text-align: center;
  padding: 48px 24px 36px;
  max-width: 680px; margin: 0 auto;
  animation: fadeInUp 0.7s ease both;
}
.v1-hero h1 {
  font-size: clamp(1.9rem, 4.5vw, 3.4rem);
  font-weight: 200; letter-spacing: -0.03em; line-height: 1.1;
  margin-bottom: 12px; color: #111;
}
.v1-hero-sub {
  font-size: 14px; font-weight: 300; color: rgba(45,45,45,0.55);
  line-height: 1.55; margin-bottom: 32px;
  max-width: 380px; margin-left: auto; margin-right: auto;
}

/* Typewriter capsule (desktop only) */
.v1-capsule {
  display: inline-flex; align-items: center; gap: 12px;
  background: rgba(255,255,255,0.18);
  backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255,255,255,0.30);
  border-radius: 999px;
  padding: 8px 24px 8px 8px;
  box-shadow: 0 8px 28px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,0.40);
  max-width: 420px; position: relative; overflow: hidden;
}
.v1-capsule-fade {
  position: absolute; right: 0; top: 0; bottom: 0; width: 56px;
  background: linear-gradient(90deg, transparent, rgba(166,156,151,0.55));
  pointer-events: none; z-index: 2;
}
.v1-orb {
  width: 42px; height: 42px; border-radius: 50%; flex-shrink: 0;
  background: rgba(255,255,255,0.22);
  border: 1px solid rgba(255,255,255,0.60);
  position: relative; overflow: hidden;
}
.v1-orb-cloud {
  position: absolute; inset: -6px; border-radius: 50%;
  background:
    radial-gradient(circle at 30% 35%, rgba(212,224,190,0.9) 0%, transparent 55%),
    radial-gradient(circle at 70% 65%, rgba(196,184,177,0.7) 0%, transparent 55%);
  animation: rotateCloud 10s linear infinite; opacity: 0.8;
}
.v1-orb-streak {
  position: absolute; top: 50%; left: 50%;
  transform: translate(-50%,-50%); z-index: 2;
  animation: pulseStreak 4s ease-in-out infinite;
}
.v1-capsule-text {
  font-size: 14px; font-weight: 300; letter-spacing: 0.01em;
  color: #2d2d2d; white-space: nowrap; z-index: 1;
}
.v1-cursor {
  display: inline-block; width: 1.5px; height: 1em;
  vertical-align: text-bottom; background: rgba(45,45,45,0.6);
  margin-left: 2px; animation: blink 1s step-end infinite;
}
.v1-hero-capsule-wrap { display: block; }

/* ── Bento Grid ────────────────────────────────────────── */
.v1-bento {
  position: relative; z-index: 10;
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  align-items: start;
  gap: 18px;
  max-width: 1240px; margin: 0 auto;
  padding: 0 36px 120px;
}
.v1-card {
  background: rgba(255,255,255,0.08);
  backdrop-filter: blur(40px) saturate(120%);
  -webkit-backdrop-filter: blur(40px) saturate(120%);
  border: 1px solid rgba(255,255,255,0.15);
  border-radius: 28px; padding: 26px;
  position: relative; overflow: visible;
  box-shadow:
    0 24px 48px rgba(0,0,0,0.06),
    inset 0 1px 0 rgba(255,255,255,0.28),
    inset 0 0 28px rgba(255,255,255,0.05);
  animation: fadeInUp 0.7s ease both;
}
.v1-card::before {
  content: '';
  position: absolute; top: 0; left: 16px; right: 16px; height: 1px;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.55), transparent);
  pointer-events: none; border-radius: 1px;
}
/* Desktop: Streak full-width → Digest | CTA → Logs full-width */
.v1-card-heatmap { grid-column: 1 / span 12; animation-delay: 0.08s; }
.v1-card-digest  { grid-column: 1 / span 6;  animation-delay: 0.14s; }
.v1-card-cta     { grid-column: 7 / span 6;  animation-delay: 0.20s; }
.v1-card-logs    { grid-column: 1 / span 12; animation-delay: 0.26s; }

.v1-card-label {
  font-size: 10px; font-weight: 400; letter-spacing: 0.10em;
  text-transform: uppercase; color: rgba(45,45,45,0.42);
  margin-bottom: 16px;
}
.v1-card-label-row {
  display: flex; align-items: center; justify-content: space-between;
  margin-bottom: 16px;
}
.v1-card-label-row .v1-card-label { margin-bottom: 0; }
.v1-see-all {
  font-size: 11px; font-weight: 300; color: rgba(45,45,45,0.45);
  text-decoration: none; letter-spacing: 0.02em;
  padding: 3px 10px; border-radius: 999px;
  background: rgba(255,255,255,0.20);
  border: 1px solid rgba(255,255,255,0.30);
  transition: background 0.15s;
}
.v1-see-all:hover { background: rgba(255,255,255,0.32); }

/* ── Heatmap ───────────────────────────────────────────── */

/* Subheader row: "Last 30 days" left | "Less ◻◻◻ More" right */
.v1-heatmap-subheader {
  display: flex; align-items: center; justify-content: space-between;
  margin-bottom: 16px;
}
.v1-heatmap-period {
  font-size: 10px; font-weight: 300; letter-spacing: 0.04em;
  color: rgba(45,45,45,0.38);
}
.v1-heatmap-legend {
  display: flex; align-items: center; gap: 4px;
  font-size: 10px; color: rgba(45,45,45,0.38);
}
.v1-heatmap-legend .v1-heat-cell {
  width: 10px; height: 10px; cursor: default; flex-shrink: 0;
}
.v1-heatmap-legend .v1-heat-cell:hover { transform: none; }
.v1-heatmap-legend .v1-heat-cell::after { display: none; }

/* Body: grid half (left, centered) | stats half (right) */
.v1-heatmap-body {
  display: flex; align-items: flex-start; gap: 0;
}
/* Grid occupies left 50% — grid itself is centered inside */
.v1-heatmap-grid-wrap {
  flex: 1;
  display: flex; justify-content: center;
}
.v1-heatmap-grid {
  display: grid;
  grid-template-rows: repeat(3, 13px);
  grid-auto-flow: column;
  grid-auto-columns: 13px;
  gap: 3px; width: max-content;
}
.v1-heat-cell {
  width: 13px; height: 13px; border-radius: 3px;
  cursor: pointer; transition: transform 0.12s;
  position: relative;
}
.v1-heat-cell::after {
  content: attr(data-tip);
  position: absolute;
  bottom: calc(100% + 6px);
  left: 50%; transform: translateX(-50%);
  background: #1c1c1e; color: rgba(255,255,255,0.88);
  font-family: 'Outfit', sans-serif;
  font-size: 10px; font-weight: 300;
  padding: 4px 8px; border-radius: 7px;
  white-space: nowrap; pointer-events: none;
  opacity: 0; transition: opacity 0.15s;
  z-index: 50;
  box-shadow: 0 4px 12px rgba(0,0,0,0.18);
}
.v1-heat-cell:hover { transform: scale(1.5); }
.v1-heat-cell:hover::after { opacity: 1; }
.v1-heat-0 { background: rgba(255,255,255,0.10); }
.v1-heat-1 { background: rgba(255,255,255,0.38); }
.v1-heat-2 { background: rgba(255,255,255,0.68); }
.v1-heat-3 { background: #fff; box-shadow: 0 0 6px rgba(255,255,255,0.45); }

/* Stats — starts slightly left of center */
.v1-heatmap-stats {
  flex: 1;
  display: flex; gap: 28px; align-items: flex-start;
  padding-top: 0;
  margin-left: -72px;
}
.v1-heatmap-stat { display: flex; flex-direction: column; gap: 3px; }
.v1-heatmap-stat-val {
  font-size: 26px; font-weight: 200; color: rgba(45,45,45,0.82);
  letter-spacing: -0.03em; line-height: 1;
}
.v1-heatmap-stat-key {
  font-size: 10px; font-weight: 300; color: rgba(45,45,45,0.38);
  text-transform: uppercase; letter-spacing: 0.06em;
}

/* Mobile (≤860px): grid centered, stats horizontal row below */
@media (max-width: 860px) {
  .v1-heatmap-body {
    flex-direction: column; align-items: center; gap: 20px;
  }
  .v1-heatmap-grid-wrap { flex: none; justify-content: center; }
  .v1-heatmap-stats { flex: none; gap: 24px; margin-left: 0; }
}
@media (max-width: 600px) {
  .v1-heatmap-stat-val { font-size: 20px; }
  .v1-heatmap-stats { gap: 18px; }
}

/* ── Shortcut CTA Card ─────────────────────────────────── */
.v1-cta-tracking-label {
  font-size: 10px; font-weight: 400; letter-spacing: 0.10em;
  text-transform: uppercase; color: rgba(45,45,45,0.42);
  margin-bottom: 14px;
}
.v1-cta-title {
  font-size: 14px; font-weight: 300; letter-spacing: -0.01em;
  color: rgba(45,45,45,0.65); margin-bottom: 14px; line-height: 1.4;
}
.v1-cta-body {
  font-size: 12px; font-weight: 300; color: rgba(45,45,45,0.48);
  line-height: 1.65; margin-bottom: 18px;
}
.v1-cta-steps {
  display: flex; flex-direction: column; gap: 6px; margin-bottom: 14px;
}
.v1-cta-step {
  display: flex; align-items: center; gap: 8px;
  font-size: 12px; font-weight: 300; color: rgba(45,45,45,0.55);
}
.v1-cta-step-num {
  width: 18px; height: 18px; border-radius: 50%; flex-shrink: 0;
  background: rgba(255,255,255,0.30); border: 1px solid rgba(255,255,255,0.50);
  display: flex; align-items: center; justify-content: center;
  font-size: 10px; font-weight: 500; color: rgba(45,45,45,0.65);
}
.v1-cta-btn {
  display: inline-flex; align-items: center; gap: 8px;
  padding: 10px 18px;
  background: rgba(255,255,255,0.16); color: rgba(45,45,45,0.65);
  font-family: 'Outfit', sans-serif;
  font-size: 12px; font-weight: 300; letter-spacing: 0.02em;
  border-radius: 30px; border: 1px solid rgba(255,255,255,0.32); cursor: pointer; text-decoration: none;
  box-shadow: inset 0 1px 0 rgba(255,255,255,0.30);
  transition: transform 0.2s, background 0.2s;
}
.v1-cta-btn:hover { transform: translateY(-1px); background: rgba(255,255,255,0.26); }

/* ── Log Card ──────────────────────────────────────────── */
.v1-logs-list { display: flex; flex-direction: column; gap: 10px; }
.v1-log-item {
  background: rgba(255,255,255,0.12);
  border: 1px solid rgba(255,255,255,0.20);
  border-radius: 12px; padding: 13px 14px;
  box-shadow: inset 0 1px 0 rgba(255,255,255,0.18);
}
.v1-log-raw {
  font-size: 13px; font-weight: 300; font-style: italic; color: #2d2d2d;
  line-height: 1.5; margin-bottom: 9px;
}
.v1-log-quote { color: rgba(45,45,45,0.32); font-style: normal; }
.v1-log-tags { display: flex; flex-wrap: wrap; gap: 5px; align-items: center; margin-bottom: 4px; }
.v1-log-footer { display: flex; justify-content: flex-end; padding-top: 6px; }
.v1-tag {
  font-size: 11px; font-weight: 300; color: rgba(45,45,45,0.62);
  padding: 3px 9px; border-radius: 999px;
  background: rgba(255,255,255,0.36);
  border: 1px solid rgba(255,255,255,0.48);
}
.v1-tag-time {
  font-size: 11px; font-weight: 300; color: rgba(45,45,45,0.35);
  background: transparent; border: none; padding-left: 2px;
}

/* ── Digest Card ───────────────────────────────────────── */
.v1-digest-body { display: flex; flex-direction: column; gap: 16px; }
.v1-digest-metric { display: flex; align-items: baseline; gap: 10px; }
.v1-digest-value {
  font-size: 42px; font-weight: 300; letter-spacing: -0.03em;
  line-height: 1; color: rgba(255,255,255,0.88);
}
.v1-digest-label { font-size: 13px; font-weight: 300; color: rgba(45,45,45,0.48); }
.v1-digest-summary {
  font-size: 13px; font-weight: 300; color: rgba(45,45,45,0.52);
  line-height: 1.7;
}
.v1-digest-summary strong { color: #2d2d2d; font-weight: 400; }
.v1-digest-trends { display: flex; flex-direction: column; gap: 7px; }
.v1-digest-row {
  display: flex; justify-content: space-between; align-items: center;
  font-size: 12px; font-weight: 300; color: rgba(45,45,45,0.48);
  padding: 8px 12px;
  background: rgba(255,255,255,0.09);
  border: 1px solid rgba(255,255,255,0.14);
  border-radius: 10px;
}
.v1-digest-row-val { color: #2d2d2d; font-weight: 400; }
.v1-sparkline { flex-shrink: 0; }

/* ── Input Bar ─────────────────────────────────────────── */
.v1-input-bar {
  position: fixed; bottom: 0; left: 0; right: 0; z-index: 100;
  padding: 20px 24px calc(16px + env(safe-area-inset-bottom, 0px));
  background: linear-gradient(to top,
    rgba(14, 13, 15, 0.82) 0%,
    rgba(14, 13, 15, 0.55) 60%,
    transparent 100%);
  backdrop-filter: blur(2px);
  -webkit-backdrop-filter: blur(2px);
  pointer-events: none;
}
.v1-input-inner {
  display: flex; align-items: flex-end; gap: 10px;
  background: rgba(18, 17, 20, 0.82);
  backdrop-filter: blur(32px) saturate(140%);
  -webkit-backdrop-filter: blur(32px) saturate(140%);
  border: 1px solid rgba(255,255,255,0.09);
  border-radius: 24px;
  padding: 12px 10px 10px 16px;
  max-width: 680px; margin: 0 auto;
  box-shadow: 0 8px 32px rgba(0,0,0,0.28), inset 0 1px 0 rgba(255,255,255,0.06);
  pointer-events: all;
}
.v1-input-field {
  flex: 1; min-width: 0; border: none; background: transparent; outline: none;
  font-family: 'Outfit', sans-serif;
  font-size: 15px; font-weight: 300; color: rgba(255,255,255,0.88); line-height: 1.5;
  align-self: flex-end; padding-bottom: 6px;
}
.v1-input-field::placeholder { color: rgba(255,255,255,0.32); }
.v1-input-actions { display: flex; align-items: center; gap: 6px; flex-shrink: 0; }

/* Desktop: taller input box */
@media (min-width: 601px) {
  .v1-input-inner {
    min-height: 88px;
    border-radius: 28px;
    padding: 14px 10px 10px 18px;
  }
}
.v1-input-mic {
  width: 34px; height: 34px; border-radius: 50%; flex-shrink: 0;
  background: rgba(255,255,255,0.10); border: 1px solid rgba(255,255,255,0.14);
  display: flex; align-items: center; justify-content: center;
  color: rgba(255,255,255,0.70); cursor: pointer;
  transition: background 0.15s, transform 0.15s;
}
.v1-input-mic:hover { background: rgba(255,255,255,0.18); transform: scale(1.06); }
.v1-input-camera {
  width: 34px; height: 34px; border-radius: 50%; flex-shrink: 0;
  background: rgba(255,255,255,0.10); border: 1px solid rgba(255,255,255,0.14);
  display: flex; align-items: center; justify-content: center;
  color: rgba(255,255,255,0.65); cursor: pointer;
  transition: background 0.15s;
}
.v1-input-camera:hover { background: rgba(255,255,255,0.18); }
.v1-input-send {
  width: 34px; height: 34px; border-radius: 50%; flex-shrink: 0;
  background: rgba(255,255,255,0.90); border: none; cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  color: #1c1c1e;
  box-shadow: 0 3px 10px rgba(0,0,0,0.22);
  transition: transform 0.15s, background 0.15s, opacity 0.15s;
}
.v1-input-send:hover:not(:disabled) { transform: scale(1.07); background: #fff; }
.v1-input-send:disabled { opacity: 0.45; cursor: not-allowed; }

.v1-send-spinner {
  width: 13px; height: 13px;
  border: 1.5px solid rgba(28,28,30,0.3);
  border-top-color: #1c1c1e;
  border-radius: 50%;
  animation: v1Spin 0.65s linear infinite;
}
@keyframes v1Spin { to { transform: rotate(360deg); } }

.v1-input-feedback {
  font-size: 11px; font-weight: 300; letter-spacing: 0.02em;
  padding: 0 4px 8px;
  text-align: center;
}
.v1-input-feedback-error { color: rgba(220,80,60,0.9); }
.v1-input-feedback-ok { color: rgba(212,224,190,1); }

/* ── Keyframes ─────────────────────────────────────────── */
@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(14px); }
  to   { opacity: 1; transform: translateY(0); }
}
@keyframes rotateCloud {
  0%   { transform: rotate(0deg) scale(1); }
  50%  { transform: rotate(180deg) scale(1.10); }
  100% { transform: rotate(360deg) scale(1); }
}
@keyframes pulseStreak {
  0%, 100% { opacity: 0.6; }
  50%       { opacity: 1; filter: drop-shadow(0 0 4px rgba(212,224,190,0.8)); }
}
@keyframes blink { 50% { opacity: 0; } }

/* ── Responsive ────────────────────────────────────────── */
@media (max-width: 860px) {
  .v1-bento { grid-template-columns: 1fr; }
  .v1-card-heatmap { grid-column: 1 / -1; order: 1; }
  .v1-card-digest  { grid-column: 1 / -1; order: 2; }
  .v1-card-cta     { grid-column: 1 / -1; order: 3; }
  .v1-card-logs    { grid-column: 1 / -1; order: 4; }
}

@media (max-width: 600px) {
  .v1-header { padding: 16px 20px; }
  .v1-hero-capsule-wrap { display: none; }
  .v1-hero { padding: 36px 20px 24px; }
  .v1-hero h1 { font-size: 2.0rem; }
  .v1-hero-sub { margin-bottom: 0; }
  .v1-bento { padding: 16px 16px 110px; gap: 12px; }
  .v1-card { padding: 20px 18px; border-radius: 22px; }
  .v1-digest-value { font-size: 34px; }
  .v1-input-bar { padding: 16px 16px calc(10px + env(safe-area-inset-bottom, 0px)); }
  .v1-input-field { font-size: 14px; }
}

@media (min-width: 601px) and (max-width: 860px) {
  .v1-hero { padding: 44px 28px 32px; }
  .v1-bento { padding: 0 24px 110px; }
}

@media (prefers-reduced-motion: reduce) {
  .v1-ambient, .v1-orb-cloud, .v1-orb-streak,
  .v1-cursor, .v1-card, .v1-hero { animation: none !important; }
}
`

// ─── Component ──────────────────────────────────────────────────────────────
export default function DashboardPage() {
  const [typeText, setTypeText] = useState('')
  const [charIdx, setCharIdx] = useState(0)
  const [isDeleting, setIsDeleting] = useState(false)
  const [phraseIdx, setPhraseIdx] = useState(0)
  const [inputText, setInputText] = useState('')
  const [sending, setSending] = useState(false)
  const [logError, setLogError] = useState('')
  const [logSent, setLogSent] = useState(false)
  const [user, setUser] = useState<{ email?: string } | null>(null)
  const [authReady, setAuthReady] = useState(false)

  // ── Auth detection (persists via Supabase cookie session)
  useEffect(() => {
    const supabase = createSupabaseBrowser()
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user)
      setAuthReady(true)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user ?? null)
    })
    return () => subscription.unsubscribe()
  }, [])

  async function handleSignOut() {
    const supabase = createSupabaseBrowser()
    await supabase.auth.signOut()
    setUser(null)
  }

  async function handleSend() {
    if (!inputText.trim() || sending) return
    setSending(true)
    setLogError('')
    try {
      const res = await fetch('/api/log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: inputText.trim(), source: 'web' }),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to save log')
      }
      setInputText('')
      setLogSent(true)
      setTimeout(() => setLogSent(false), 2000)
    } catch (err: unknown) {
      setLogError(err instanceof Error ? err.message : 'Something went wrong')
      setTimeout(() => setLogError(''), 3000)
    } finally {
      setSending(false)
    }
  }

  // Last 30 days: 3 rows × 10 cols, column-flow (oldest top-left → newest bottom-right)
  const heatData = useRef(
    Array.from({ length: 30 }, (_, i) => {
      // i=0 → 29 days ago, i=29 → today
      const d = new Date()
      d.setDate(d.getDate() - (29 - i))
      const dateLabel = d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long' })
      const bias = i >= 26 ? 0.82 : 0.52
      const active = Math.random() < bias
      const level = active
        ? (Math.random() < 0.35 ? 1 : Math.random() < 0.55 ? 2 : 3) as 1 | 2 | 3
        : 0 as const
      const count = level === 0 ? 0 : level === 1 ? Math.floor(Math.random() * 2) + 1 : level === 2 ? Math.floor(Math.random() * 3) + 2 : Math.floor(Math.random() * 4) + 4
      return { level, count, dateLabel }
    })
  )

  useEffect(() => {
    const phrase = TYPEWRITER_PHRASES[phraseIdx]
    let t: ReturnType<typeof setTimeout>
    if (!isDeleting && charIdx < phrase.length) {
      t = setTimeout(() => { setTypeText(phrase.slice(0, charIdx + 1)); setCharIdx(c => c + 1) }, 72)
    } else if (!isDeleting && charIdx === phrase.length) {
      t = setTimeout(() => setIsDeleting(true), 1800)
    } else if (isDeleting && charIdx > 0) {
      t = setTimeout(() => { setTypeText(phrase.slice(0, charIdx - 1)); setCharIdx(c => c - 1) }, 38)
    } else {
      setIsDeleting(false)
      setPhraseIdx(i => (i + 1) % TYPEWRITER_PHRASES.length)
    }
    return () => clearTimeout(t)
  }, [charIdx, isDeleting, phraseIdx])

  return (
    <div className="v1-root">
      {/* eslint-disable-next-line react/no-danger */}
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <div className="v1-ambient" aria-hidden="true" />

      {/* ── Demo banner (shown only when logged out) ── */}
      {authReady && !user && (
        <div className="v1-demo-banner">
          Viewing demo data —{' '}
          <a href="/login" className="v1-demo-link">Sign in</a> to see your real logs
        </div>
      )}

      {/* ── Header ── */}
      <header className="v1-header">
        <span className="v1-logo-badge">MrTracker 1.0</span>
        <div className="v1-header-actions">
          {authReady && (
            user ? (
              <>
                <span className="v1-user-email">{user.email}</span>
                <button className="v1-signout-btn" onClick={handleSignOut}>Sign out</button>
              </>
            ) : (
              <a href="/login" className="v1-signin-link">Sign in</a>
            )
          )}
          <button className="v1-icon-btn" aria-label="Settings">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
              <circle cx="12" cy="12" r="3" />
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06A1.65 1.65 0 0 0 15 19.4a1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
            </svg>
          </button>
        </div>
      </header>

      {/* ── Hero ── */}
      <section className="v1-hero">
        <h1>Tracking made easy.</h1>
        <p className="v1-hero-sub">
          Just tell MrTracker. Rest is taken care of.<br />
          Connect with Apple Shortcuts — Zero screen taps. No Distraction.
        </p>
        {/* Typewriter capsule — hidden on mobile via CSS */}
        <div className="v1-hero-capsule-wrap">
          <div className="v1-capsule">
            <div className="v1-orb">
              <div className="v1-orb-cloud" />
              <svg className="v1-orb-streak" width="24" height="16" viewBox="0 0 36 24" fill="none">
                <path d="M2 20 C 8 16, 14 4, 18 12 C 22 20, 28 8, 34 4"
                  stroke="url(#sg)" strokeWidth="2.5" strokeLinecap="round" />
                <defs>
                  <linearGradient id="sg" x1="0" y1="0" x2="36" y2="0" gradientUnits="userSpaceOnUse">
                    <stop stopColor="rgba(212,224,190,0.9)" />
                    <stop offset="0.5" stopColor="rgba(255,255,255,0.7)" />
                    <stop offset="1" stopColor="rgba(196,184,177,0.8)" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
            <span className="v1-capsule-text">{typeText}<span className="v1-cursor" /></span>
            <div className="v1-capsule-fade" />
          </div>
        </div>
      </section>

      {/* ── Bento Grid ── */}
      <main className="v1-bento">

        {/* Card 1 — Consistency Streak (last 30 days, 3×10) */}
        <div className="v1-card v1-card-heatmap">
          <div className="v1-card-label">Consistency Streak</div>

          {/* Subheader: Last 30 days [left] · Less→More [right] */}
          <div className="v1-heatmap-subheader">
            <span className="v1-heatmap-period">Last 30 days</span>
            <div className="v1-heatmap-legend">
              <span>Less</span>
              {[0,1,2,3].map(l => <div key={l} className={`v1-heat-cell v1-heat-${l}`} />)}
              <span>More</span>
            </div>
          </div>

          {/* Body: grid centered in left half | stats in right half */}
          <div className="v1-heatmap-body">
            <div className="v1-heatmap-grid-wrap">
              <div className="v1-heatmap-grid" role="img" aria-label="30-day activity heatmap">
                {heatData.current.map((cell, i) => (
                  <div
                    key={i}
                    className={`v1-heat-cell v1-heat-${cell.level}`}
                    data-tip={`${cell.dateLabel}: ${cell.count === 0 ? 'No logs' : `${cell.count} log${cell.count !== 1 ? 's' : ''}`}`}
                  />
                ))}
              </div>
            </div>

            {/* Stats — right 50% on desktop, below on mobile */}
            <div className="v1-heatmap-stats">
              <div className="v1-heatmap-stat">
                <span className="v1-heatmap-stat-val">7</span>
                <span className="v1-heatmap-stat-key">Day streak</span>
              </div>
              <div className="v1-heatmap-stat">
                <span className="v1-heatmap-stat-val">14</span>
                <span className="v1-heatmap-stat-key">Best streak</span>
              </div>
              <div className="v1-heatmap-stat">
                <span className="v1-heatmap-stat-val">21</span>
                <span className="v1-heatmap-stat-key">Logs this month</span>
              </div>
            </div>
          </div>
        </div>

        {/* Card 2 — AI Digest (desktop: col 1-6 row 2 | mobile: order 2) */}
        <div className="v1-card v1-card-digest">
          <div className="v1-card-label">AI Digest</div>
          <div className="v1-digest-body">
            <div className="v1-digest-metric">
              <span className="v1-digest-value">84%</span>
              <span className="v1-digest-label">Weekly Score</span>
            </div>
            <p className="v1-digest-summary">
              You hit <strong>5 of 6 workout days</strong> this week. Protein intake averaged{' '}
              <strong>148g/day</strong> — on target. Sleep improved after cutting late caffeine.
            </p>
            <div className="v1-digest-trends">
              <div className="v1-digest-row">
                <span>Workout Consistency</span>
                <span className="v1-digest-row-val">5 / 6 days</span>
              </div>
              <div className="v1-digest-row">
                <span>Avg Daily Protein</span>
                <span className="v1-digest-row-val">148 g ↑</span>
              </div>
              <div className="v1-digest-row">
                <span>Logs This Week</span>
                <span className="v1-digest-row-val">24 entries</span>
              </div>
            </div>
            <div className="v1-sparkline">
              <svg width="100%" height="48" viewBox="0 0 300 48"
                preserveAspectRatio="none" aria-hidden="true">
                <defs>
                  <linearGradient id="sg2" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="rgba(255,255,255,0.25)" />
                    <stop offset="100%" stopColor="rgba(255,255,255,0)" />
                  </linearGradient>
                </defs>
                <path d="M0 38 C 40 38, 50 14, 80 20 C 110 26, 130 8, 160 14 C 190 20, 210 32, 240 24 C 270 16, 285 7, 300 5"
                  fill="none" stroke="rgba(255,255,255,0.50)" strokeWidth="2" strokeLinecap="round" />
                <path d="M0 38 C 40 38, 50 14, 80 20 C 110 26, 130 8, 160 14 C 190 20, 210 32, 240 24 C 270 16, 285 7, 300 5 L300 48 L0 48Z"
                  fill="url(#sg2)" />
              </svg>
            </div>
          </div>
        </div>

        {/* Card 3 — Tracking Options (desktop: col 7-12 row 2 | mobile: order 3) */}
        <div className="v1-card v1-card-cta">
          <div className="v1-cta-tracking-label">Tracking options</div>
          <h3 className="v1-cta-title">Log without opening the app</h3>
          <div className="v1-cta-steps">
            <div className="v1-cta-step">
              <span className="v1-cta-step-num">1</span>
              Install the iOS Shortcut below
            </div>
            <div className="v1-cta-step">
              <span className="v1-cta-step-num">2</span>
              Say &ldquo;Hey Siri, run Tracker&rdquo;
            </div>
            <div className="v1-cta-step">
              <span className="v1-cta-step-num">3</span>
              Speak — AI logs everything
            </div>
          </div>
          <p className="v1-cta-body">
            Or tap an NFC sticker on your kitchen counter, gym bag, or desk — no need to open any app.
          </p>
          <a href="#" className="v1-cta-btn">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" x2="12" y1="15" y2="3" />
            </svg>
            Download Shortcuts
          </a>
        </div>

        {/* Card 4 — Your Logs (desktop: col 1-12 row 3 | mobile: order 4) */}
        <div className="v1-card v1-card-logs">
          <div className="v1-card-label-row">
            <span className="v1-card-label">Your Logs</span>
            <a href="#" className="v1-see-all">See all</a>
          </div>
          <div className="v1-logs-list">
            {LOGS.map((log, i) => (
              <div key={i} className="v1-log-item">
                <div className="v1-log-raw">
                  <span className="v1-log-quote">&ldquo;</span>
                  {log.raw}
                  <span className="v1-log-quote">&rdquo;</span>
                </div>
                <div className="v1-log-tags">
                  {log.tags.map((tag, j) => <span key={j} className="v1-tag">{tag}</span>)}
                </div>
                <div className="v1-log-footer">
                  <span className="v1-tag v1-tag-time">{log.time}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </main>

      {/* ── Input Bar (desktop + mobile) ── */}
      <div className="v1-input-bar" role="region" aria-label="Log input">
        {logError && <p className="v1-input-feedback v1-input-feedback-error">{logError}</p>}
        {logSent && <p className="v1-input-feedback v1-input-feedback-ok">Logged ✓</p>}
        <div className="v1-input-inner">
          <input
            type="text"
            className="v1-input-field"
            placeholder="Log anything — workout, food, weight…"
            value={inputText}
            onChange={e => setInputText(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSend()}
            aria-label="Log entry"
            disabled={sending}
          />
          <div className="v1-input-actions">
            {/* Mic */}
            <button className="v1-input-mic" aria-label="Voice input">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2a3 3 0 0 1 3 3v7a3 3 0 0 1-6 0V5a3 3 0 0 1 3-3z" />
                <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                <line x1="12" y1="19" x2="12" y2="22" />
              </svg>
            </button>
            {/* Camera */}
            <button className="v1-input-camera" aria-label="Camera">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                <circle cx="12" cy="13" r="4" />
              </svg>
            </button>
            {/* Send */}
            <button className="v1-input-send" aria-label="Send"
              onClick={handleSend}
              disabled={sending || !inputText.trim()}>
              {sending
                ? <span className="v1-send-spinner" />
                : <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="22" y1="2" x2="11" y2="13" />
                    <polygon points="22 2 15 22 11 13 2 9 22 2" />
                  </svg>
              }
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
