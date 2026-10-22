-- Sal y Pimienta - esquema de Supabase
-- Pegar completo en: Supabase Dashboard > SQL Editor > New query > Run
-- Se puede ejecutar en un proyecto nuevo para recrear toda la base de datos.

-- Notificaciones entre salo y tao (besitos, canciones, fotos, lugares)
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

-- Configuración por usuario (la app hace upsert por user_id)
create table if not exists user_settings (
  user_id text primary key,
  reminders_active boolean default false,
  updated_at timestamptz default now()
);

-- Canciones con recuerdos (pantalla Música)
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

-- Lugares especiales (pantalla Mapa)
create table if not exists markers (
  id bigint generated always as identity primary key,
  latitude double precision not null,
  longitude double precision not null,
  description text,
  date timestamptz default now(),
  created_by text
);

-- Fotos (pantalla Galería)
create table if not exists photos (
  id bigint generated always as identity primary key,
  image_url text not null,
  caption text,
  uploaded_by text,
  created_at timestamptz default now()
);

-- Opciones personalizadas de la ruleta
create table if not exists roulette_options (
  id bigint generated always as identity primary key,
  option_text text not null,
  created_at timestamptz default now()
);

-- Seguridad: la app no tiene login, así que el rol anon necesita acceso completo.
-- Cualquiera con la anon key puede leer/escribir, por eso config.js nunca se sube a git.
do $$
declare t text;
begin
  foreach t in array array['notifications','user_settings','memories','markers','photos','roulette_options'] loop
    execute format('alter table %I enable row level security', t);
    execute format('drop policy if exists "open_access" on %I', t);
    execute format('create policy "open_access" on %I for all to anon using (true) with check (true)', t);
  end loop;
end $$;

-- Storage: bucket público para las fotos (la app usa getPublicUrl)
insert into storage.buckets (id, name, public)
values ('photo_gallery', 'photo_gallery', true)
on conflict (id) do nothing;

drop policy if exists "gallery_anon_all" on storage.objects;
create policy "gallery_anon_all" on storage.objects for all to anon
  using (bucket_id = 'photo_gallery')
  with check (bucket_id = 'photo_gallery');
