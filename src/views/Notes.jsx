import React, { useEffect, useState } from 'react'
import { ViewHeader, EmptyState, Modal, Button } from '../lib/ui'
import { listNotes, createNote, updateNote, deleteNote, listEvents } from '../lib/db'
import { formatDateFr, todayISO } from '../lib/format'

const VIDE = { titre: '', date: todayISO(), evenement_id: '', contenu: '' }

export default function Notes() {
  const [notes, setNotes] = useState([])
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)

  const [modalOuvert, setModalOuvert] = useState(false)
  const [enEdition, setEnEdition] = useState(null)
  const [form, setForm] = useState(VIDE)
  const [enregistrement, setEnregistrement] = useState(false)
  const [confirmSuppression, setConfirmSuppression] = useState(null)

  useEffect(() => {
    charger()
  }, [])

  async function charger() {
    setLoading(true)
    try {
      const [n, e] = await Promise.all([listNotes(), listEvents()])
      setNotes(n)
      setEvents(e)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  function ouvrirAjout() {
    setEnEdition(null)
    setForm(VIDE)
    setModalOuvert(true)
  }

  function ouvrirEdition(n) {
    setEnEdition(n)
    setForm({
      titre: n.titre || '',
      date: n.date || '',
      evenement_id: n.evenement_id || '',
      contenu: n.contenu || '',
    })
    setModalOuvert(true)
  }

  async function enregistrer(e) {
    e.preventDefault()
    setEnregistrement(true)
    try {
      const payload = { ...form, evenement_id: form.evenement_id || null, date: form.date || null }
      if (enEdition) {
        await updateNote(enEdition.id, payload)
      } else {
        await createNote(payload)
      }
      setModalOuvert(false)
      await charger()
    } catch (err) {
      console.error(err)
      alert("Erreur lors de l'enregistrement de la note.")
    } finally {
      setEnregistrement(false)
    }
  }

  async function confirmerSuppression() {
    try {
      await deleteNote(confirmSuppression.id)
      setConfirmSuppression(null)
      await charger()
    } catch (err) {
      console.error(err)
      alert('Erreur lors de la suppression.')
    }
  }

  return (
    <div>
      <ViewHeader
        title="Notes"
        subtitle="Résumés de compétitions et autres notes du club"
        action={<Button onClick={ouvrirAjout}>+ Ajouter une note</Button>}
      />

      <div className="card">
        {loading ? (
          <p>Chargement…</p>
        ) : notes.length === 0 ? (
          <EmptyState
            icon="📝"
            title="Aucune note"
            description="Ajoutez votre première note, par exemple un résumé de compétition."
          />
        ) : (
          <div>
            {notes.map((n) => (
              <div key={n.id} className="list-row" style={{ alignItems: 'flex-start' }}>
                <div>
                  <div style={{ fontWeight: 700, color: 'var(--marine)' }}>
                    {n.titre}
                    {n.events && <span className="badge badge-orange" style={{ marginLeft: 8 }}>{n.events.nom}</span>}
                  </div>
                  {n.date && (
                    <div style={{ color: 'var(--texte-doux)', fontSize: 13, marginTop: 2 }}>
                      {formatDateFr(n.date)}
                    </div>
                  )}
                  {n.contenu && (
                    <div style={{ marginTop: 8, fontSize: 14.5, whiteSpace: 'pre-wrap' }}>{n.contenu}</div>
                  )}
                </div>
                <div className="table-actions">
                  <button className="icon-btn" onClick={() => ouvrirEdition(n)}>Modifier</button>
                  <button className="icon-btn" onClick={() => setConfirmSuppression(n)}>Supprimer</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {modalOuvert && (
        <Modal
          title={enEdition ? 'Modifier la note' : 'Ajouter une note'}
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
              <label>Titre</label>
              <input
                required
                placeholder="Ex : Résumé — Championnat régional"
                value={form.titre}
                onChange={(e) => setForm({ ...form, titre: e.target.value })}
              />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Date</label>
                <input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Compétition liée (optionnel)</label>
                <select value={form.evenement_id} onChange={(e) => setForm({ ...form, evenement_id: e.target.value })}>
                  <option value="">Aucune</option>
                  {events.map((ev) => (
                    <option key={ev.id} value={ev.id}>{ev.nom}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="form-group">
              <label>Contenu</label>
              <textarea
                rows={6}
                placeholder="Résultats, points forts, remarques…"
                value={form.contenu}
                onChange={(e) => setForm({ ...form, contenu: e.target.value })}
              />
            </div>
          </form>
        </Modal>
      )}

      {confirmSuppression && (
        <Modal
          title="Confirmer la suppression"
          onClose={() => setConfirmSuppression(null)}
          footer={
            <>
              <Button variant="secondary" onClick={() => setConfirmSuppression(null)}>Annuler</Button>
              <Button variant="danger" onClick={confirmerSuppression}>Supprimer définitivement</Button>
            </>
          }
        >
          <p>Voulez-vous vraiment supprimer la note <strong>{confirmSuppression.titre}</strong> ?</p>
        </Modal>
      )}
    </div>
  )
}
