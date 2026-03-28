-- ─────────────────────────────────────────────
-- Run once in Supabase SQL Editor
-- ─────────────────────────────────────────────

-- Users are handled by Supabase Auth (auth.users)
-- We extend with a public profile
create table if not exists public.profiles (
  id           uuid primary key references auth.users(id) on delete cascade,
  email        text,
  display_name text,
  created_at   timestamptz default now()
);

-- ── Raw log queue ──────────────────────────────
-- Everything lands here first, unprocessed
create table if not exists public.raw_logs (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid references public.profiles(id) on delete cascade,
  text         text not null,
  source       text default 'web',   -- 'web' | 'shortcut' | 'siri'
  logged_at    timestamptz not null, -- timestamp from client (Shortcut sends device time)
  processed    boolean default false,
  processed_at timestamptz,
  created_at   timestamptz default now()
);

-- ── Structured workout rows ────────────────────
create table if not exists public.workouts (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid references public.profiles(id) on delete cascade,
  raw_log_id   uuid references public.raw_logs(id),
  workout_date date not null,
  exercise     text not null,
  sets         int,
  reps         text,        -- "8,8,6" per set
  weights_kg   text,        -- "60,70,80" per set
  notes        text,
  created_at   timestamptz default now()
);

-- ── Structured nutrition rows ──────────────────
create table if not exists public.nutrition (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid references public.profiles(id) on delete cascade,
  raw_log_id   uuid references public.raw_logs(id),
  meal_date    date not null,
  meal_name    text,
  calories     int,
  protein_g    numeric(6,1),
  carbs_g      numeric(6,1),
  fat_g        numeric(6,1),
  notes        text,
  created_at   timestamptz default now()
);

-- ── Personal records (auto-updated on insert) ──
create table if not exists public.personal_records (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid references public.profiles(id) on delete cascade,
  exercise       text not null,
  best_weight_kg numeric(6,2),
  achieved_on    date,
  updated_at     timestamptz default now(),
  unique(user_id, exercise)
);

-- ── Indexes ────────────────────────────────────
create index on public.raw_logs   (user_id, processed, logged_at);
create index on public.workouts   (user_id, workout_date desc);
create index on public.nutrition  (user_id, meal_date desc);

-- ── RLS ───────────────────────────────────────
alter table public.profiles          enable row level security;
alter table public.raw_logs          enable row level security;
alter table public.workouts          enable row level security;
alter table public.nutrition         enable row level security;
alter table public.personal_records  enable row level security;

create policy "own profile"    on public.profiles         for all using (id = auth.uid());
create policy "own raw_logs"   on public.raw_logs         for all using (user_id = auth.uid());
create policy "own workouts"   on public.workouts         for all using (user_id = auth.uid());
create policy "own nutrition"  on public.nutrition        for all using (user_id = auth.uid());
create policy "own prs"        on public.personal_records for all using (user_id = auth.uid());

-- ── Auto-create profile on signup ─────────────
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email);
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
