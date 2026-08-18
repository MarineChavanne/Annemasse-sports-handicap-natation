import { supabase } from './supabase'

// ---------- PROFILES ----------

export async function getProfile(userId) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle()
  if (error) throw error
  return data
}

export async function createProfile({ id, nom, titre }) {
  const { data, error } = await supabase
    .from('profiles')
    .insert([{ id, nom, titre }])
    .select()
    .single()
  if (error) throw error
  return data
}

// ---------- PARTICIPANTS ----------

export async function listParticipants() {
  const { data, error } = await supabase
    .from('participants')
    .select('*')
    .order('nom', { ascending: true })
  if (error) throw error
  return data
}

export async function createParticipant(participant) {
  const { data, error } = await supabase
    .from('participants')
    .insert([participant])
    .select()
    .single()
  if (error) throw error
  return data
}

export async function updateParticipant(id, updates) {
  const { data, error } = await supabase
    .from('participants')
    .update(updates)
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function deleteParticipant(id) {
  const { error } = await supabase.from('participants').delete().eq('id', id)
  if (error) throw error
}

// ---------- JOURS D'ENTRAINEMENT ----------

export async function listJoursEntrainement() {
  const { data, error } = await supabase
    .from('jours_entrainement')
    .select('*')
    .order('date', { ascending: true })
  if (error) throw error
  return data
}

export async function createJourEntrainement(jour) {
  const { data, error } = await supabase
    .from('jours_entrainement')
    .insert([jour])
    .select()
    .single()
  if (error) throw error
  return data
}

export async function updateJourEntrainement(id, updates) {
  const { data, error } = await supabase
    .from('jours_entrainement')
    .update(updates)
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function deleteJourEntrainement(id) {
  const { error } = await supabase.from('jours_entrainement').delete().eq('id', id)
  if (error) throw error
}

// Crée plusieurs jours d'entraînement d'un coup (import en masse).
// Ignore silencieusement les dates qui existent déjà (grâce à la contrainte unique sur "date").
export async function creerJoursEnMasse(jours) {
  const { data, error } = await supabase
    .from('jours_entrainement')
    .upsert(jours, { onConflict: 'date', ignoreDuplicates: true })
    .select()
  if (error) throw error
  return data
}

export async function getJourParDate(dateISO) {
  const { data, error } = await supabase
    .from('jours_entrainement')
    .select('*')
    .eq('date', dateISO)
    .maybeSingle()
  if (error) throw error
  return data
}

// ---------- PRESENCES ----------

export async function listPresencesPourJour(jourId) {
  const { data, error } = await supabase
    .from('presences')
    .select('*')
    .eq('jour_id', jourId)
  if (error) throw error
  return data
}

export async function listPresencesEntreDates(debut, fin) {
  const { data, error } = await supabase
    .from('presences')
    .select('*')
    .gte('date', debut)
    .lte('date', fin)
  if (error) throw error
  return data
}

export async function listPresencesRecentes(limite = 10) {
  const { data, error } = await supabase
    .from('presences')
    .select('*, participants(prenom, nom)')
    .eq('present', true)
    .order('date', { ascending: false })
    .limit(limite)
  if (error) throw error
  return data
}

// Enregistre en une fois la présence de plusieurs participants pour un jour donné
export async function enregistrerAppel(jourId, dateISO, presencesParticipant) {
  // presencesParticipant : tableau de { participant_id, present }
  const lignes = presencesParticipant.map((p) => ({
    jour_id: jourId,
    date: dateISO,
    participant_id: p.participant_id,
    present: p.present,
  }))
  const { error } = await supabase
    .from('presences')
    .upsert(lignes, { onConflict: 'jour_id,participant_id' })
  if (error) throw error
}

// ---------- EVENTS ----------

export async function listEvents() {
  const { data, error } = await supabase
    .from('events')
    .select('*')
    .order('date_debut', { ascending: true })
  if (error) throw error
  return data
}

export async function createEvent(event) {
  const { data, error } = await supabase
    .from('events')
    .insert([event])
    .select()
    .single()
  if (error) throw error
  return data
}

export async function updateEvent(id, updates) {
  const { data, error } = await supabase
    .from('events')
    .update(updates)
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function deleteEvent(id) {
  const { error } = await supabase.from('events').delete().eq('id', id)
  if (error) throw error
}

export async function getProchainEvent() {
  const today = new Date().toISOString().slice(0, 10)
  const { data, error } = await supabase
    .from('events')
    .select('*')
    .gte('date_debut', today)
    .order('date_debut', { ascending: true })
    .limit(1)
    .maybeSingle()
  if (error) throw error
  return data
}

export async function getProchainJourEntrainement() {
  const today = new Date().toISOString().slice(0, 10)
  const { data, error } = await supabase
    .from('jours_entrainement')
    .select('*')
    .gte('date', today)
    .order('date', { ascending: true })
    .limit(1)
    .maybeSingle()
  if (error) throw error
  return data
}

// ---------- NOTES ----------

export async function listNotes() {
  const { data, error } = await supabase
    .from('notes')
    .select('*, events(nom)')
    .order('date', { ascending: false, nullsFirst: false })
  if (error) throw error
  return data
}

export async function createNote(note) {
  const { data, error } = await supabase
    .from('notes')
    .insert([note])
    .select()
    .single()
  if (error) throw error
  return data
}

export async function updateNote(id, updates) {
  const { data, error } = await supabase
    .from('notes')
    .update(updates)
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function deleteNote(id) {
  const { error } = await supabase.from('notes').delete().eq('id', id)
  if (error) throw error
}

// ---------- PERFORMANCES ----------

export async function listPerformancesParParticipant(participantId) {
  const { data, error } = await supabase
    .from('performances')
    .select('*')
    .eq('participant_id', participantId)
    .order('date', { ascending: false, nullsFirst: false })
  if (error) throw error
  return data
}

// Crée plusieurs performances d'un coup (import en masse)
export async function creerPerformancesEnMasse(performances) {
  const { data, error } = await supabase
    .from('performances')
    .insert(performances)
    .select()
  if (error) throw error
  return data
}

export async function deletePerformance(id) {
  const { error } = await supabase.from('performances').delete().eq('id', id)
  if (error) throw error
}
