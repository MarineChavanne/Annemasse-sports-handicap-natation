import React, { useEffect, useState } from 'react'
import { ViewHeader, EmptyState, Modal, Button } from '../lib/ui'
import {
  listParticipants,
  listJoursEntrainement,
  createJourEntrainement,
  updateJourEntrainement,
  deleteJourEntrainement,
  creerJoursEnMasse,
  listPresencesPourJour,
  enregistrerAppel,
} from '../lib/db'
import {
  genererGrilleMois,
  nomMois,
  nomJourCourt,
  formatDateFr,
  formatHeure,
  todayISO,
  genererDatesRecurrentes,
} from '../lib/format'

const JOUR_VIDE = { date: '', label: 'Entraînement', heure: '' }

const JOURS_SEMAINE = [
  { id: 1, label: 'Lundi' },
  { id: 2, label: 'Mardi' },
  { id: 3, label: 'Mercredi' },
  { id: 4, label: 'Jeudi' },
  { id: 5, label: 'Vendredi' },
  { id: 6, label: 'Samedi' },
  { id: 0, label: 'Dimanche' },
]

const IMPORT_MASSE_VIDE = { date_debut: '', date_fin: '', joursSemaine: [], label: 'Entraînement', heure: '' }

export default function Presences({ isEntraineur = false }) {
  const [date, setDate] = useState(new Date())
  const [participants, setParticipants] = useState([])
  const [jours, setJours] = useState([])
  const [loading, setLoading] = useState(true)

  const [modalNouveauJour, setModalNouveauJour] = useState(false)
  const [formJour, setFormJour] = useState(JOUR_VIDE)
  const [jourEnEdition, setJourEnEdition] = useState(null)

  const [modalImportMasse, setModalImportMasse] = useState(false)
  const [formImportMasse, setFormImportMasse] = useState(IMPORT_MASSE_VIDE)
  const [apercu, setApercu] = useState([])

  const [modalAppel, setModalAppel] = useState(null)
  const [etatAppel, setEtatAppel] = useState({})
  const [enregistrement, setEnregistrement] = useState(false)

  useEffect(() => {
    charger()
  }, [])

  async function charger() {
    setLoading(true)
    try {
      const [p, j] = await Promise.all([listParticipants(), listJoursEntrainement()])
      setParticipants(p)
      setJours(j)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const annee = date.getFullYear()
  const mois = date.getMonth()
  const grille = genererGrilleMois(annee, mois)
  const joursParDate = Object.fromEntries(jours.map((j) => [j.date, j]))

  function moisPrecedent() {
    setDate(new Date(annee, mois - 1, 1))
  }
  function moisSuivant() {
    setDate(new Date(annee, mois + 1, 1))
  }

  function clicSurJour(cellule) {
    if (!cellule) return
    const jourExistant = joursParDate[cellule.iso]
    if (jourExistant) {
      ouvrirAppel(jourExistant)
    } else if (!isEntraineur) {
      setFormJour({ date: cellule.iso, label: 'Entraînement', heure: '' })
      setJourEnEdition(null)
      setModalNouveauJour(true)
    }
  }

  function ouvrirAjoutJour() {
    setFormJour({ ...JOUR_VIDE, date: todayISO() })
    setJourEnEdition(null)
    setModalNouveauJour(true)
  }

  function ouvrirEditionJour(j) {
    setFormJour({ date: j.date, label: j.label || '', heure: j.heure || '' })
    setJourEnEdition(j)
    setModalNouveauJour(true)
  }

  async function enregistrerJour(e) {
    e.preventDefault()
    setEnregistrement(true)
    try {
      if (jourEnEdition) {
        await updateJourEntrainement(jourEnEdition.id, formJour)
      } else {
        await createJourEntrainement(formJour)
      }
      setModalNouveauJour(false)
      await charger()
    } catch (err) {
      console.error(err)
      alert("Erreur lors de l'enregistrement de ce jour d'entraînement.")
    } finally {
      setEnregistrement(false)
    }
  }

  async function supprimerJour(j) {
    if (!confirm(`Supprimer le jour d'entraînement du ${formatDateFr(j.date)} ?`)) return
    try {
      await deleteJourEntrainement(j.id)
      await charger()
    } catch (err) {
      console.error(err)
      alert('Erreur lors de la suppression.')
    }
  }

  // ---------- IMPORT EN MASSE ----------

  function ouvrirImportMasse() {
    setFormImportMasse(IMPORT_MASSE_VIDE)
    setApercu([])
    setModalImportMasse(true)
  }

  function toggleJourSemaine(id) {
    setFormImportMasse((prev) => {
      const deja = prev.joursSemaine.includes(id)
      const joursSemaine = deja ? prev.joursSemaine.filter((j) => j !== id) : [...prev.joursSemaine, id]
      return { ...prev, joursSemaine }
    })
  }

  useEffect(() => {
    if (!formImportMasse.date_debut || !formImportMasse.date_fin || formImportMasse.joursSemaine.length === 0) {
      setApercu([])
      return
    }
    const dates = genererDatesRecurrentes(formImportMasse.date_debut, formImportMasse.date_fin, formImportMasse.joursSemaine)
    setApercu(dates)
  }, [formImportMasse.date_debut, formImportMasse.date_fin, formImportMasse.joursSemaine])

  async function lancerImportMasse(e) {
    e.preventDefault()
    if (apercu.length === 0) {
      alert('Sélectionnez au moins une date valide (période et jours de la semaine).')
      return
    }
    setEnregistrement(true)
    try {
      const lignes = apercu.map((iso) => ({
        date: iso,
        label: formImportMasse.label || 'Entraînement',
        heure: formImportMasse.heure || null,
      }))
      await creerJoursEnMasse(lignes)
      setModalImportMasse(false)
      await charger()
      alert(`${lignes.length} entraînement(s) planifié(s) avec succès (les dates déjà existantes ont été ignorées).`)
    } catch (err) {
      console.error(err)
      alert("Erreur lors de l'import en masse.")
    } finally {
      setEnregistrement(false)
    }
  }

  // ---------- APPEL ----------

  async function ouvrirAppel(jour) {
    setModalAppel(jour)
    try {
      const presencesExistantes = await listPresencesPourJour(jour.id)
      const etat = {}
      participants.forEach((p) => {
        const existante = presencesExistantes.find((pr) => pr.participant_id === p.id)
        etat[p.id] = existante ? existante.present : false
      })
      setEtatAppel(etat)
    } catch (err) {
      console.error(err)
    }
  }

  function toggleParticipant(id, present) {
    setEtatAppel((prev) => ({ ...prev, [id]: present }))
  }

  async function enregistrerAppelCourant() {
    setEnregistrement(true)
    try {
      const lignes = participants.map((p) => ({ participant_id: p.id, present: !!etatAppel[p.id] }))
      await enregistrerAppel(modalAppel.id, modalAppel.date, lignes)
      setModalAppel(null)
    } catch (err) {
      console.error(err)
      alert("Erreur lors de l'enregistrement de l'appel.")
    } finally {
      setEnregistrement(false)
    }
  }

  const joursAVenir = jours.filter((j) => j.date >= todayISO()).slice(0, 8)

  return (
    <div>
      <ViewHeader
        title="Présences"
        subtitle={
          isEntraineur
            ? 'Cliquez sur un jour d\'entraînement planifié pour faire l\'appel'
            : "Cliquez sur un jour du calendrier pour faire l'appel, ou sur un jour vide pour planifier un entraînement"
        }
        action={
          !isEntraineur && (
            <div style={{ display: 'flex', gap: 8 }}>
              <Button variant="secondary" onClick={ouvrirImportMasse}>📅 Import en masse</Button>
              <Button onClick={ouvrirAjoutJour}>+ Planifier un entraînement</Button>
            </div>
          )
        }
      />

      <div className="card">
        <div className="calendar-nav">
          <button className="calendar-nav-btn" onClick={moisPrecedent}>‹</button>
          <h2>{nomMois(mois)} {annee}</h2>
          <button className="calendar-nav-btn" onClick={moisSuivant}>›</button>
        </div>

        <div className="calendar-grid">
          {[1, 2, 3, 4, 5, 6, 0].map((d) => (
            <div key={d} className="calendar-weekday">{nomJourCourt(d)}</div>
          ))}
          {grille.flat().map((cellule, i) => {
            if (!cellule) return <div key={i} className="calendar-cell empty" />
            const jourEntrainement = joursParDate[cellule.iso]
            const estAujourdhui = cellule.iso === todayISO()
            const estCliquable = !!jourEntrainement || !isEntraineur
            const classes = ['calendar-cell']
            if (estCliquable) classes.push('clickable')
            if (jourEntrainement) classes.push('entrainement')
            if (estAujourdhui) classes.push('today')
            return (
              <div key={i} className={classes.join(' ')} onClick={() => clicSurJour(cellule)}>
                <span>{cellule.jour}</span>
                {jourEntrainement && <span className="calendar-dot" />}
              </div>
            )
          })}
        </div>
      </div>

      <div className="card">
        <div className="card-title">Prochains entraînements planifiés</div>
        {loading ? (
          <p>Chargement…</p>
        ) : joursAVenir.length === 0 ? (
          <EmptyState
            icon="🗓️"
            title="Aucun entraînement planifié"
            description={
              isEntraineur
                ? "Aucun entraînement n'a encore été planifié."
                : "Ajoutez un jour d'entraînement pour commencer à faire l'appel."
            }
          />
        ) : (
          <div>
            {joursAVenir.map((j) => (
              <div key={j.id} className="list-row">
                <div>
                  <div style={{ fontWeight: 600 }}>{formatDateFr(j.date, { withWeekday: true })}</div>
                  <div style={{ color: 'var(--texte-doux)', fontSize: 13 }}>
                    {j.label}{j.heure ? ` — ${formatHeure(j.heure)}` : ''}
                  </div>
                </div>
                <div className="table-actions">
                  <button className="icon-btn" onClick={() => ouvrirAppel(j)}>Faire l'appel</button>
                  {!isEntraineur && (
                    <>
                      <button className="icon-btn" onClick={() => ouvrirEditionJour(j)}>Modifier</button>
                      <button className="icon-btn" onClick={() => supprimerJour(j)}>Supprimer</button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {modalNouveauJour && (
        <Modal
          title={jourEnEdition ? "Modifier l'entraînement" : 'Planifier un entraînement'}
          onClose={() => setModalNouveauJour(false)}
          footer={
            <>
              <Button variant="secondary" onClick={() => setModalNouveauJour(false)}>Annuler</Button>
              <Button onClick={enregistrerJour} disabled={enregistrement}>
                {enregistrement ? 'Enregistrement…' : 'Enregistrer'}
              </Button>
            </>
          }
        >
          <form onSubmit={enregistrerJour}>
            <div className="form-group">
              <label>Date</label>
              <input type="date" required value={formJour.date} onChange={(e) => setFormJour({ ...formJour, date: e.target.value })} />
            </div>
            <div className="form-group">
              <label>Libellé</label>
              <input required value={formJour.label} onChange={(e) => setFormJour({ ...formJour, label: e.target.value })} />
            </div>
            <div className="form-group">
              <label>Heure (optionnel)</label>
              <input type="time" value={formJour.heure} onChange={(e) => setFormJour({ ...formJour, heure: e.target.value })} />
            </div>
          </form>
        </Modal>
      )}

      {modalImportMasse && (
        <Modal
          title="Import en masse d'entraînements"
          onClose={() => setModalImportMasse(false)}
          footer={
            <>
              <Button variant="secondary" onClick={() => setModalImportMasse(false)}>Annuler</Button>
              <Button onClick={lancerImportMasse} disabled={enregistrement || apercu.length === 0}>
                {enregistrement ? 'Création…' : `Créer ${apercu.length} entraînement(s)`}
              </Button>
            </>
          }
        >
          <form onSubmit={lancerImportMasse}>
            <div className="form-row">
              <div className="form-group">
                <label>Du</label>
                <input
                  type="date"
                  required
                  value={formImportMasse.date_debut}
                  onChange={(e) => setFormImportMasse({ ...formImportMasse, date_debut: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Au</label>
                <input
                  type="date"
                  required
                  value={formImportMasse.date_fin}
                  onChange={(e) => setFormImportMasse({ ...formImportMasse, date_fin: e.target.value })}
                />
              </div>
            </div>

            <div className="form-group">
              <label>Jours de la semaine</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 4 }}>
                {JOURS_SEMAINE.map((j) => (
                  <button
                    type="button"
                    key={j.id}
                    className={`appel-btn ${formImportMasse.joursSemaine.includes(j.id) ? 'present active' : ''}`}
                    onClick={() => toggleJourSemaine(j.id)}
                  >
                    {j.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label>Libellé</label>
              <input
                required
                value={formImportMasse.label}
                onChange={(e) => setFormImportMasse({ ...formImportMasse, label: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>Heure (optionnel, identique pour toutes les dates)</label>
              <input
                type="time"
                value={formImportMasse.heure}
                onChange={(e) => setFormImportMasse({ ...formImportMasse, heure: e.target.value })}
              />
            </div>

            {apercu.length > 0 && (
              <div style={{ background: 'var(--fond)', borderRadius: 8, padding: 12, fontSize: 13.5, color: 'var(--texte-doux)' }}>
                <strong style={{ color: 'var(--marine)' }}>{apercu.length} date(s)</strong> seront créées, du{' '}
                {formatDateFr(apercu[0])} au {formatDateFr(apercu[apercu.length - 1])}. Les dates déjà planifiées seront
                automatiquement ignorées.
              </div>
            )}
          </form>
        </Modal>
      )}

      {modalAppel && (
        <Modal
          title={`Appel — ${formatDateFr(modalAppel.date, { withWeekday: true })}`}
          onClose={() => setModalAppel(null)}
          footer={
            <>
              <Button variant="secondary" onClick={() => setModalAppel(null)}>Fermer</Button>
              <Button onClick={enregistrerAppelCourant} disabled={enregistrement}>
                {enregistrement ? 'Enregistrement…' : "Enregistrer l'appel"}
              </Button>
            </>
          }
        >
          {participants.length === 0 ? (
            <EmptyState icon="🧑‍🤝‍🧑" title="Aucun participant" description="Ajoutez des participants avant de faire l'appel." />
          ) : (
            <div>
              {participants.map((p) => (
                <div key={p.id} className="appel-row">
                  <span>{p.prenom} {p.nom}</span>
                  <div className="appel-toggle">
                    <button
                      type="button"
                      className={`appel-btn present ${etatAppel[p.id] ? 'active' : ''}`}
                      onClick={() => toggleParticipant(p.id, true)}
                    >
                      Présent
                    </button>
                    <button
                      type="button"
                      className={`appel-btn absent ${!etatAppel[p.id] ? 'active' : ''}`}
                      onClick={() => toggleParticipant(p.id, false)}
                    >
                      Absent
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Modal>
      )}
    </div>
  )
}
