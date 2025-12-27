-- Create the mood_votes table
create table public.mood_votes (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  gender text not null check (gender in ('male', 'female')),
  mood text not null check (mood in ('good', 'bad')),
  region_lv1 text not null, -- e.g., '서울특별시'
  region_lv2 text not null, -- e.g., '마포구'
  ip_hash text not null, -- Hashed IP for abuse prevention (not PII)
  lat double precision,
  lng double precision,
  user_id text -- Infinite Session ID
);

-- Enable Row Level Security
alter table public.mood_votes enable row level security;

-- Policy: Allow anonymous inserts (anyone can vote)
create policy "Allow anonymous inserts"
  on public.mood_votes
  for insert
  to anon
  with check (true);

-- Policy: Allow anonymous selects (anyone can view results)
create policy "Allow anonymous select"
  on public.mood_votes
  for select
  to anon
  using (true);

-- Indexes
create index if not exists mood_votes_user_id_idx on public.mood_votes(user_id);
create index if not exists mood_votes_created_at_idx on public.mood_votes(created_at);
