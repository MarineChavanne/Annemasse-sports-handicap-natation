import React, { useEffect, useState } from 'react'
import { supabase } from './lib/supabase'
import { getProfile, createProfile } from './lib/db'
import AppStyles from './lib/AppStyles'
import Auth from './lib/Auth'
import Dashboard from './views/Dashboard'
import Participants from './views/Participants'
import Presences from './views/Presences'
import Statistiques from './views/Statistiques'
import Calendrier from './views/Calendrier'
import Notes from './views/Notes'

const VUES = [
  { id: 'dashboard', label: 'Tableau de bord', icon: '🏠' },
  { id: 'participants', label: 'Participants', icon: '🧑‍🤝‍🧑' },
  { id: 'presences', label: 'Présences', icon: '✅' },
  { id: 'statistiques', label: 'Statistiques', icon: '📊' },
  { id: 'calendrier', label: 'Calendrier', icon: '📅' },
  { id: 'notes', label: 'Notes', icon: '📝' },
]

const TITRES = ['Entraîneur', 'Président', 'Responsable natation']

export default function App() {
  const [session, setSession] = useState(undefined) // undefined = chargement, null = déconnecté
  const [profile, setProfile] = useState(undefined)
  const [vue, setVue] = useState('dashboard')
  const [menuMobileOuvert, setMenuMobileOuvert] = useState(false)

  const isEntraineur = profile && profile.titre === 'Entraîneur'
  const vuesAutorisees = isEntraineur ? VUES.filter((v) => v.id === 'presences') : VUES

  // Le compte Entraîneur n'a accès qu'à l'onglet Présences
  useEffect(() => {
    if (isEntraineur && vue !== 'presences') {
      setVue('presences')
    }
  }, [isEntraineur])

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
            <button className="sidebar-logout" onClick={seDeconnecter}>Se déconnecter</button>
          </div>
        </div>

        <div className="main-content">
          {!isEntraineur && vue === 'dashboard' && <Dashboard />}
          {!isEntraineur && vue === 'participants' && <Participants />}
          {vue === 'presences' && <Presences isEntraineur={isEntraineur} />}
          {!isEntraineur && vue === 'statistiques' && <Statistiques />}
          {!isEntraineur && vue === 'calendrier' && <Calendrier />}
          {!isEntraineur && vue === 'notes' && <Notes />}
        </div>
      </div>
    </>
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
