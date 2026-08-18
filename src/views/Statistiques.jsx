import React, { useEffect, useState } from 'react'
import { ViewHeader, EmptyState } from '../lib/ui'
import { listParticipants, listPresencesEntreDates } from '../lib/db'
import { limitesSemaine, limitesMois, toISODate } from '../lib/format'

const PERIODES = [
  { id: 'semaine', label: 'Cette semaine' },
  { id: 'mois', label: 'Ce mois' },
  { id: 'saison', label: 'Cette saison' },
]

// La saison sportive commence le 1er septembre
function limitesSaison() {
  const aujourdhui = new Date()
  let anneeDebut = aujourdhui.getFullYear()
  if (aujourdhui.getMonth() < 8) anneeDebut -= 1 // avant septembre => saison a commencé l'année précédente
  const debut = new Date(anneeDebut, 8, 1)
  const fin = new Date(anneeDebut + 1, 7, 31)
  return { debut: toISODate(debut), fin: toISODate(fin) }
}

export default function Statistiques() {
  const [periode, setPeriode] = useState('mois')
  const [participants, setParticipants] = useState([])
  const [presences, setPresences] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    charger()
  }, [periode])

  async function charger() {
    setLoading(true)
    try {
      const p = await listParticipants()
      setParticipants(p)

      let limites
      const aujourdhui = new Date()
      if (periode === 'semaine') limites = limitesSemaine(aujourdhui)
      else if (periode === 'mois') limites = limitesMois(aujourdhui.getFullYear(), aujourdhui.getMonth())
      else limites = limitesSaison()

      const pres = await listPresencesEntreDates(limites.debut, limites.fin)
      setPresences(pres)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const compteurs = participants
    .map((p) => {
      const total = presences.filter((pr) => pr.participant_id === p.id && pr.present).length
      return { ...p, total }
    })
    .sort((a, b) => b.total - a.total)

  const maxTotal = Math.max(1, ...compteurs.map((c) => c.total))

  return (
    <div>
      <ViewHeader title="Statistiques" subtitle="Nombre de présences enregistrées par participant" />

      <div className="card" style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {PERIODES.map((p) => (
            <button
              key={p.id}
              className={`btn ${periode === p.id ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setPeriode(p.id)}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      <div className="card">
        {loading ? (
          <p>Chargement…</p>
        ) : participants.length === 0 ? (
          <EmptyState icon="📊" title="Aucun participant" description="Ajoutez des participants pour voir apparaître leurs statistiques." />
        ) : (
          <div>
            {compteurs.map((c) => (
              <div key={c.id} style={{ marginBottom: 14 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5, fontSize: 14 }}>
                  <span style={{ fontWeight: 600 }}>{c.prenom} {c.nom}</span>
                  <span style={{ color: 'var(--texte-doux)' }}>{c.total} présence{c.total > 1 ? 's' : ''}</span>
                </div>
                <div style={{ background: 'var(--fond)', borderRadius: 6, height: 8, overflow: 'hidden' }}>
                  <div
                    style={{
                      width: `${(c.total / maxTotal) * 100}%`,
                      background: 'var(--orange)',
                      height: '100%',
                      borderRadius: 6,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
