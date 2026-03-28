# Notes — Personal

Personal reference notes collected during development.

---

## Supabase — Session Persistence

- Default session expiry is **1 week**
- Configurable at: Supabase Dashboard → Auth Settings → JWT expiry
- Sessions are stored in cookies via `@supabase/ssr` — survive browser restarts
- No re-login needed per session until the JWT expires
