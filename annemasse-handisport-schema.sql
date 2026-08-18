-- Schéma de base de données : Annemasse Sports Handicap
-- À exécuter dans Supabase : SQL Editor > New query > coller ce script > Run

-- ---------- TABLE PROFILES ----------
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  nom text not null,
  titre text not null,
  created_at timestamptz default now()
);

alter table profiles enable row level security;

create policy "Accès complet aux utilisateurs connectés" on profiles
  for all using (auth.uid() is not null) with check (auth.uid() is not null);

-- ---------- TABLE PARTICIPANTS ----------
create table if not exists participants (
  id uuid primary key default gen_random_uuid(),
  prenom text not null,
  nom text not null,
  nom_famille text,
  naissance date,
  email text,
  created_at timestamptz default now()
);

alter table participants enable row level security;

create policy "Accès complet aux utilisateurs connectés" on participants
  for all using (auth.uid() is not null) with check (auth.uid() is not null);

-- ---------- TABLE JOURS D'ENTRAINEMENT ----------
create table if not exists jours_entrainement (
  id uuid primary key default gen_random_uuid(),
  date date not null unique,
  label text not null default 'Entraînement',
  heure time,
  created_at timestamptz default now()
);

alter table jours_entrainement enable row level security;

create policy "Accès complet aux utilisateurs connectés" on jours_entrainement
  for all using (auth.uid() is not null) with check (auth.uid() is not null);

-- ---------- TABLE PRESENCES ----------
create table if not exists presences (
  id uuid primary key default gen_random_uuid(),
  jour_id uuid not null references jours_entrainement(id) on delete cascade,
  date date not null,
  participant_id uuid not null references participants(id) on delete cascade,
  present boolean not null default false,
  created_at timestamptz default now(),
  unique (jour_id, participant_id)
);

alter table presences enable row level security;

create policy "Accès complet aux utilisateurs connectés" on presences
  for all using (auth.uid() is not null) with check (auth.uid() is not null);

-- ---------- TABLE EVENTS ----------
create table if not exists events (
  id uuid primary key default gen_random_uuid(),
  type text not null default 'Autre',
  nom text not null,
  lieu text,
  date_debut date not null,
  date_fin date,
  notes text,
  created_at timestamptz default now()
);

alter table events enable row level security;

create policy "Accès complet aux utilisateurs connectés" on events
  for all using (auth.uid() is not null) with check (auth.uid() is not null);

-- ---------- INDEX UTILES ----------
create index if not exists idx_presences_date on presences(date);
create index if not exists idx_presences_participant on presences(participant_id);
create index if not exists idx_events_date_debut on events(date_debut);
