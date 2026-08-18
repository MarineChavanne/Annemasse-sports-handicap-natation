-- Restriction des droits pour le rôle "Entraîneur"
-- À exécuter APRÈS le script annemasse-handisport-schema.sql
-- Le compte Entraîneur peut tout voir mais ne peut modifier que les présences.

-- Fonction utilitaire : renvoie vrai si l'utilisateur connecté a le rôle "Entraîneur"
create or replace function is_entraineur()
returns boolean
language sql
security definer
stable
as $$
  select coalesce(
    (select titre from profiles where id = auth.uid()) = 'Entraîneur',
    false
  );
$$;

-- ---------- PARTICIPANTS : lecture pour tous, écriture réservée président/responsable ----------
drop policy if exists "Accès complet aux utilisateurs connectés" on participants;

create policy "Lecture pour tous les connectés" on participants
  for select using (auth.uid() is not null);

create policy "Ajout réservé aux non-entraîneurs" on participants
  for insert with check (auth.uid() is not null and not is_entraineur());

create policy "Modification réservée aux non-entraîneurs" on participants
  for update using (auth.uid() is not null and not is_entraineur())
  with check (auth.uid() is not null and not is_entraineur());

create policy "Suppression réservée aux non-entraîneurs" on participants
  for delete using (auth.uid() is not null and not is_entraineur());

-- ---------- JOURS D'ENTRAINEMENT : lecture pour tous, planification réservée président/responsable ----------
drop policy if exists "Accès complet aux utilisateurs connectés" on jours_entrainement;

create policy "Lecture pour tous les connectés" on jours_entrainement
  for select using (auth.uid() is not null);

create policy "Ajout réservé aux non-entraîneurs" on jours_entrainement
  for insert with check (auth.uid() is not null and not is_entraineur());

create policy "Modification réservée aux non-entraîneurs" on jours_entrainement
  for update using (auth.uid() is not null and not is_entraineur())
  with check (auth.uid() is not null and not is_entraineur());

create policy "Suppression réservée aux non-entraîneurs" on jours_entrainement
  for delete using (auth.uid() is not null and not is_entraineur());

-- ---------- EVENTS : lecture pour tous, écriture réservée président/responsable ----------
drop policy if exists "Accès complet aux utilisateurs connectés" on events;

create policy "Lecture pour tous les connectés" on events
  for select using (auth.uid() is not null);

create policy "Ajout réservé aux non-entraîneurs" on events
  for insert with check (auth.uid() is not null and not is_entraineur());

create policy "Modification réservée aux non-entraîneurs" on events
  for update using (auth.uid() is not null and not is_entraineur())
  with check (auth.uid() is not null and not is_entraineur());

create policy "Suppression réservée aux non-entraîneurs" on events
  for delete using (auth.uid() is not null and not is_entraineur());

-- ---------- PRESENCES : tout le monde peut lire et faire l'appel (aucun changement) ----------
-- La policy existante "Accès complet aux utilisateurs connectés" reste en place sur cette table.
