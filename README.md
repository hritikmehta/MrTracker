# Tracker — ambient life logging via Siri + web

Log workouts and food by voice. Zero friction. AI parses everything in batch.

---

## Stack

- **Next.js 14** (App Router) — frontend + API routes
- **Supabase** — auth (magic link) + Postgres database + RLS
- **Anthropic Claude** — batch NLP parser
- **Vercel** — deploy in one click, free tier

---

## Local setup

```bash
# 1. Clone and install
git clone <your-repo>
cd trackerapp
npm install

# 2. Copy env file and fill in keys
cp .env.example .env.local

# 3. Set up Supabase
# - Create project at supabase.com
# - Run supabase/schema.sql in the SQL editor
# - Copy URL + anon key + service role key into .env.local

# 4. Get Anthropic key
# - console.anthropic.com → API keys
# - Paste into .env.local

# 5. Run locally
npm run dev
# Open http://localhost:3000
```

---

## Deploy to Vercel

```bash
npm install -g vercel
vercel
# Follow prompts, add env vars when asked
```

Or connect your GitHub repo at vercel.com for auto-deploy on every push.

---

## Build the Apple Shortcut

The Shortcut does exactly 3 things. Build it in the Shortcuts app:

### Steps (create manually in Shortcuts app):

1. **Ask for Input** (or Dictate Text)
   - Prompt: "What did you do?"
   - Input type: Text (user can type or dictate)

2. **Get Contents of URL** (HTTP POST)
   - URL: `https://yourapp.vercel.app/api/log`
   - Method: POST
   - Headers:
     - `Content-Type`: `application/json`
     - `Authorization`: `Bearer YOUR_USER_ID` ← paste your UUID here
   - Body (JSON):
     ```json
     {
       "text": "[Provided Input]",
       "timestamp": "[Current Date as ISO 8601]",
       "source": "shortcut"
     }
     ```
   - For timestamp: add a "Format Date" action before this step
     - Date: Current Date
     - Format: ISO 8601

3. **Show Notification** (optional)
   - Title: "Logged"
   - Body: [Provided Input]

### Shortcut name
Name it **"Tracker"** — this is what Siri listens for.
"Hey Siri, run Tracker" will trigger it.

### Share with users
- Open the Shortcut → tap ••• → Share → Copy iCloud Link
- Paste that link into `app/onboarding/page.tsx` where it says `YOUR_SHORTCUT_ID_HERE`
- Users tap the link → "Add Shortcut" → done

### NFC variant (gym bag / kitchen)
- Buy NFC stickers (e.g. NTAG215, ~₹20 each on Amazon)
- Shortcuts app → Automation → New → NFC → hold phone to sticker to scan
- Action: Run Shortcut → Tracker
- Now tapping the sticker runs the Shortcut silently

---

## How batch processing works

Every log entry lands in `raw_logs` as unprocessed text with a timestamp.

When a user opens the dashboard, the frontend calls `POST /api/process`.

The processor fetches all unprocessed logs for that user, sends them together to Claude in one API call (ordered by timestamp, so Claude sees the full day's context), and Claude returns structured JSON for workouts and nutrition.

**Benefits of batching:**
- One Claude API call per session vs one per message — ~80% cheaper
- Claude sees full context: "warmed up 40kg" + "bench 3x8 80kg" + "finished 90kg fail" understood as one session
- Timestamps already set on each log, so processing can happen hours later with no data loss
- If Claude fails, raw logs are still safe — re-process anytime

---

## Folder structure

```
app/
  api/
    log/route.ts        ← receives all log POSTs (web + Shortcut)
    process/route.ts    ← triggers batch processing
  auth/
    page.tsx            ← magic link login
    callback/route.ts   ← handles magic link redirect
  dashboard/
    page.tsx            ← main UI
  onboarding/
    page.tsx            ← shows user token + Shortcut install guide
lib/
  supabase.ts           ← browser/server/admin clients
  processor.ts          ← Claude batch processing logic
supabase/
  schema.sql            ← run once to set up DB
```

---

## Extending

**Add weekly digest**: create `app/api/report/route.ts`, fetch last 7 days of structured data, send to Claude with a coaching prompt, return the text. Add a "Get report" button to the dashboard.

**Add food photo logging**: accept image upload in `/api/log`, pass as base64 to Claude vision alongside the text.

**Multi-user / sharing**: already works — each user has their own UUID, RLS isolates all data.

**Paid tier**: add Stripe, gate the `/api/process` route behind subscription check.
