import React, { useEffect, useState } from 'react'
import { supabase } from './lib/supabase'
import { getProfile, createProfile } from './lib/db'
import AppStyles from './lib/AppStyles'
import { Modal, Button } from './lib/ui'
import Auth from './lib/Auth'
import Dashboard from './views/Dashboard'
import Participants from './views/Participants'
import Presences from './views/Presences'
import Statistiques from './views/Statistiques'
import Calendrier from './views/Calendrier'
import Notes from './views/Notes'
import Performances from './views/Performances'

const VUES = [
  { id: 'dashboard', label: 'Tableau de bord', icon: '🏠' },
  { id: 'participants', label: 'Participants', icon: '🧑‍🤝‍🧑' },
  { id: 'presences', label: 'Présences', icon: '✅' },
  { id: 'statistiques', label: 'Statistiques', icon: '📊' },
  { id: 'calendrier', label: 'Calendrier', icon: '📅' },
  { id: 'notes', label: 'Notes', icon: '📝' },
  { id: 'performances', label: 'Performances', icon: '🏊' },
]

const TITRES = ['Entraîneur', 'Président', 'Responsable natation']

export default function App() {
  const [session, setSession] = useState(undefined) // undefined = chargement, null = déconnecté
  const [profile, setProfile] = useState(undefined)
  const [vue, setVue] = useState('dashboard')
  const [menuMobileOuvert, setMenuMobileOuvert] = useState(false)
  const [modalMotDePasse, setModalMotDePasse] = useState(false)
  const [modalCreerCompte, setModalCreerCompte] = useState(false)

  const isEntraineur = profile && profile.titre === 'Entraîneur'
  const isResponsable = profile && profile.titre === 'Responsable natation'
  const vuesAutorisees = VUES

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
    })
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })
    return () => listener.subscription.unsubscribe()
  }, [])

  useEffect(() => {
    if (session === null) {
      setProfile(null)
      return
    }
    if (session) {
      chargerProfile(session.user.id)
    }
  }, [session])

  async function chargerProfile(userId) {
    setProfile(undefined)
    try {
      const p = await getProfile(userId)
      setProfile(p) // null si pas encore de profil
    } catch (err) {
      console.error(err)
      setProfile(null)
    }
  }

  async function seDeconnecter() {
    await supabase.auth.signOut()
  }

  if (session === undefined) {
    return (
      <>
        <AppStyles />
        <div style={{ padding: 60, textAlign: 'center', color: 'var(--texte-doux)' }}>Chargement…</div>
      </>
    )
  }

  if (!session) {
    return (
      <>
        <AppStyles />
        <Auth />
      </>
    )
  }

  if (profile === undefined) {
    return (
      <>
        <AppStyles />
        <div style={{ padding: 60, textAlign: 'center', color: 'var(--texte-doux)' }}>Chargement du profil…</div>
      </>
    )
  }

  if (profile === null) {
    return (
      <>
        <AppStyles />
        <CompleteProfile userId={session.user.id} onDone={() => chargerProfile(session.user.id)} />
      </>
    )
  }

  return (
    <>
      <AppStyles />
      <div className="app-shell">
        <div className="mobile-topbar">
          <span className="mobile-topbar-title">Annemasse Sports Handicap</span>
          <button className="mobile-menu-btn" onClick={() => setMenuMobileOuvert(true)}>☰</button>
        </div>

        <div className={`sidebar ${menuMobileOuvert ? 'mobile-open' : ''}`}>
          <div className="sidebar-title">
            Annemasse<br />Sports Handicap
            <button
              className="mobile-menu-btn"
              style={{ float: 'right', marginTop: -28 }}
              onClick={() => setMenuMobileOuvert(false)}
            >
              ✕
            </button>
          </div>
          <div className="sidebar-nav">
            {vuesAutorisees.map((v) => (
              <button
                key={v.id}
                className={`sidebar-link ${vue === v.id ? 'active' : ''}`}
                onClick={() => {
                  setVue(v.id)
                  setMenuMobileOuvert(false)
                }}
              >
                <span>{v.icon}</span> {v.label}
              </button>
            ))}
          </div>
          <div className="sidebar-footer">
            <div className="sidebar-user">{profile.nom} — {profile.titre}</div>
            {isResponsable && (
              <button className="sidebar-logout" style={{ marginBottom: 8 }} onClick={() => setModalCreerCompte(true)}>
                + Créer un compte
              </button>
            )}
            <button className="sidebar-logout" style={{ marginBottom: 8 }} onClick={() => setModalMotDePasse(true)}>
              Modifier le mot de passe
            </button>
            <button className="sidebar-logout" onClick={seDeconnecter}>Se déconnecter</button>
          </div>
        </div>

        <div className="main-content">
          {vue === 'dashboard' && <Dashboard />}
          {vue === 'participants' && <Participants />}
          {vue === 'presences' && <Presences isEntraineur={false} />}
          {vue === 'statistiques' && <Statistiques />}
          {vue === 'calendrier' && <Calendrier />}
          {vue === 'notes' && <Notes />}
          {vue === 'performances' && <Performances />}
        </div>
      </div>

      {modalMotDePasse && <ModifierMotDePasse onClose={() => setModalMotDePasse(false)} />}
      {modalCreerCompte && <CreerCompte onClose={() => setModalCreerCompte(false)} />}
    </>
  )
}

