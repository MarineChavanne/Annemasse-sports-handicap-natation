import React, { useEffect, useState } from 'react'
import { ViewHeader, EmptyState, Modal, Button } from '../lib/ui'
import { listParticipants, listPerformancesParParticipant, creerPerformancesEnMasse, createPerformance, deletePerformance } from '../lib/db'
import { formatDateFr, parserPerformancesTexte } from '../lib/format'

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

function formAjoutVide(nageurId = '') {
  return { participant_id: nageurId, bassin: 25, nage: 'NL', distance: '', temps: '', lieu: '', date: '', points: '' }
}

const TEXTE_EXEMPLE = `Bassin   : 25
Nage     : NL
Distance : 100
Temps    : 01:41.74
Lieu     : Ayse (Bonneville)
Date     : 2026-06-20
Points   : 98

Bassin   : 25
Nage     : DOS
Distance : 100
Temps    : 01:45.37
Lieu     : Ayse (Bonneville)
Date     : 2026-06-20
Points   : 247`

export default function Performances() {
  const [participants, setParticipants] = useState([])
  const [nageurSelectionne, setNageurSelectionne] = useState(null)
  const [performances, setPerformances] = useState([])
  const [loading, setLoading] = useState(true)
  const [chargementFiche, setChargementFiche] = useState(false)

  const [modalImport, setModalImport] = useState(false)
  const [nageurImport, setNageurImport] = useState('')
  const [texteImport, setTexteImport] = useState('')
  const [enregistrement, setEnregistrement] = useState(false)

  const [modalAjout, setModalAjout] = useState(false)
  const [formAjout, setFormAjout] = useState(formAjoutVide())

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
    setTexteImport('')
    setModalImport(true)
  }

  function ouvrirAjoutManuel() {
    setFormAjout(formAjoutVide(nageurSelectionne ? nageurSelectionne.id : (participants[0]?.id || '')))
    setModalAjout(true)
  }

  async function enregistrerAjoutManuel(e) {
    e.preventDefault()
    if (!formAjout.participant_id) {
      alert('Sélectionnez un nageur.')
      return
    }
    if (!formAjout.temps.trim()) {
      alert('Le temps est obligatoire.')
      return
    }
    setEnregistrement(true)
    try {
      await createPerformance({
        participant_id: formAjout.participant_id,
        bassin: Number(formAjout.bassin),
        nage: formAjout.nage,
        distance: formAjout.distance ? Number(formAjout.distance) : null,
        temps: formAjout.temps.trim(),
        lieu: formAjout.lieu.trim() || null,
        date: formAjout.date || null,
        points: formAjout.points ? Number(formAjout.points) : null,
      })
      setModalAjout(false)
      if (nageurSelectionne && nageurSelectionne.id === formAjout.participant_id) {
        await selectionnerNageur(nageurSelectionne)
      }
    } catch (err) {
      console.error(err)
      alert("Erreur lors de l'enregistrement de la performance.")
    } finally {
      setEnregistrement(false)
    }
  }

  const apercu = parserPerformancesTexte(texteImport)
  const lignesValides = apercu.filter((l) => l.valide)
  const lignesInvalides = apercu.filter((l) => !l.valide)

  async function lancerImport(e) {
    e.preventDefault()
    if (!nageurImport) {
      alert('Sélectionnez un nageur.')
      return
    }
    if (lignesValides.length === 0) {
      alert('Aucune performance valide détectée dans le texte collé.')
      return
    }
    setEnregistrement(true)
    try {
      const payload = lignesValides.map((l) => ({
        participant_id: nageurImport,
        bassin: l.bassin,
        nage: l.nage,
        distance: l.distance,
        temps: l.temps,
        lieu: l.lieu,
        date: l.date,
        points: l.points,
      }))
      await creerPerformancesEnMasse(payload)
      setModalImport(false)
      if (nageurSelectionne && nageurSelectionne.id === nageurImport) {
        await selectionnerNageur(nageurSelectionne)
      }
      alert(`${payload.length} performance(s) enregistrée(s) avec succès.`)
    } catch (err) {
      console.error(err)
      alert("Erreur lors de l'import.")
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
        action={
          <div style={{ display: 'flex', gap: 8 }}>
            <Button variant="secondary" onClick={ouvrirAjoutManuel}>+ Ajouter un temps</Button>
            <Button onClick={ouvrirImport}>+ Import en masse</Button>
          </div>
        }
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
              <Button onClick={lancerImport} disabled={enregistrement || lignesValides.length === 0}>
                {enregistrement ? 'Enregistrement…' : `Importer ${lignesValides.length} performance(s)`}
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

            <div className="form-group">
              <label>Collez le texte des performances ici</label>
              <textarea
                rows={10}
                style={{ fontFamily: 'monospace', fontSize: 13 }}
                placeholder={TEXTE_EXEMPLE}
                value={texteImport}
                onChange={(e) => setTexteImport(e.target.value)}
              />
              <div style={{ fontSize: 12.5, color: 'var(--texte-doux)', marginTop: 4 }}>
                Format accepté : blocs "Clé : Valeur" (Bassin, Nage, Distance, Temps, Lieu, Date, Points) comme dans
                les fichiers fournis, ou une ligne par performance séparée par des points-virgules :
                25;NL;100;01:41.74;Ayse (Bonneville);2026-06-20;98
              </div>
            </div>

            {apercu.length > 0 && (
              <div style={{ marginTop: 12 }}>
                <div style={{ fontWeight: 700, color: 'var(--marine)', marginBottom: 6, fontSize: 13.5 }}>
                  Aperçu — {lignesValides.length} performance(s) prête(s) à importer
                  {lignesInvalides.length > 0 ? `, ${lignesInvalides.length} ligne(s) ignorée(s)` : ''}
                </div>
                <div style={{ maxHeight: 220, overflowY: 'auto', border: '1px solid var(--bordure)', borderRadius: 8 }}>
                  {apercu.map((l, i) => (
                    <div
                      key={i}
                      style={{
                        padding: '8px 12px',
                        borderBottom: i < apercu.length - 1 ? '1px solid var(--bordure)' : 'none',
                        fontSize: 13,
                        background: l.valide ? '#fff' : '#fdeceb',
                      }}
                    >
                      {l.valide ? (
                        <span>
                          <strong>{l.bassin}m</strong> — {LABELS_NAGES[l.nage] || l.nage}
                          {l.distance ? ` ${l.distance}m` : ''} — {l.temps}
                          {l.lieu ? ` — ${l.lieu}` : ''}
                          {l.date ? ` — ${formatDateFr(l.date)}` : ''}
                          {l.points ? ` — ${l.points} pts` : ''}
                        </span>
                      ) : (
                        <span style={{ color: 'var(--rouge)' }}>
                          Ligne ignorée ({l.erreurs.join(', ')})
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </form>
        </Modal>
      )}
      {modalAjout && (
        <Modal
          title="Ajouter un temps"
          onClose={() => setModalAjout(false)}
          footer={
            <>
              <Button variant="secondary" onClick={() => setModalAjout(false)}>Annuler</Button>
              <Button onClick={enregistrerAjoutManuel} disabled={enregistrement}>
                {enregistrement ? 'Enregistrement…' : 'Enregistrer'}
              </Button>
            </>
          }
        >
          <form onSubmit={enregistrerAjoutManuel}>
            <div className="form-group">
              <label>Nageur</label>
              <select value={formAjout.participant_id} onChange={(e) => setFormAjout({ ...formAjout, participant_id: e.target.value })}>
                <option value="">— Choisir —</option>
                {participants.map((p) => (
                  <option key={p.id} value={p.id}>{p.prenom} {p.nom}</option>
                ))}
              </select>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Bassin</label>
                <select value={formAjout.bassin} onChange={(e) => setFormAjout({ ...formAjout, bassin: e.target.value })}>
                  <option value={25}>25m</option>
                  <option value={50}>50m</option>
                </select>
              </div>
              <div className="form-group">
                <label>Nage</label>
                <select value={formAjout.nage} onChange={(e) => setFormAjout({ ...formAjout, nage: e.target.value })}>
                  {ORDRE_NAGES.map((n) => (
                    <option key={n} value={n}>{LABELS_NAGES[n]}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Distance (m)</label>
                <input type="number" placeholder="100" value={formAjout.distance} onChange={(e) => setFormAjout({ ...formAjout, distance: e.target.value })} />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Temps</label>
                <input required placeholder="01:45.37" value={formAjout.temps} onChange={(e) => setFormAjout({ ...formAjout, temps: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Points (optionnel)</label>
                <input type="number" value={formAjout.points} onChange={(e) => setFormAjout({ ...formAjout, points: e.target.value })} />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Lieu (optionnel)</label>
                <input value={formAjout.lieu} onChange={(e) => setFormAjout({ ...formAjout, lieu: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Date (optionnel)</label>
                <input type="date" value={formAjout.date} onChange={(e) => setFormAjout({ ...formAjout, date: e.target.value })} />
              </div>
            </div>
          </form>
        </Modal>
      )}
    </div>
  )
}
