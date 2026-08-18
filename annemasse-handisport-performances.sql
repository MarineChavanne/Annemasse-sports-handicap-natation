-- Ajout de la table "performances" (temps de nage par nageur)
-- À exécuter dans Supabase, après les scripts précédents.

create table if not exists performances (
  id uuid primary key default gen_random_uuid(),
  participant_id uuid not null references participants(id) on delete cascade,
  bassin integer not null check (bassin in (25, 50)),
  nage text not null check (nage in ('NL', 'DOS', 'BR', 'PAP', '3N', '4N')),
  distance integer,
  temps text not null,
  lieu text,
  date date,
  points integer,
  created_at timestamptz default now()
);

alter table performances enable row level security;

create policy "Accès complet aux utilisateurs connectés" on performances
  for all using (auth.uid() is not null) with check (auth.uid() is not null);

create index if not exists idx_performances_participant on performances(participant_id);
create index if not exists idx_performances_bassin_nage on performances(bassin, nage);
