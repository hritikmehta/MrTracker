# MrTracker — ambient life logging via Siri + web

Log workouts and food by voice. Zero friction. AI parses everything in batch.

---

## Stack

- **Next.js** (App Router) — frontend + API routes
- **Supabase** — auth (magic link) + Postgres + RLS
- **Anthropic Claude Sonnet** — batch NLP parser
- **Vercel** — one-click deploy

---

## Local setup

```bash
# 1. Clone and install
git clone <your-repo>
cd MrTracker
npm install

# 2. Copy env file and fill in keys
cp .env.example .env.local

# 3. Set up Supabase
# - Create project at supabase.com
# - Run schema.sql in the SQL editor (root of repo)
# - Copy URL + anon key + service role key into .env.local

# 4. Get Anthropic key
# - console.anthropic.com → API keys → paste into .env.local

# 5. Run locally
npm run dev
# Open http://localhost:3000
```

---

## Environment variables

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
ANTHROPIC_API_KEY=
```

No other env vars required. Access control is managed via the `allowed_users` Supabase table (see below).

---

## Access control (invite-only)

MrTracker is invite-only. Access is controlled via the `allowed_users` table in Supabase — no redeployment needed.

**To grant access to a user:**
1. Supabase Dashboard → Table Editor → `allowed_users`
2. Insert a row with their email
3. That's it — they can now sign in

Anyone not in the table gets their session revoked at the auth callback and is redirected to the waitlist page. Waitlist signups are stored in the `waitlist` table.

---

## Apple Shortcut setup

After signing in, go to **Dashboard → "Set Up iOS Shortcut"** — the `/shortcut` page shows:
- Your personal API token (copy button)
- The endpoint URL (copy button)
- A test connection button
- Step-by-step Shortcut recipe with exact field values pre-filled

Shortcut flow: **Dictate Text → POST to `/api/log` → "MrTracker has taken a note" notification**

The shortcut authenticates via `Authorization: Bearer [YOUR_USER_ID]` header — no login required on the phone.

**NFC variant (tap to log):**
- Buy NFC stickers (NTAG215)
- Shortcuts app → Automation → New → NFC → scan sticker
- Action: Run Shortcut → Tracker
- Tap the sticker → shortcut runs silently

---

## How batch processing works

Every log lands in `raw_logs` as unprocessed text.

From the dashboard, click **Run AI Analysis** (or press `⌘P`) to process. The processor fetches all unprocessed logs for the user, sends them in a single Claude API call (ordered by timestamp for full context), and Claude returns structured JSON for workouts and nutrition.

**Why batch:**
- One Claude call per session vs one per log — ~80% cheaper
- Claude sees full-day context ("warmed up 40kg" + "bench 3×8 80kg" understood together)
- Raw logs are safe if processing fails — reprocess anytime

---

## Keyboard shortcuts

| Key | Action |
|-----|--------|
| `/` | Focus log input |
| `↵ Enter` | Send log |
| `⌘P` | Run AI Analysis (signed in only) |
| `Escape` | Blur input |

---

## Folder structure

```
src/
  app/
    page.tsx                  ← redirects to /dashboard
    layout.tsx                ← global layout, Outfit font
    dashboard/page.tsx        ← main UI (auth-aware, real data when signed in)
    login/page.tsx            ← magic link sign-in + waitlist toggle
    shortcut/page.tsx         ← iOS Shortcut setup guide (signed-in only)
    auth/callback/route.ts    ← magic link exchange + allowlist check
    api/
      log/route.ts            ← POST — save raw log (web session or Bearer token)
      process/route.ts        ← POST — trigger Claude batch processing
      waitlist/route.ts       ← POST — save waitlist email
  lib/
    supabase.ts               ← browser Supabase client
    supabase-server.ts        ← server + admin Supabase clients
    processor.ts              ← Claude batch parsing logic
schema.sql                    ← run once in Supabase SQL editor
docs/
  DESIGN.md                   ← locked design system reference
  Notes - Personal.md         ← dev notes and quick references
```

---

## Database tables

| Table | Purpose |
|-------|---------|
| `profiles` | Extends auth.users — email, display name |
| `raw_logs` | Unprocessed log queue — all incoming text |
| `workouts` | Claude-parsed workout rows |
| `nutrition` | Claude-parsed nutrition rows |
| `personal_records` | Best lift per exercise (auto-updated) |
| `allowed_users` | Invite allowlist — email → access granted |
| `waitlist` | Waitlist signups |

All user tables use RLS (`user_id = auth.uid()`). `allowed_users` and `waitlist` are service-role only (no RLS).

---

## Extending

**Weekly digest email:** `app/api/report/route.ts` — fetch last 7 days of structured data, send to Claude with coaching prompt, return text.

**Food photo logging:** Accept image upload in `/api/log`, pass as base64 to Claude vision.

**NFC variant:** Already works — same `/api/log` endpoint, same Bearer auth. Just configure the shortcut to trigger on NFC tap.
