# MrTracker V1 — Locked Design System

> This is the canonical design reference for MrTracker V1.
> Do not deviate from these tokens without explicit design review.

---

## Identity

**Product name:** MrTracker
**Version:** 1.0
**Design style:** Warm Glassmorphism / Ambient Logging
**Personality:** Calm, premium, zero-friction — not clinical, not loud

---

## Color Palette

### Base Background
```
Body:    #a69c97  — warm taupe/mocha
```

### Ambient Gradient (fixed position, blur(60px), animated)
```
#c4b8b1  — light warm rose-grey   (circle at 20% 30%)
#8a827d  — medium warm grey        (circle at 80% 70%)
#e2dcd8  — near-white warm tint    (circle at 50% 50%)
```

### UI Surfaces
```
Glass card bg:      rgba(255, 255, 255, 0.08)
Glass card border:  rgba(255, 255, 255, 0.15)
Glass highlight:    rgba(255, 255, 255, 0.30)   ← inset top shimmer line
Dark pill / widget: #1c1c1e
Input bar bg:       rgba(18, 17, 20, 0.82)
Input bar border:   rgba(255, 255, 255, 0.09)
```

### Text
```
Primary (dark):     #2d2d2d
Hero headline:      #111
Muted (on light):   rgba(45, 45, 45, 0.50)
On dark surfaces:   rgba(255, 255, 255, 0.88)
Muted on dark:      rgba(255, 255, 255, 0.38)
```

### Accent
```
Sage glow:  rgba(212, 224, 190, 0.8)  ← orb cloud, waveform bars
```

### Heatmap Levels (white-opacity scale)
```
level 0:  rgba(255, 255, 255, 0.10)  — no activity
level 1:  rgba(255, 255, 255, 0.38)  — light
level 2:  rgba(255, 255, 255, 0.68)  — medium
level 3:  #ffffff + box-shadow 0 0 7px rgba(255,255,255,0.5)  — full/glow
```

---

## Typography

**Font:** `Outfit` (Google Fonts)
**Loading:** Via `<link>` in `src/app/layout.tsx` `<head>` — loaded once for the whole app.
**Do NOT** use `@import` inside component `<style>` blocks — inline style `@import` is unreliable.
**Base declaration:** `body { font-family: 'Outfit', sans-serif; }` in `globals.css`.

| Role | Size | Weight | Letter-spacing | Notes |
|------|------|--------|----------------|-------|
| Hero H1 | `clamp(1.9rem, 4.5vw, 3.4rem)` | 200 | -0.03em | Line-height 1.1, color #111 |
| Body / subtext | 14px | 300 | — | Line-height 1.55, muted color |
| Card label | 10px | 400 | 0.10em | ALL CAPS |
| Numeric value | 42px | 300 | -0.03em | e.g. AI digest score |
| Tag / pill | 11–12px | 300 | — | Wrapped in glass pill |
| CTA text | 12–13px | 300 | 0.02em | Dark pill button |
| Badge | 12px | 300 | 0.04em | MrTracker 1.0 pill |

**Rule:** Weight 200 for headlines = premium. Weight 300 across all body/UI = calm, unhurried.

---

## Glass Card Pattern

```css
/* Standard card */
background: rgba(255, 255, 255, 0.08);
backdrop-filter: blur(40px) saturate(120%);
-webkit-backdrop-filter: blur(40px) saturate(120%);
border: 1px solid rgba(255, 255, 255, 0.15);
border-radius: 28px;
box-shadow:
  0 24px 48px rgba(0,0,0,0.06),
  inset 0 1px 0 rgba(255,255,255,0.28),
  inset 0 0 28px rgba(255,255,255,0.05);

/* Top shimmer line (::before pseudo) */
top: 0; left: 16px; right: 16px; height: 1px;
background: linear-gradient(90deg, transparent, rgba(255,255,255,0.55), transparent);
```

```css
/* Nested log item */
background: rgba(255, 255, 255, 0.12);
border: 1px solid rgba(255, 255, 255, 0.20);
border-radius: 12px;
box-shadow: inset 0 1px 0 rgba(255,255,255,0.18);
```

```css
/* Glass tag pill */
background: rgba(255, 255, 255, 0.36);
border: 1px solid rgba(255, 255, 255, 0.48);
border-radius: 999px;
padding: 3px 9px;
```

---

## Dark UI Elements

```css
/* Badge / pill (e.g. MrTracker 1.0, CTA button) */
background: #1c1c1e;
color: #fff;
border-radius: 20–30px;
box-shadow: inset 0 1px 1px rgba(255,255,255,0.10), 0 8px 16px rgba(0,0,0,0.15);
```

```css
/* Input bar (fixed bottom) */
background: rgba(18, 17, 20, 0.82);
backdrop-filter: blur(32px) saturate(140%);
border: 1px solid rgba(255,255,255,0.09);
border-radius: 24–28px (desktop), 999px (mobile);
```

```css
/* Bottom fade overlay */
background: linear-gradient(to top,
  rgba(14, 13, 15, 0.82) 0%,
  rgba(14, 13, 15, 0.55) 60%,
  transparent 100%);
```

---

## Animation System

| Name | Applied to | Duration | Easing |
|------|-----------|----------|--------|
| `breathe` | `.v1-ambient` | 20s infinite alternate | ease-in-out |
| `rotateCloud` | `.v1-orb-cloud` | 10s infinite | linear |
| `pulseStreak` | `.v1-orb-streak` | 4s infinite | ease-in-out |
| `blink` | `.v1-cursor` | 1s infinite | step-end |
| `fadeInUp` | cards + hero | 0.7s | ease |
| Typewriter | JS loop | 72ms/char type, 38ms/char delete | — |

Keyframes:
```css
@keyframes breathe {
  0%   { transform: scale(1);   opacity: 0.8; }
  100% { transform: scale(1.1); opacity: 1; }
}
@keyframes float {
  0%, 100% { transform: translateY(0); }
  50%       { transform: translateY(-10px); }
}
```

---

## Layout

**Bento grid:** 12-column CSS Grid, `gap: 18px`, `max-width: 1240px`

| Card | Desktop | Mobile order |
|------|---------|--------------|
| Consistency Streak | span 8 | 1 |
| Tracking Options (Shortcut CTA) | span 4 | 2 |
| AI Digest | span 6 | 3 |
| Your Logs | span 6 | 4 |

**Breakpoints:**
- `≤ 600px` — mobile: single column, typewriter capsule hidden
- `601–860px` — tablet: single column, reduced padding
- `≥ 861px` — desktop: full bento grid

---

## Routes

| Route | Purpose |
|-------|---------|
| `/` | Auth check → `/dashboard` or `/login` |
| `/login` | Magic link auth (V1 glassmorphism design) |
| `/auth/callback` | Supabase magic link exchange → `/dashboard` |
| `/dashboard` | Main app — landing + log entry |
| `/api/log` | POST — save raw log (web session or Bearer token) |
| `/api/process` | POST — trigger Claude batch processing |

---

## CSS Class Namespace

All V1 components use the prefix **`v1-`**:
- Root wrapper: `.v1-root`
- Login page: `.v1-login`
- All sub-components: `.v1-[component]-[element]`

`body:has(.v1-root)` and `body:has(.v1-login)` override the global background to `#a69c97`.
