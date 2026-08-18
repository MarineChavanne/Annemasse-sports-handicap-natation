import React, { useEffect, useState } from 'react'
import { ViewHeader, EmptyState, Modal, Button } from '../lib/ui'
import { listParticipants, createParticipant, updateParticipant, deleteParticipant } from '../lib/db'
import { formatDateFr, ageDepuisNaissance } from '../lib/format'

const VIDE = { prenom: '', nom: '', nom_famille: '', naissance: '', email: '' }

export default function Participants() {
  const [participants, setParticipants] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalOuvert, setModalOuvert] = useState(false)
  const [enEdition, setEnEdition] = useState(null)
  const [form, setForm] = useState(VIDE)
  const [confirmSuppression, setConfirmSuppression] = useState(null)
  const [enregistrement, setEnregistrement] = useState(false)

  useEffect(() => {
    charger()
  }, [])

  async function charger() {
    setLoading(true)
    try {
      setParticipants(await listParticipants())
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

  function ouvrirEdition(p) {
    setEnEdition(p)
    setForm({
      prenom: p.prenom || '',
      nom: p.nom || '',
      nom_famille: p.nom_famille || '',
      naissance: p.naissance || '',
      email: p.email || '',
    })
    setModalOuvert(true)
  }

  async function enregistrer(e) {
    e.preventDefault()
    setEnregistrement(true)
    try {
      if (enEdition) {
        await updateParticipant(enEdition.id, form)
      } else {
        await createParticipant(form)
      }
      setModalOuvert(false)
      await charger()
    } catch (err) {
      console.error(err)
      alert("Erreur lors de l'enregistrement. Vérifiez les champs et réessayez.")
    } finally {
      setEnregistrement(false)
    }
  }

  async function confirmerSuppression() {
    try {
      await deleteParticipant(confirmSuppression.id)
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
        title="Participants"
        subtitle={`${participants.length} participant${participants.length > 1 ? 's' : ''}`}
        action={<Button onClick={ouvrirAjout}>+ Ajouter un participant</Button>}
      />

      <div className="card">
        {loading ? (
          <p>Chargement…</p>
        ) : participants.length === 0 ? (
          <EmptyState
            icon="🧑‍🤝‍🧑"
            title="Aucun participant"
            description="Ajoutez le premier participant pour commencer."
          />
        ) : (
          <table>
            <thead>
              <tr>
                <th>Nom</th>
                <th>Naissance</th>
                <th>Contact / responsable</th>
                <th>E-mail</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {participants.map((p) => (
                <tr key={p.id}>
                  <td style={{ fontWeight: 600 }}>{p.prenom} {p.nom}</td>
                  <td>
                    {p.naissance ? `${formatDateFr(p.naissance)} (${ageDepuisNaissance(p.naissance)} ans)` : '—'}
                  </td>
                  <td>{p.nom_famille || '—'}</td>
                  <td>{p.email || '—'}</td>
                  <td>
                    <div className="table-actions">
                      <button className="icon-btn" onClick={() => ouvrirEdition(p)}>Modifier</button>
                      <button className="icon-btn" onClick={() => setConfirmSuppression(p)}>Supprimer</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {modalOuvert && (
        <Modal
          title={enEdition ? 'Modifier le participant' : 'Ajouter un participant'}
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
            <div className="form-row">
              <div className="form-group">
                <label>Prénom</label>
                <input required value={form.prenom} onChange={(e) => setForm({ ...form, prenom: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Nom</label>
                <input required value={form.nom} onChange={(e) => setForm({ ...form, nom: e.target.value })} />
              </div>
            </div>
            <div className="form-group">
              <label>Date de naissance</label>
              <input type="date" value={form.naissance} onChange={(e) => setForm({ ...form, naissance: e.target.value })} />
            </div>
            <div className="form-group">
              <label>Contact / responsable (optionnel)</label>
              <input value={form.nom_famille} onChange={(e) => setForm({ ...form, nom_famille: e.target.value })} />
            </div>
            <div className="form-group">
              <label>E-mail</label>
              <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
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
          <p>
            Voulez-vous vraiment supprimer <strong>{confirmSuppression.prenom} {confirmSuppression.nom}</strong> ?
            Cette action est irréversible et supprimera aussi son historique de présences.
          </p>
        </Modal>
      )}
    </div>
  )
}
