import React, { useEffect, useState } from 'react'
import { ViewHeader, EmptyState, Modal, Button } from '../lib/ui'
import { listEvents, createEvent, updateEvent, deleteEvent } from '../lib/db'
import { genererGrilleMois, nomMois, nomJourCourt, formatDateFr, todayISO } from '../lib/format'

const TYPES = ['Compétition', 'Stage', 'Réunion', 'Sortie', 'Autre']
const VIDE = { type: 'Compétition', nom: '', lieu: '', date_debut: '', date_fin: '', notes: '' }

export default function Calendrier() {
  const [date, setDate] = useState(new Date())
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)

  const [modalOuvert, setModalOuvert] = useState(false)
  const [enEdition, setEnEdition] = useState(null)
  const [form, setForm] = useState(VIDE)
  const [enregistrement, setEnregistrement] = useState(false)
  const [modalJour, setModalJour] = useState(null)

  useEffect(() => {
    charger()
  }, [])

  async function charger() {
    setLoading(true)
    try {
      setEvents(await listEvents())
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const annee = date.getFullYear()
  const mois = date.getMonth()
  const grille = genererGrilleMois(annee, mois)

  function eventsPourJour(iso) {
    return events.filter((e) => iso >= e.date_debut && iso <= (e.date_fin || e.date_debut))
  }

  function moisPrecedent() {
    setDate(new Date(annee, mois - 1, 1))
  }
  function moisSuivant() {
    setDate(new Date(annee, mois + 1, 1))
  }

  function ouvrirAjout(iso) {
    setEnEdition(null)
    setForm({ ...VIDE, date_debut: iso || todayISO(), date_fin: iso || todayISO() })
    setModalOuvert(true)
  }

  function clicSurJour(iso) {
    const evts = eventsPourJour(iso)
    if (evts.length === 0) {
      ouvrirAjout(iso)
    } else if (evts.length === 1) {
      ouvrirEdition(evts[0])
    } else {
      setModalJour(iso)
    }
  }

  function ouvrirEdition(e) {
    setEnEdition(e)
    setForm({
      type: e.type || 'Autre',
      nom: e.nom || '',
      lieu: e.lieu || '',
      date_debut: e.date_debut || '',
      date_fin: e.date_fin || e.date_debut || '',
      notes: e.notes || '',
    })
    setModalOuvert(true)
  }

  async function enregistrer(e) {
    e.preventDefault()
    setEnregistrement(true)
    try {
      if (enEdition) {
        await updateEvent(enEdition.id, form)
      } else {
        await createEvent(form)
      }
      setModalOuvert(false)
      await charger()
    } catch (err) {
      console.error(err)
      alert("Erreur lors de l'enregistrement de l'événement.")
    } finally {
      setEnregistrement(false)
    }
  }

  async function supprimer(e) {
    if (!confirm(`Supprimer l'événement "${e.nom}" ?`)) return
    try {
      await deleteEvent(e.id)
      await charger()
    } catch (err) {
      console.error(err)
      alert('Erreur lors de la suppression.')
    }
  }

  const evenementsDuMois = events
    .filter((e) => {
      const debutMois = new Date(annee, mois, 1)
      const finMois = new Date(annee, mois + 1, 0)
      return new Date(e.date_debut) <= finMois && new Date(e.date_fin || e.date_debut) >= debutMois
    })
    .sort((a, b) => a.date_debut.localeCompare(b.date_debut))

  return (
    <div>
      <ViewHeader
        title="Calendrier"
        subtitle="Événements du club : compétitions, stages, sorties…"
        action={<Button onClick={() => ouvrirAjout()}>+ Ajouter un événement</Button>}
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
            const evts = eventsPourJour(cellule.iso)
            const estAujourdhui = cellule.iso === todayISO()
            const classes = ['calendar-cell', 'clickable']
            if (evts.length > 0) classes.push('entrainement')
            if (estAujourdhui) classes.push('today')
            return (
              <div key={i} className={classes.join(' ')} onClick={() => clicSurJour(cellule.iso)}>
                <span>{cellule.jour}</span>
                {evts.length > 0 && <span className="calendar-dot" />}
                {evts.length > 1 && (
                  <span style={{ fontSize: 10, color: 'var(--orange)', fontWeight: 700 }}>{evts.length}</span>
                )}
              </div>
            )
          })}
        </div>
      </div>

      <div className="card calendar-event-list">
        <div className="card-title">Événements du mois</div>
        {loading ? (
          <p>Chargement…</p>
        ) : evenementsDuMois.length === 0 ? (
          <EmptyState icon="📅" title="Aucun événement ce mois-ci" description="Ajoutez un événement pour qu'il apparaisse ici." />
        ) : (
          <div>
            {evenementsDuMois.map((e) => (
              <div key={e.id} className="list-row">
                <div>
                  <div style={{ fontWeight: 600 }}>
                    {e.nom} <span className="badge badge-orange">{e.type}</span>
                  </div>
                  <div style={{ color: 'var(--texte-doux)', fontSize: 13, marginTop: 3 }}>
                    {formatDateFr(e.date_debut)}
                    {e.date_fin && e.date_fin !== e.date_debut ? ` → ${formatDateFr(e.date_fin)}` : ''}
                    {e.lieu ? ` — ${e.lieu}` : ''}
                  </div>
                </div>
                <div className="table-actions">
                  <button className="icon-btn" onClick={() => ouvrirEdition(e)}>Modifier</button>
                  <button className="icon-btn" onClick={() => supprimer(e)}>Supprimer</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {modalJour && (
        <Modal
          title={`Événements du ${formatDateFr(modalJour, { withWeekday: true })}`}
          onClose={() => setModalJour(null)}
          footer={
            <>
              <Button variant="secondary" onClick={() => setModalJour(null)}>Fermer</Button>
              <Button
                onClick={() => {
                  const jourAjout = modalJour
                  setModalJour(null)
                  ouvrirAjout(jourAjout)
                }}
              >
                + Ajouter un autre événement ce jour
              </Button>
            </>
          }
        >
          <div>
            {eventsPourJour(modalJour).map((e) => (
              <div key={e.id} className="list-row">
                <div>
                  <div style={{ fontWeight: 600 }}>
                    {e.nom} <span className="badge badge-orange">{e.type}</span>
                  </div>
                  {e.lieu && <div style={{ color: 'var(--texte-doux)', fontSize: 13, marginTop: 3 }}>{e.lieu}</div>}
                </div>
                <div className="table-actions">
                  <button
                    className="icon-btn"
                    onClick={() => {
                      setModalJour(null)
                      ouvrirEdition(e)
                    }}
                  >
                    Modifier
                  </button>
                  <button
                    className="icon-btn"
                    onClick={async () => {
                      await supprimer(e)
                      const restants = eventsPourJour(modalJour).filter((ev) => ev.id !== e.id)
                      if (restants.length === 0) setModalJour(null)
                    }}
                  >
                    Supprimer
                  </button>
                </div>
              </div>
            ))}
          </div>
        </Modal>
      )}

      {modalOuvert && (
        <Modal
          title={enEdition ? "Modifier l'événement" : 'Ajouter un événement'}
          onClose={() => setModalOuvert(false)}
          footer={
            <>
              <Button variant="secondary" onClick={() => setModalOuvert(false)}>Annuler</Button>
              <Button onClick={enregistrer} disabled={enregistrement}>
                {enregistrement ? 'Enregistrement…' : 'Enregistrer'}
              </Button>
            </>
          }
        >
          <form onSubmit={enregistrer}>
            <div className="form-group">
              <label>Type</label>
              <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
                {TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Nom de l'événement</label>
              <input required value={form.nom} onChange={(e) => setForm({ ...form, nom: e.target.value })} />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Date de début</label>
                <input type="date" required value={form.date_debut} onChange={(e) => setForm({ ...form, date_debut: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Date de fin</label>
                <input type="date" value={form.date_fin} onChange={(e) => setForm({ ...form, date_fin: e.target.value })} />
              </div>
            </div>
            <div className="form-group">
              <label>Lieu</label>
              <input value={form.lieu} onChange={(e) => setForm({ ...form, lieu: e.target.value })} />
            </div>
            <div className="form-group">
              <label>Notes (optionnel)</label>
              <textarea rows={3} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
            </div>
          </form>
        </Modal>
      )}
    </div>
  )
}
