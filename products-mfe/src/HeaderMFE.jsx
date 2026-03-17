/**
 * products-mfe/src/HeaderMFE.jsx
 *
 * Team: Platform (co-located with products-mfe for simplicity;
 * in practice this would be its own remote or part of the shell bundle)
 *
 * Consumes: AuthContext via props passed from Shell.
 * The Shell owns auth state; the Header just renders it.
 *
 * Props:
 *   user        - { name, role } | null
 *   cartCount   - number
 *   onLogin     - () => void
 *   onLogout    - () => void
 *   onCartClick - () => void
 */

import React from 'react';

export default function HeaderMFE({ user, cartCount, onLogin, onLogout, onCartClick }) {
  return (
    <header
      style={{
        background: 'var(--color-background-secondary)',
        padding: '10px 16px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottom: '0.5px solid var(--color-border-tertiary)',
      }}
    >
      <div>
        <p className="mfe-tag" style={{ marginBottom: 2 }}>header mfe</p>
        <span style={{ fontWeight: 500, fontSize: 15 }}>🛍 MicroShop</span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        {user && (
          <span style={{ fontSize: 13, color: 'var(--color-text-secondary)' }}>
            Hi, {user.name.split(' ')[0]}
          </span>
        )}

        <button className="btn" onClick={user ? onLogout : onLogin}>
          {user ? 'Sign out' : 'Sign in'}
        </button>

        <button
          onClick={onCartClick}
          style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 20, position: 'relative', display: 'inline-flex' }}
          aria-label={`Cart, ${cartCount} items`}
        >
          🛒
          {cartCount > 0 && <span className="badge">{cartCount}</span>}
        </button>
      </div>
    </header>
  );
}
