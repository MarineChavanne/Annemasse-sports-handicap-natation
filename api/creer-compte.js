// Fonction serveur (Vercel) qui crée un compte utilisateur avec e-mail + mot de passe prévisionnel.
// Ne peut être appelée qu'en étant connecté en tant que Responsable natation.
// La clé secrète Supabase (service_role) n'est utilisée qu'ici, jamais côté site.

import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://mdmmrtcoljztrrcezkyx.supabase.co'
const SUPABASE_ANON_KEY = 'sb_publishable_gV5IHOerYl-K7cUu6wsGeA_oHUL0ZHY'

const supabaseAdmin = createClient(SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)
const supabaseAuth = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

const ROLES_AUTORISES = ['Président', 'Entraîneur']

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Méthode non autorisée' })
  }

  const authHeader = req.headers.authorization || ''
  const token = authHeader.replace('Bearer ', '')
  if (!token) {
    return res.status(401).json({ error: 'Non authentifié' })
  }

  // Vérifie que le token correspond bien à un utilisateur connecté
  const { data: userData, error: userError } = await supabaseAuth.auth.getUser(token)
  if (userError || !userData?.user) {
    return res.status(401).json({ error: 'Session invalide, reconnectez-vous.' })
  }

  // Vérifie que cet utilisateur a bien le rôle "Responsable natation"
  const { data: profil, error: profilError } = await supabaseAdmin
    .from('profiles')
    .select('titre')
    .eq('id', userData.user.id)
    .maybeSingle()

  if (profilError || !profil || profil.titre !== 'Responsable natation') {
    return res.status(403).json({ error: 'Seul le Responsable natation peut créer des comptes.' })
  }

  const { email, password, nom, titre } = req.body || {}

  if (!email || !password || !nom || !titre) {
    return res.status(400).json({ error: 'Tous les champs sont obligatoires.' })
  }
  if (!ROLES_AUTORISES.includes(titre)) {
    return res.status(400).json({ error: 'Rôle invalide.' })
  }
  if (password.length < 6) {
    return res.status(400).json({ error: 'Le mot de passe doit contenir au moins 6 caractères.' })
  }

  // Crée le compte (déjà confirmé, pas d'e-mail de vérification à cliquer)
  const { data: nouvelUtilisateur, error: creationError } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  })

  if (creationError) {
    return res.status(400).json({ error: creationError.message })
  }

  // Crée directement son profil (nom + rôle défini par le Responsable natation)
  const { error: profilInsertError } = await supabaseAdmin
    .from('profiles')
    .insert([{ id: nouvelUtilisateur.user.id, nom, titre }])

  if (profilInsertError) {
    return res.status(500).json({
      error: "Le compte a été créé mais son profil n'a pas pu être enregistré : " + profilInsertError.message,
    })
  }

  return res.status(200).json({ success: true })
}
