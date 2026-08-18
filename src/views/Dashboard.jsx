import React, { useEffect, useState } from 'react'
import { ViewHeader, EmptyState } from '../lib/ui'
import { getProchainEvent, getProchainJourEntrainement, listPresencesRecentes } from '../lib/db'
import { formatDateFr, formatPlageHoraire } from '../lib/format'

export default function Dashboard() {
  const [prochainEntrainement, setProchainEntrainement] = useState(null)
  const [prochainEvent, setProchainEvent] = useState(null)
  const [dernieresPresences, setDernieresPresences] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    charger()
  }, [])

  async function charger() {
    setLoading(true)
    try {
      const [entrainement, event, presences] = await Promise.all([
        getProchainJourEntrainement(),
        getProchainEvent(),
        listPresencesRecentes(8),
      ])
      setProchainEntrainement(entrainement)
      setProchainEvent(event)
      setDernieresPresences(presences)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <div className="main-content-loading">Chargement…</div>

  return (
    <div>
      <ViewHeader title="Tableau de bord" subtitle="Vue d'ensemble de l'activité du club" />

      <div className="grid-2">
        <div className="card">
          <div className="card-title">Prochain entraînement</div>
          {prochainEntrainement ? (
            <div>
              <div style={{ fontSize: 17, fontWeight: 700, color: 'var(--marine)' }}>
                {formatDateFr(prochainEntrainement.date, { withWeekday: true })}
              </div>
              <div style={{ color: 'var(--texte-doux)', marginTop: 4 }}>
                {prochainEntrainement.label}
                {formatPlageHoraire(prochainEntrainement.heure_debut, prochainEntrainement.heure_fin)
                  ? ` — ${formatPlageHoraire(prochainEntrainement.heure_debut, prochainEntrainement.heure_fin)}`
                  : ''}
              </div>
            </div>
          ) : (
            <p style={{ color: 'var(--texte-doux)', margin: 0 }}>Aucun entraînement à venir planifié.</p>
          )}
        </div>

        <div className="card">
          <div className="card-title">Prochain événement</div>
          {prochainEvent ? (
            <div>
              <div style={{ fontSize: 17, fontWeight: 700, color: 'var(--marine)' }}>{prochainEvent.nom}</div>
              <div style={{ color: 'var(--texte-doux)', marginTop: 4 }}>
                {formatDateFr(prochainEvent.date_debut, { withWeekday: true })}
                {prochainEvent.lieu ? ` — ${prochainEvent.lieu}` : ''}
              </div>
            </div>
          ) : (
            <p style={{ color: 'var(--texte-doux)', margin: 0 }}>Aucun événement à venir planifié.</p>
          )}
        </div>
      </div>

      <div className="card">
        <div className="card-title">Dernières présences enregistrées</div>
        {dernieresPresences.length === 0 ? (
          <EmptyState icon="📋" title="Aucune présence enregistrée" description="Les présences pointées apparaîtront ici." />
        ) : (
          <div>
            {dernieresPresences.map((p) => (
              <div key={p.id} className="list-row">
                <span>{p.participants ? `${p.participants.prenom} ${p.participants.nom}` : 'Participant'}</span>
                <span style={{ color: 'var(--texte-doux)', fontSize: 13.5 }}>{formatDateFr(p.date)}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
