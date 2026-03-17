/**
 * shell-app/src/App.jsx
 *
 * The Shell (Host) application.
 * Responsibilities:
 *   - Mount shared context providers (Auth, Cart)
 *   - Own top-level routing
 *   - Lazy-load remote MFEs via Module Federation
 *   - Render the layout / navigation chrome
 */

import './styles.css';
import React, { lazy, Suspense, useEffect, useRef, useState } from 'react';
import ReactDOM from 'react-dom/client';
import { AuthProvider, useAuth } from '@company/auth';
import { CartProvider, useCart } from '@company/cart';
import eventBus from '@company/event-bus';

// ── Remote MFEs loaded at runtime (not bundled into the shell) ───────────────
// Each import() fetches from the URL declared in webpack.config.js remotes.
const HeaderMFE  = lazy(() => import('products/HeaderMFE'));   // hosted by products team
const ProductsMFE = lazy(() => import('products/ProductsMFE'));
const CartMFE    = lazy(() => import('cart/CartMFE'));
const RecoMFE    = lazy(() => import('reco/RecoMFE'));

// ── Fallback while a remote chunk loads ─────────────────────────────────────
function MFELoader() {
  return (
    <div style={{ padding: '24px 16px', color: 'var(--color-text-secondary)', fontSize: 13 }}>
      Loading…
    </div>
  );
}

// ── Shell (inner) — has access to contexts ───────────────────────────────────
function Shell() {
  const { user, login, logout } = useAuth();
  const { cartCount }           = useCart();
  const [tab, setTab]           = useState('products');
  const [logs, setLogs]         = useState([]);
  const logRef                  = useRef(null);

  const addLog = (type, text) =>
    setLogs((l) => [...l.slice(-40), { type, text, id: Date.now() + Math.random() }]);

  // Global event bus listener — shell wires up cross-MFE observability
  useEffect(() => {
    const unsubs = [
      eventBus.on('cart:add',    (d) => addLog('sub', `cart:add ← "${d.name}"`)),
      eventBus.on('cart:remove', (d) => addLog('sub', `cart:remove ← id=${d.id}`)),
      eventBus.on('auth:login',  (d) => addLog('act', `auth:login ← ${d.name}`)),
      eventBus.on('auth:logout', ()  => addLog('act', 'auth:logout')),
      eventBus.on('checkout:go', ()  => addLog('pub', 'checkout:go → CartMFE')),
    ];
    return () => unsubs.forEach((u) => u());
  }, []);

  useEffect(() => {
    if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight;
  }, [logs]);

  const handleLogin  = () => {
    const user = { name: 'Ada Lovelace', role: 'admin' };
    login(user);
    eventBus.emit('auth:login', user);
  };
  const handleLogout = () => { logout(); eventBus.emit('auth:logout'); };

  return (
    <div className="shell">
      {/* Header MFE — team Platform */}
      <Suspense fallback={<div style={{ height: 52 }} />}>
        <HeaderMFE
          user={user}
          cartCount={cartCount}
          onLogin={handleLogin}
          onLogout={handleLogout}
          onCartClick={() => setTab('cart')}
        />
      </Suspense>

      {/* Shell-owned tab navigation */}
      <nav className="tabs">
        {[['products', 'Products'], ['cart', 'Cart'], ['reco', 'For You']].map(([key, label]) => (
          <button
            key={key}
            className={`tab ${tab === key ? 'active' : ''}`}
            onClick={() => setTab(key)}
          >
            {label}
            {key === 'cart' && cartCount > 0 && (
              <span className="badge">{cartCount}</span>
            )}
          </button>
        ))}
      </nav>

      {/* MFE slots */}
      <Suspense fallback={<MFELoader />}>
        {tab === 'products' && <ProductsMFE />}
        {tab === 'cart'     && <CartMFE onCheckout={() => eventBus.emit('checkout:go', {})} />}
        {tab === 'reco'     && <RecoMFE />}
      </Suspense>

      {/* Event bus log — dev/debug panel */}
      <div className="log-wrap" ref={logRef}>
        {logs.length === 0 && (
          <div className="log-line">
            · Shell mounted — contexts ready
          </div>
        )}
        {logs.map((l) => (
          <div key={l.id} className={`log-line log-${l.type}`}>
            {l.type === 'pub' ? '↑ ' : l.type === 'sub' ? '↓ ' : '⚡ '}
            {l.text}
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Root — wraps everything in shared providers ──────────────────────────────
function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <Shell />
      </CartProvider>
    </AuthProvider>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
