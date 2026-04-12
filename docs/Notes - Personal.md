# Notes — Personal

Dev reference. Quick lookups during active development.

---

## Auth & Sessions

- Default session expiry: **1 week** (configurable at Supabase Dashboard → Auth Settings → JWT expiry)
- Sessions stored in cookies via `@supabase/ssr` — survive browser restarts
- Two auth paths for logging:
  - **Web**: Supabase cookie session (automatic)
  - **Siri Shortcut**: `Authorization: Bearer [USER_ID]` header — user ID is the Supabase UUID from `profiles.id`

---

## Access Control

- Managed via `allowed_users` table in Supabase — **no env vars, no redeployment**
- Flow: magic link sent → user clicks → `/auth/callback` → query `allowed_users` → if not found, sign out + redirect to `/login?error=access_denied`
- To grant access: Table Editor → `allowed_users` → Insert row → email
- To revoke: delete the row — existing session stays valid until JWT expires (1 week)
- Waitlist signups stored in `waitlist` table (email unique constraint, duplicates silently accepted)

---

## iOS Shortcut — API spec

**Endpoint:** `POST /api/log`

**Headers:**
```
Authorization: Bearer [USER_ID]
Content-Type: application/json
```

**Body:**
```json
{
  "text": "spoken text here",
  "source": "shortcut"
}
```

**Response (success):**
```json
{ "ok": true, "id": "uuid", "logged_at": "ISO timestamp" }
```

User can get their token + test the connection at `/shortcut` (requires sign-in).

---

## Keyboard Shortcuts (web)

| Key | Action |
|-----|--------|
| `/` | Focus log input (from anywhere, not in input) |
| `↵ Enter` | Send log |
| `⌘P` / `Ctrl+P` | Run AI Analysis (signed-in only) |
| `Escape` | Blur input |

Implemented in `dashboard/page.tsx` via `window.addEventListener('keydown', ...)` — re-registers when `user` state changes.

---

## Real Data vs Showcase Data

Dashboard is auth-aware:

| State | Heatmap | Stats | Logs |
|-------|---------|-------|------|
| Signed out | Randomised (seeded on mount via `useRef`) | 7 / 14 / 21 (hardcoded) | Sample showcase logs |
| Signed in | Real `raw_logs` grouped by day | Computed from real data | Real `raw_logs` (last 5) |

Signed-out showcase data intentionally looks polished — it's a product preview, not a demo banner. The old "Viewing demo data" text has been removed.

---

## Data Fetching Pattern (dashboard)

`fetchUserData(userId)` runs two parallel Supabase queries:
1. Last 5 `raw_logs` (for the Logs card)
2. All `raw_logs` in last 30 days (for heatmap + stats)

Heatmap groups by `logged_at.split('T')[0]` (date string) into a `Map<string, number>`. Stats (streak, best streak, total) are computed client-side from the 30-day array.

Triggered on: initial auth, auth state change, after `handleSend`, after `handleProcess`.

---

## AI Processing

- Button: "Run AI Analysis" in AI Digest card (signed-in only)
- Keyboard: `⌘P`
- Calls `POST /api/process` → `lib/processor.ts` → Claude Sonnet
- On success: refreshes `fetchUserData`, shows inline feedback for 4s
- AI Digest card stats (84%, 5/6 days, etc.) remain as showcase — not yet computed from real data

---

## CSS Class Prefixes

| Prefix | Page |
|--------|------|
| `.v1-` | Dashboard, login |
| `.sc-` | Shortcut setup page (`/shortcut`) |

Both pages use inline `<style dangerouslySetInnerHTML>` — no external CSS files, no Tailwind.

---

## Supabase Quick Reference

- Browser client: `createSupabaseBrowser()` from `lib/supabase.ts` — use in client components
- Server client: `createSupabaseServer()` from `lib/supabase-server.ts` — use in API routes / server components
- Admin client: `createSupabaseAdmin()` — service role key, bypasses RLS, use for cross-user ops (processor, auth callback allowlist check, waitlist writes)

---

## Routes

| Route | Auth | Notes |
|-------|------|-------|
| `/` | None | Redirects to `/dashboard` |
| `/login` | None | Magic link sign-in + waitlist toggle |
| `/dashboard` | Optional | Showcase if signed out, real data if signed in |
| `/shortcut` | Required | Shows user token + Shortcut setup guide |
| `/auth/callback` | — | Exchanges code, checks allowlist, redirects |
| `POST /api/log` | Session or Bearer | Saves raw log |
| `POST /api/process` | Session | Triggers Claude batch |
| `POST /api/waitlist` | None | Saves waitlist email |