function ModifierMotDePasse({ onClose }) {
  const [nouveauMdp, setNouveauMdp] = useState('')
  const [confirmMdp, setConfirmMdp] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [succes, setSucces] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    if (nouveauMdp.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères.')
      return
    }
    if (nouveauMdp !== confirmMdp) {
      setError('Les deux mots de passe ne correspondent pas.')
      return
    }
    setLoading(true)
    try {
      const { error: err } = await supabase.auth.updateUser({ password: nouveauMdp })
      if (err) throw err
      setSucces(true)
    } catch (err) {
      console.error(err)
      setError("Erreur lors de la modification du mot de passe. Réessayez.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal
      title="Modifier le mot de passe"
      onClose={onClose}
      footer={
        succes ? (
          <Button onClick={onClose}>Fermer</Button>
        ) : (
          <>
            <Button variant="secondary" onClick={onClose}>Annuler</Button>
            <Button onClick={handleSubmit} disabled={loading}>
              {loading ? 'Modification…' : 'Modifier'}
            </Button>
          </>
        )
      }
    >
      {succes ? (
        <p>Votre mot de passe a bien été modifié. Vous pouvez fermer cette fenêtre.</p>
      ) : (
        <form onSubmit={handleSubmit}>
          {error && <div className="auth-error">{error}</div>}
          <div className="form-group">
            <label>Nouveau mot de passe</label>
            <input
              type="password"
              required
              minLength={6}
              value={nouveauMdp}
              onChange={(e) => setNouveauMdp(e.target.value)}
              autoComplete="new-password"
            />
          </div>
          <div className="form-group">
            <label>Confirmer le nouveau mot de passe</label>
            <input
              type="password"
              required
              minLength={6}
              value={confirmMdp}
              onChange={(e) => setConfirmMdp(e.target.value)}
              autoComplete="new-password"
            />
          </div>
        </form>
      )}
    </Modal>
  )
}

function CompleteProfile({ userId, onDone }) {
  const [nom, setNom] = useState('')
  const [titre, setTitre] = useState(TITRES[0])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await createProfile({ id: userId, nom, titre })
      onDone()
    } catch (err) {
      console.error(err)
      setError('Erreur lors de la création du profil. Réessayez.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-screen">
      <div className="auth-card">
        <div className="auth-logo">Bienvenue 👋</div>
        <div className="auth-tagline">Complétez votre profil pour continuer</div>

        {error && <div className="auth-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Votre nom complet</label>
            <input required value={nom} onChange={(e) => setNom(e.target.value)} />
          </div>
          <div className="form-group">
            <label>Votre rôle</label>
            <select value={titre} onChange={(e) => setTitre(e.target.value)}>
              {TITRES.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }} disabled={loading}>
            {loading ? 'Enregistrement…' : 'Continuer'}
          </button>
        </form>
      </div>
    </div>
  )
}

function CreerCompte({ onClose }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [nom, setNom] = useState('')
  const [titre, setTitre] = useState('Président')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [succes, setSucces] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const reponse = await fetch('/api/creer-compte', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ email, password, nom, titre }),
      })
      const resultat = await reponse.json()
      if (!reponse.ok) {
        throw new Error(resultat.error || 'Erreur inconnue')
      }
      setSucces(true)
    } catch (err) {
      console.error(err)
      setError(err.message || "Erreur lors de la création du compte.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal
      title="Créer un compte"
      onClose={onClose}
      footer={
        succes ? (
          <Button onClick={onClose}>Fermer</Button>
        ) : (
          <>
            <Button variant="secondary" onClick={onClose}>Annuler</Button>
            <Button onClick={handleSubmit} disabled={loading}>
              {loading ? 'Création…' : 'Créer le compte'}
            </Button>
          </>
        )
      }
    >
      {succes ? (
        <p>
          Le compte de <strong>{nom}</strong> ({titre}) a bien été créé. Communiquez-lui l'adresse e-mail{' '}
          <strong>{email}</strong> et le mot de passe prévisionnel que vous avez défini — la personne pourra
          se connecter directement.
        </p>
      ) : (
        <form onSubmit={handleSubmit}>
          {error && <div className="auth-error">{error}</div>}
          <div className="form-group">
            <label>Nom complet</label>
            <input required value={nom} onChange={(e) => setNom(e.target.value)} />
          </div>
          <div className="form-group">
            <label>Rôle</label>
            <select value={titre} onChange={(e) => setTitre(e.target.value)}>
              <option value="Président">Président</option>
              <option value="Entraîneur">Entraîneur</option>
            </select>
          </div>
          <div className="form-group">
            <label>Adresse e-mail</label>
            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div className="form-group">
            <label>Mot de passe prévisionnel</label>
            <input
              type="text"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Au moins 6 caractères"
            />
          </div>
        </form>
      )}
    </Modal>
  )
}
