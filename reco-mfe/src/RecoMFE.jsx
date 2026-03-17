/**
 * reco-mfe/src/RecoMFE.jsx
 *
 * Team: Personalisation
 * Consumes: AuthContext (to personalise), CartContext (to add items), eventBus
 * Owns: recommendation data fetching and rendering
 *
 * In production this would call an internal recommendations API
 * and listen on eventBus for 'checkout:complete' to refresh.
 */

import React, { useEffect, useState } from 'react';
import { useAuth }  from '@company/auth';
import { useCart }  from '@company/cart';
import eventBus     from '@company/event-bus';

const GUEST_RECOS = [
  { id: 20, name: 'Laptop stand',       price: 49,  reason: 'Popular this week' },
  { id: 21, name: 'Cable organiser',    price: 19,  reason: 'Top seller' },
  { id: 22, name: 'Screen cleaner kit', price: 14,  reason: 'Frequently bought' },
];

const USER_RECOS = [
  { id: 23, name: 'Noise-cancelling headphones', price: 249, reason: 'Based on your browsing' },
  { id: 24, name: 'Wireless charger',            price: 39,  reason: 'Often bought together' },
  { id: 25, name: 'Mechanical keycaps',          price: 35,  reason: 'Goes with your keyboard' },
];

export default function RecoMFE() {
  const { user }          = useAuth();
  const { addItem, cart } = useCart();
  const [recos, setRecos] = useState(user ? USER_RECOS : GUEST_RECOS);

  // Re-personalise when auth changes or a checkout completes
  useEffect(() => {
    setRecos(user ? USER_RECOS : GUEST_RECOS);
  }, [user]);

  useEffect(() => {
    // After checkout, refresh recommendations
    return eventBus.on('checkout:complete', () => {
      setRecos(user ? [...USER_RECOS].reverse() : GUEST_RECOS);
    });
  }, [user]);

  const inCart = (id) => cart.some((i) => i.id === id);

  return (
    <div style={{ padding: '14px 16px' }}>
      <p className="mfe-tag" style={{ marginBottom: 8 }}>recommendations mfe · team personalisation</p>
      <p style={{ fontSize: 13, color: 'var(--color-text-secondary)', marginBottom: 12 }}>
        {user
          ? `Personalised picks for ${user.name.split(' ')[0]}`
          : 'Popular right now — sign in for personal picks'}
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {recos.map((r) => (
          <div
            key={r.id}
            className="card"
            style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
          >
            <div>
              <div style={{ fontSize: 13, fontWeight: 500 }}>{r.name}</div>
              <div style={{ fontSize: 11, color: 'var(--color-text-secondary)', marginTop: 2 }}>{r.reason}</div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: 13 }}>${r.price}</span>
              <button
                className="btn-sm"
                onClick={() => { addItem(r); eventBus.emit('cart:add', r); }}
                style={inCart(r.id) ? { background: 'var(--color-background-success)', color: 'var(--color-text-success)' } : {}}
              >
                {inCart(r.id) ? '✓' : 'Add +'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
