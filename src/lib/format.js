// Helpers de formatage de dates et de génération de calendrier mensuel

const JOURS = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam']
const MOIS = [
  'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre',
]

// Convertit une date en chaîne YYYY-MM-DD (format Supabase) en heure locale, sans décalage UTC
export function toISODate(date) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

// Parse une chaîne YYYY-MM-DD en objet Date locale (évite les décalages de fuseau horaire)
export function parseISODate(str) {
  if (!str) return null
  const [y, m, d] = str.split('-').map(Number)
  return new Date(y, m - 1, d)
}

export function formatDateFr(str, options = {}) {
  const date = typeof str === 'string' ? parseISODate(str) : str
  if (!date) return ''
  const { withWeekday = false, short = false } = options
  const jour = date.getDate()
  const mois = short ? MOIS[date.getMonth()].slice(0, 3) : MOIS[date.getMonth()]
  const annee = date.getFullYear()
  const prefix = withWeekday ? `${JOURS[date.getDay()]} ` : ''
  return `${prefix}${jour} ${mois} ${annee}`
}

export function formatHeure(str) {
  if (!str) return ''
  return str.slice(0, 5)
}

// Formate une plage horaire "18:00 - 19:30". Gère les cas où seule une des deux heures est renseignée.
export function formatPlageHoraire(debut, fin) {
  const d = formatHeure(debut)
  const f = formatHeure(fin)
  if (d && f) return `${d} - ${f}`
  if (d) return d
  if (f) return f
  return ''
}

export function todayISO() {
  return toISODate(new Date())
}

export function nomMois(monthIndex) {
  return MOIS[monthIndex]
}

export function nomJourCourt(dayIndex) {
  return JOURS[dayIndex]
}

// Génère la grille du calendrier mensuel : tableau de semaines, chaque semaine = 7 jours
// Chaque cellule est soit null (jour hors mois) soit { date: Date, iso: 'YYYY-MM-DD', jour: number }
export function genererGrilleMois(annee, mois) {
  const premierJour = new Date(annee, mois, 1)
  const dernierJour = new Date(annee, mois + 1, 0)
  const nbJours = dernierJour.getDate()

  // Décalage pour que la semaine commence le lundi
  let decalage = premierJour.getDay() - 1
  if (decalage < 0) decalage = 6

  const cellules = []
  for (let i = 0; i < decalage; i++) cellules.push(null)
  for (let j = 1; j <= nbJours; j++) {
    const date = new Date(annee, mois, j)
    cellules.push({ date, iso: toISODate(date), jour: j })
  }
  while (cellules.length % 7 !== 0) cellules.push(null)

  const semaines = []
  for (let i = 0; i < cellules.length; i += 7) {
    semaines.push(cellules.slice(i, i + 7))
  }
  return semaines
}

export function ageDepuisNaissance(str) {
  if (!str) return null
  const naissance = parseISODate(str)
  const aujourdhui = new Date()
  let age = aujourdhui.getFullYear() - naissance.getFullYear()
  const m = aujourdhui.getMonth() - naissance.getMonth()
  if (m < 0 || (m === 0 && aujourdhui.getDate() < naissance.getDate())) age--
  return age
}

// Retourne le début (lundi) et la fin (dimanche) de la semaine courante
export function limitesSemaine(date = new Date()) {
  const d = new Date(date)
  let jour = d.getDay()
  if (jour === 0) jour = 7
  const debut = new Date(d)
  debut.setDate(d.getDate() - (jour - 1))
  const fin = new Date(debut)
  fin.setDate(debut.getDate() + 6)
  return { debut: toISODate(debut), fin: toISODate(fin) }
}

export function limitesMois(annee, mois) {
  const debut = new Date(annee, mois, 1)
  const fin = new Date(annee, mois + 1, 0)
  return { debut: toISODate(debut), fin: toISODate(fin) }
}

// Génère toutes les dates (format YYYY-MM-DD) entre deux dates incluses,
// qui correspondent à l'un des jours de la semaine sélectionnés.
// joursSemaine : tableau de numéros 0=dimanche, 1=lundi, ..., 6=samedi
export function genererDatesRecurrentes(dateDebutISO, dateFinISO, joursSemaine) {
  const dates = []
  const debut = parseISODate(dateDebutISO)
  const fin = parseISODate(dateFinISO)
  if (!debut || !fin || debut > fin) return dates

  let curseur = new Date(debut)
  while (curseur <= fin) {
    if (joursSemaine.includes(curseur.getDay())) {
      dates.push(toISODate(curseur))
    }
    curseur = new Date(curseur.getFullYear(), curseur.getMonth(), curseur.getDate() + 1)
  }
  return dates
}
