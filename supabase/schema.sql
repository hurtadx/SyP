create table if not exists notifications (
  id bigint generated always as identity primary key,
  from_user text not null,
  to_user text not null,
  type text not null,
  message text,
  data jsonb default '{}'::jsonb,
  seen boolean default false,
  created_at timestamptz default now()
);

create table if not exists user_settings (
  user_id text primary key,
  reminders_active boolean default false,
  updated_at timestamptz default now()
);

create table if not exists memories (
  id bigint generated always as identity primary key,
  song_id text,
  title text,
  artist text,
  album text,
  cover_image text,
  spotify_url text,
  memory text,
  added_by text,
  created_at timestamptz default now()
);

create table if not exists markers (
  id bigint generated always as identity primary key,
  latitude double precision not null,
  longitude double precision not null,
  description text,
  date timestamptz default now(),
  created_by text
);

create table if not exists photos (
  id bigint generated always as identity primary key,
  image_url text not null,
  caption text,
  uploaded_by text,
  created_at timestamptz default now()
);

create table if not exists roulette_options (
  id bigint generated always as identity primary key,
  option_text text not null,
  created_at timestamptz default now()
);

do $$
declare t text;
begin
  foreach t in array array['notifications','user_settings','memories','markers','photos','roulette_options'] loop
    execute format('alter table %I enable row level security', t);
    execute format('drop policy if exists "open_access" on %I', t);
    execute format('create policy "open_access" on %I for all to anon using (true) with check (true)', t);
  end loop;
end $$;

insert into storage.buckets (id, name, public)
values ('photo_gallery', 'photo_gallery', true)
on conflict (id) do nothing;

drop policy if exists "gallery_anon_all" on storage.objects;
create policy "gallery_anon_all" on storage.objects for all to anon
  using (bucket_id = 'photo_gallery')
  with check (bucket_id = 'photo_gallery');

alter table user_settings add column if not exists push_token text;

create table if not exists daily_answers (
  id bigint generated always as identity primary key,
  question_date date not null,
  question text not null,
  user_id text not null,
  answer text not null,
  created_at timestamptz default now(),
  unique (question_date, user_id)
);

alter table daily_answers enable row level security;
drop policy if exists "open_access" on daily_answers;
create policy "open_access" on daily_answers for all to anon using (true) with check (true);

create table if not exists saved_questions (
  id bigint generated always as identity primary key,
  user_id text not null,
  question_date date not null,
  created_at timestamptz default now(),
  unique (user_id, question_date)
);

alter table saved_questions enable row level security;
drop policy if exists "open_access" on saved_questions;
create policy "open_access" on saved_questions for all to anon using (true) with check (true);
