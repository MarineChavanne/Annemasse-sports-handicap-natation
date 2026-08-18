import React from 'react'

export function ViewHeader({ title, subtitle, action }) {
  return (
    <div className="view-header">
      <div>
        <h1>{title}</h1>
        {subtitle && <p className="view-subtitle">{subtitle}</p>}
      </div>
      {action && <div className="view-header-action">{action}</div>}
    </div>
  )
}

export function EmptyState({ icon = '📭', title, description }) {
  return (
    <div className="empty-state">
      <div className="empty-state-icon">{icon}</div>
      <h3>{title}</h3>
      {description && <p>{description}</p>}
    </div>
  )
}

export function StatTile({ label, value, sublabel }) {
  return (
    <div className="stat-tile">
      <div className="stat-tile-value">{value}</div>
      <div className="stat-tile-label">{label}</div>
      {sublabel && <div className="stat-tile-sublabel">{sublabel}</div>}
    </div>
  )
}

export function Modal({ title, onClose, children, footer }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{title}</h2>
          <button className="modal-close" onClick={onClose} aria-label="Fermer">
            ✕
          </button>
        </div>
        <div className="modal-body">{children}</div>
        {footer && <div className="modal-footer">{footer}</div>}
      </div>
    </div>
  )
}

export function Button({ children, variant = 'primary', ...props }) {
  return (
    <button className={`btn btn-${variant}`} {...props}>
      {children}
    </button>
  )
}
