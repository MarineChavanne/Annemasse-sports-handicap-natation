-- Migration : remplace le champ unique "heure" par "heure_debut" et "heure_fin"
-- À exécuter dans Supabase, après les scripts précédents.

alter table jours_entrainement add column if not exists heure_debut time;
alter table jours_entrainement add column if not exists heure_fin time;

-- Reprend les anciennes heures déjà enregistrées comme heure de début
update jours_entrainement set heure_debut = heure where heure is not null and heure_debut is null;

alter table jours_entrainement drop column if exists heure;
