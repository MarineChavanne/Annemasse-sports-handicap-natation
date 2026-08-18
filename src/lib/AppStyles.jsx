import React from 'react'

const css = `
:root {
  --marine: #0b2545;
  --marine-clair: #13385e;
  --orange: #f2762e;
  --orange-clair: #ffe4d1;
  --fond: #f6f7f9;
  --carte: #ffffff;
  --texte: #1c2733;
  --texte-doux: #5c6b7a;
  --bordure: #e3e7ec;
  --vert: #2e9e5b;
  --rouge: #d64545;
  --rayon: 12px;
  --ombre: 0 2px 10px rgba(11, 37, 69, 0.06);
}

* { box-sizing: border-box; }

body {
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  background: var(--fond);
  color: var(--texte);
}

button { font-family: inherit; cursor: pointer; }
input, select, textarea { font-family: inherit; }

/* ---------- LAYOUT GLOBAL ---------- */

.app-shell {
  display: flex;
  min-height: 100vh;
}

.sidebar {
  width: 220px;
  background: var(--marine);
  color: #fff;
  display: flex;
  flex-direction: column;
  padding: 24px 0;
  flex-shrink: 0;
}

.sidebar-title {
  font-size: 17px;
  font-weight: 700;
  padding: 0 20px 24px 20px;
  border-bottom: 1px solid rgba(255,255,255,0.12);
  margin-bottom: 12px;
}

.sidebar-nav {
  display: flex;
  flex-direction: column;
  gap: 2px;
  flex: 1;
}

.sidebar-link {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 11px 20px;
  color: rgba(255,255,255,0.75);
  text-decoration: none;
  font-size: 14.5px;
  border-left: 3px solid transparent;
  background: none;
  border-top: none;
  border-right: none;
  border-bottom: none;
  width: 100%;
  text-align: left;
}

.sidebar-link:hover {
  background: rgba(255,255,255,0.06);
  color: #fff;
}

.sidebar-link.active {
  background: rgba(242,118,46,0.15);
  color: #fff;
  border-left-color: var(--orange);
  font-weight: 600;
}

.sidebar-footer {
  padding: 16px 20px 0 20px;
  border-top: 1px solid rgba(255,255,255,0.12);
}

.sidebar-user {
  font-size: 13px;
  color: rgba(255,255,255,0.6);
  margin-bottom: 10px;
}

.sidebar-logout {
  background: none;
  border: 1px solid rgba(255,255,255,0.25);
  color: #fff;
  padding: 7px 12px;
  border-radius: 8px;
  font-size: 13px;
  width: 100%;
}

.sidebar-logout:hover { background: rgba(255,255,255,0.1); }

.main-content {
  flex: 1;
  padding: 32px 40px;
  max-width: 1100px;
}

/* ---------- MOBILE TOP NAV ---------- */

.mobile-topbar {
  display: none;
}

@media (max-width: 800px) {
  .app-shell { flex-direction: column; }
  .sidebar {
    display: none;
  }
  .sidebar.mobile-open {
    display: flex;
    position: fixed;
    inset: 0;
    z-index: 50;
    width: 100%;
    height: 100vh;
    overflow-y: auto;
  }
  .mobile-topbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    background: var(--marine);
    color: #fff;
    padding: 14px 18px;
  }
  .mobile-topbar-title { font-weight: 700; font-size: 16px; }
  .mobile-menu-btn {
    background: none;
    border: none;
    color: #fff;
    font-size: 22px;
  }
  .main-content { padding: 20px; }
}

/* ---------- HEADER DE VUE ---------- */

.view-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 24px;
}

.view-header h1 {
  margin: 0;
  font-size: 24px;
  color: var(--marine);
}

.view-subtitle {
  margin: 4px 0 0 0;
  color: var(--texte-doux);
  font-size: 14px;
}

/* ---------- CARTES ---------- */

.card {
  background: var(--carte);
  border-radius: var(--rayon);
  box-shadow: var(--ombre);
  padding: 20px;
  border: 1px solid var(--bordure);
}

.card + .card { margin-top: 16px; }

.card-title {
  font-size: 15px;
  font-weight: 700;
  color: var(--marine);
  margin: 0 0 14px 0;
}

.grid-2 {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

@media (max-width: 800px) {
  .grid-2 { grid-template-columns: 1fr; }
}

/* ---------- STAT TILES ---------- */

.stats-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 14px;
  margin-bottom: 20px;
}

.stat-tile {
  background: var(--carte);
  border: 1px solid var(--bordure);
  border-radius: var(--rayon);
  padding: 16px;
  box-shadow: var(--ombre);
}

.stat-tile-value {
  font-size: 26px;
  font-weight: 800;
  color: var(--marine);
}

.stat-tile-label {
  font-size: 13px;
  color: var(--texte-doux);
  margin-top: 4px;
}

.stat-tile-sublabel {
  font-size: 12px;
  color: var(--orange);
  margin-top: 2px;
}

/* ---------- TABLE / LISTES ---------- */

.list-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 0;
  border-bottom: 1px solid var(--bordure);
}

.list-row:last-child { border-bottom: none; }

table {
  width: 100%;
  border-collapse: collapse;
}

th {
  text-align: left;
  font-size: 12.5px;
  text-transform: uppercase;
  letter-spacing: 0.03em;
  color: var(--texte-doux);
  padding: 8px 10px;
  border-bottom: 2px solid var(--bordure);
}

td {
  padding: 10px;
  border-bottom: 1px solid var(--bordure);
  font-size: 14.5px;
}

tr:last-child td { border-bottom: none; }

.table-actions {
  display: flex;
  gap: 8px;
}

.icon-btn {
  background: none;
  border: 1px solid var(--bordure);
  border-radius: 7px;
  padding: 5px 9px;
  font-size: 13px;
}

.icon-btn:hover { background: var(--fond); }

/* ---------- BOUTONS ---------- */

.btn {
  border: none;
  border-radius: 9px;
  padding: 10px 18px;
  font-size: 14px;
  font-weight: 600;
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.btn-primary { background: var(--orange); color: #fff; }
.btn-primary:hover { background: #db6620; }

.btn-secondary { background: var(--fond); color: var(--texte); border: 1px solid var(--bordure); }
.btn-secondary:hover { background: #eceff2; }

.btn-danger { background: #fdeceb; color: var(--rouge); }
.btn-danger:hover { background: #fbd9d6; }

.btn-marine { background: var(--marine); color: #fff; }
.btn-marine:hover { background: var(--marine-clair); }

.btn:disabled { opacity: 0.5; cursor: not-allowed; }

/* ---------- FORMULAIRES ---------- */

.form-group { margin-bottom: 14px; }

.form-group label {
  display: block;
  font-size: 13px;
  font-weight: 600;
  color: var(--texte);
  margin-bottom: 5px;
}

.form-group input,
.form-group select,
.form-group textarea {
  width: 100%;
  padding: 9px 11px;
  border: 1px solid var(--bordure);
  border-radius: 8px;
  font-size: 14.5px;
  background: #fff;
}

.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus {
  outline: none;
  border-color: var(--orange);
}

.form-row {
  display: flex;
  gap: 12px;
}

.form-row .form-group { flex: 1; }

/* ---------- EMPTY STATE ---------- */

.empty-state {
  text-align: center;
  padding: 50px 20px;
  color: var(--texte-doux);
}

.empty-state-icon { font-size: 40px; margin-bottom: 10px; }
.empty-state h3 { color: var(--marine); margin: 0 0 6px 0; }
.empty-state p { margin: 0; font-size: 14px; }

/* ---------- MODAL ---------- */

.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(11, 37, 69, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
  padding: 20px;
}

.modal {
  background: #fff;
  border-radius: 14px;
  width: 100%;
  max-width: 480px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 10px 40px rgba(0,0,0,0.2);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 18px 20px;
  border-bottom: 1px solid var(--bordure);
}

.modal-header h2 { margin: 0; font-size: 17px; color: var(--marine); }

.modal-close {
  background: none;
  border: none;
  font-size: 18px;
  color: var(--texte-doux);
}

.modal-body { padding: 20px; }

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding: 16px 20px;
  border-top: 1px solid var(--bordure);
}

/* ---------- CALENDRIER ---------- */

.calendar-nav {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}

.calendar-nav h2 {
  margin: 0;
  font-size: 18px;
  color: var(--marine);
  text-transform: capitalize;
}

.calendar-nav-btn {
  background: var(--fond);
  border: 1px solid var(--bordure);
  border-radius: 8px;
  width: 34px;
  height: 34px;
  font-size: 16px;
}

.calendar-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 6px;
}

.calendar-weekday {
  text-align: center;
  font-size: 12px;
  color: var(--texte-doux);
  font-weight: 600;
  padding-bottom: 4px;
}

.calendar-cell {
  aspect-ratio: 1;
  border-radius: 9px;
  border: 1px solid var(--bordure);
  background: #fff;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  font-size: 13.5px;
  gap: 3px;
  position: relative;
}

.calendar-cell.empty { border: none; background: transparent; }

.calendar-cell.clickable { cursor: pointer; }
.calendar-cell.clickable:hover { border-color: var(--orange); }

.calendar-cell.entrainement {
  background: var(--orange-clair);
  border-color: #f5c19b;
  font-weight: 600;
}

.calendar-cell.today { box-shadow: inset 0 0 0 2px var(--marine); }

.calendar-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--orange);
}

.calendar-event-list {
  margin-top: 20px;
}

/* ---------- APPEL / PRESENCES ---------- */

.appel-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 11px 0;
  border-bottom: 1px solid var(--bordure);
}

.appel-row:last-child { border-bottom: none; }

.appel-toggle {
  display: flex;
  gap: 6px;
}

.appel-btn {
  border: 1px solid var(--bordure);
  background: #fff;
  border-radius: 8px;
  padding: 6px 14px;
  font-size: 13.5px;
  font-weight: 600;
}

.appel-btn.present.active { background: #e5f5eb; border-color: var(--vert); color: var(--vert); }
.appel-btn.absent.active { background: #fdeceb; border-color: var(--rouge); color: var(--rouge); }

/* ---------- AUTH ---------- */

.auth-screen {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--marine);
  padding: 20px;
}

.auth-card {
  background: #fff;
  border-radius: 16px;
  padding: 36px 32px;
  width: 100%;
  max-width: 380px;
  box-shadow: 0 10px 40px rgba(0,0,0,0.25);
}

.auth-logo {
  text-align: center;
  font-size: 20px;
  font-weight: 800;
  color: var(--marine);
  margin-bottom: 4px;
}

.auth-tagline {
  text-align: center;
  color: var(--texte-doux);
  font-size: 13.5px;
  margin-bottom: 26px;
}

.auth-error {
  background: #fdeceb;
  color: var(--rouge);
  border-radius: 8px;
  padding: 10px 12px;
  font-size: 13.5px;
  margin-bottom: 14px;
}

.badge {
  display: inline-block;
  padding: 3px 9px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
}

.badge-orange { background: var(--orange-clair); color: #b34e12; }
.badge-marine { background: #e3ecf5; color: var(--marine); }
`

export default function AppStyles() {
  return <style>{css}</style>
}
