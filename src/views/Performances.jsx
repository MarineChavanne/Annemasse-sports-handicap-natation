import React, { useEffect, useState } from 'react'
import { ViewHeader, EmptyState, Modal, Button } from '../lib/ui'
import { listParticipants, listPerformancesParParticipant, creerPerformancesEnMasse, deletePerformance } from '../lib/db'
import { formatDateFr } from '../lib/format'

const ORDRE_NAGES = ['NL', 'DOS', 'BR', 'PAP', '3N', '4N']
const LABELS_NAGES = {
  NL: 'Nage Libre',
  DOS: 'Dos',
  BR: 'Brasse',
  PAP: 'Papillon',
  '3N': '3 Nages',
  '4N': '4 Nages',
}
const BASSINS = [25, 50]

function ligneVide() {
  return { bassin: 25, nage: 'NL', distance: '', temps: '', lieu: '', date: '', points: '' }
}

export default function Performances() {
  const [participants, setParticipants] = useState([])
  const [nageurSelectionne, setNageurSelectionne] = useState(null)
  const [performances, setPerformances] = useState([])
  const [loading, setLoading] = useState(true)
  const [chargementFiche, setChargementFiche] = useState(false)

  const [modalImport, setModalImport] = useState(false)
  const [nageurImport, setNageurImport] = useState('')
  const [lignes, setLignes] = useState([ligneVide()])
  const [enregistrement, setEnregistrement] = useState(false)

  useEffect(() => {
    chargerParticipants()
  }, [])

  async function chargerParticipants() {
    setLoading(true)
    try {
      const p = await listParticipants()
      setParticipants(p)
      if (p.length > 0 && !nageurSelectionne) {
        selectionnerNageur(p[0])
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  async function selectionnerNageur(p) {
    setNageurSelectionne(p)
    setChargementFiche(true)
    try {
      setPerformances(await listPerformancesParParticipant(p.id))
    } catch (err) {
      console.error(err)
    } finally {
      setChargementFiche(false)
    }
  }

  function ouvrirImport() {
    setNageurImport(nageurSelectionne ? nageurSelectionne.id : (participants[0]?.id || ''))
    setLignes([ligneVide()])
    setModalImport(true)
  }

  function majLigne(index, champ, valeur) {
    setLignes((prev) => prev.map((l, i) => (i === index ? { ...l, [champ]: valeur } : l)))
  }

  function ajouterLigne() {
    setLignes((prev) => [...prev, ligneVide()])
  }

  function supprimerLigne(index) {
    setLignes((prev) => prev.filter((_, i) => i !== index))
  }

  async function lancerImport(e) {
    e.preventDefault()
    if (!nageurImport) {
      alert('Sélectionnez un nageur.')
      return
    }
    const lignesValides = lignes.filter((l) => l.temps.trim() !== '')
    if (lignesValides.length === 0) {
      alert('Renseignez au moins un temps.')
      return
    }
    setEnregistrement(true)
    try {
      const payload = lignesValides.map((l) => ({
        participant_id: nageurImport,
        bassin: Number(l.bassin),
        nage: l.nage,
        distance: l.distance ? Number(l.distance) : null,
        temps: l.temps.trim(),
        lieu: l.lieu.trim() || null,
        date: l.date || null,
        points: l.points ? Number(l.points) : null,
      }))
      await creerPerformancesEnMasse(payload)
      setModalImport(false)
      if (nageurSelectionne && nageurSelectionne.id === nageurImport) {
        await selectionnerNageur(nageurSelectionne)
      }
      alert(`${payload.length} performance(s) enregistrée(s) avec succès.`)
    } catch (err) {
      console.error(err)
      alert("Erreur lors de l'import. Vérifiez les champs (temps obligatoire sur chaque ligne remplie).")
    } finally {
      setEnregistrement(false)
    }
  }

  async function supprimer(perf) {
    if (!confirm(`Supprimer cette performance (${LABELS_NAGES[perf.nage]} — ${perf.temps}) ?`)) return
    try {
      await deletePerformance(perf.id)
      await selectionnerNageur(nageurSelectionne)
    } catch (err) {
      console.error(err)
      alert('Erreur lors de la suppression.')
    }
  }

  return (
    <div>
      <ViewHeader
        title="Performances"
        subtitle="Fiche de temps par nageur, organisée par bassin et par nage"
        action={<Button onClick={ouvrirImport}>+ Import en masse</Button>}
      />

      {loading ? (
        <p>Chargement…</p>
      ) : participants.length === 0 ? (
        <div className="card">
          <EmptyState icon="🏊" title="Aucun participant" description="Ajoutez des participants pour pouvoir enregistrer leurs performances." />
        </div>
      ) : (
        <div style={{ display: 'flex', gap: 20, alignItems: 'flex-start', flexWrap: 'wrap' }}>
          <div className="card" style={{ minWidth: 220, flex: '0 0 220px' }}>
            <div className="card-title">Nageurs</div>
            {participants.map((p) => (
              <button
                key={p.id}
                onClick={() => selectionnerNageur(p)}
                className="icon-btn"
                style={{
                  display: 'block',
                  width: '100%',
                  textAlign: 'left',
                  marginBottom: 6,
                  background: nageurSelectionne?.id === p.id ? 'var(--orange-clair)' : '#fff',
                  borderColor: nageurSelectionne?.id === p.id ? '#f5c19b' : 'var(--bordure)',
                  fontWeight: nageurSelectionne?.id === p.id ? 700 : 400,
                }}
              >
                {p.prenom} {p.nom}
              </button>
            ))}
          </div>

          <div style={{ flex: 1, minWidth: 320 }}>
            {nageurSelectionne && (
              <>
                <h2 style={{ color: 'var(--marine)', marginTop: 0 }}>
                  {nageurSelectionne.prenom} {nageurSelectionne.nom}
                </h2>
                {chargementFiche ? (
                  <p>Chargement de la fiche…</p>
                ) : performances.length === 0 ? (
                  <div className="card">
                    <EmptyState icon="⏱️" title="Aucune performance enregistrée" description="Utilisez l'import en masse pour ajouter ses temps." />
                  </div>
                ) : (
                  BASSINS.map((bassin) => {
                    const perfsBassin = performances.filter((p) => p.bassin === bassin)
                    if (perfsBassin.length === 0) return null
                    return (
                      <div key={bassin} className="card">
                        <div className="card-title">Bassin de {bassin}m</div>
                        {ORDRE_NAGES.map((nage) => {
                          const perfsNage = perfsBassin.filter((p) => p.nage === nage)
                          if (perfsNage.length === 0) return null
                          return (
                            <div key={nage} style={{ marginBottom: 14 }}>
                              <div style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--orange)', textTransform: 'uppercase', letterSpacing: '0.03em', marginBottom: 4 }}>
                                {LABELS_NAGES[nage]}
                              </div>
                              {perfsNage.map((perf) => (
                                <div key={perf.id} className="list-row">
                                  <div>
                                    <span style={{ fontWeight: 600 }}>
                                      {perf.distance ? `${perf.distance}m` : ''} — {perf.temps}
                                    </span>
                                    <span style={{ color: 'var(--texte-doux)', fontSize: 13, marginLeft: 8 }}>
                                      {[perf.lieu, perf.date ? formatDateFr(perf.date) : null, perf.points ? `${perf.points} pts` : null]
                                        .filter(Boolean)
                                        .join(' — ')}
                                    </span>
                                  </div>
                                  <button className="icon-btn" onClick={() => supprimer(perf)}>Supprimer</button>
                                </div>
                              ))}
                            </div>
                          )
                        })}
                      </div>
                    )
                  })
                )}
              </>
            )}
          </div>
        </div>
      )}

      {modalImport && (
        <Modal
          title="Import en masse de performances"
          onClose={() => setModalImport(false)}
          footer={
            <>
              <Button variant="secondary" onClick={() => setModalImport(false)}>Annuler</Button>
              <Button onClick={lancerImport} disabled={enregistrement}>
                {enregistrement ? 'Enregistrement…' : 'Enregistrer les performances'}
              </Button>
            </>
          }
        >
          <form onSubmit={lancerImport}>
            <div className="form-group">
              <label>Nageur</label>
              <select value={nageurImport} onChange={(e) => setNageurImport(e.target.value)}>
                {participants.map((p) => (
                  <option key={p.id} value={p.id}>{p.prenom} {p.nom}</option>
                ))}
              </select>
            </div>

            {lignes.map((ligne, i) => (
              <div key={i} style={{ border: '1px solid var(--bordure)', borderRadius: 10, padding: 12, marginBottom: 10 }}>
                <div className="form-row">
                  <div className="form-group">
                    <label>Bassin</label>
                    <select value={ligne.bassin} onChange={(e) => majLigne(i, 'bassin', e.target.value)}>
                      <option value={25}>25m</option>
                      <option value={50}>50m</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Nage</label>
                    <select value={ligne.nage} onChange={(e) => majLigne(i, 'nage', e.target.value)}>
                      {ORDRE_NAGES.map((n) => (
                        <option key={n} value={n}>{LABELS_NAGES[n]}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Distance (m)</label>
                    <input type="number" placeholder="100" value={ligne.distance} onChange={(e) => majLigne(i, 'distance', e.target.value)} />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Temps</label>
                    <input placeholder="01:45.37" required={ligne.temps !== '' || i === 0} value={ligne.temps} onChange={(e) => majLigne(i, 'temps', e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label>Points (optionnel)</label>
                    <input type="number" value={ligne.points} onChange={(e) => majLigne(i, 'points', e.target.value)} />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Lieu</label>
                    <input value={ligne.lieu} onChange={(e) => majLigne(i, 'lieu', e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label>Date</label>
                    <input type="date" value={ligne.date} onChange={(e) => majLigne(i, 'date', e.target.value)} />
                  </div>
                </div>
                {lignes.length > 1 && (
                  <button type="button" className="icon-btn" onClick={() => supprimerLigne(i)}>
                    Retirer cette ligne
                  </button>
                )}
              </div>
            ))}

            <Button type="button" variant="secondary" onClick={ajouterLigne}>+ Ajouter une autre performance</Button>
          </form>
        </Modal>
      )}
    </div>
  )
}
