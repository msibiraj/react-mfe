/**
 * cart-mfe/src/CartMFE.jsx
 *
 * Team: Commerce
 * Consumes: CartContext, AuthContext, eventBus
 * Owns: cart UI, line item management, checkout flow
 *
 * Props:
 *   onCheckout - () => void  (optional callback to shell for post-checkout nav)
 */

import React, { useState } from 'react';
import { useCart } from '@company/cart';
import { useAuth } from '@company/auth';
import eventBus from '@company/event-bus';

export default function CartMFE({ onCheckout }) {
  const { cart, removeItem, clearCart, cartTotal } = useCart();
  const { user }                                   = useAuth();
  const [ordered, setOrdered]                      = useState(false);

  const handleRemove = (id) => {
    removeItem(id);
    eventBus.emit('cart:remove', { id });
  };

  const handleCheckout = () => {
    if (!user) {
      alert('Please sign in to checkout');
      return;
    }
    eventBus.emit('checkout:complete', { cart, user });
    clearCart();
    setOrdered(true);
    onCheckout?.();
  };

  if (ordered) {
    return (
      <div style={{ padding: '32px 16px', textAlign: 'center' }}>
        <div style={{ fontSize: 32, marginBottom: 10 }}>🎉</div>
        <div style={{ fontWeight: 500, fontSize: 15 }}>
          Order placed! Thanks, {user.name.split(' ')[0]}.
        </div>
        <div style={{ fontSize: 13, color: 'var(--color-text-secondary)', marginTop: 4 }}>
          Your items are on their way.
        </div>
        <button className="btn" style={{ marginTop: 16 }} onClick={() => setOrdered(false)}>
          Back to cart
        </button>
      </div>
    );
  }

  return (
    <div style={{ padding: '14px 16px', maxWidth: 420 }}>
      <p className="mfe-tag" style={{ marginBottom: 10 }}>cart mfe · team commerce</p>

      {cart.length === 0 ? (
        <p style={{ fontSize: 13, color: 'var(--color-text-secondary)' }}>
          Your cart is empty — add some products.
        </p>
      ) : (
        <>
          {cart.map((item) => (
            <div
              key={item.id}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '8px 0',
                borderBottom: '0.5px solid var(--color-border-tertiary)',
              }}
            >
              <div>
                <div style={{ fontSize: 13, fontWeight: 500 }}>{item.name}</div>
                <div style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>
                  ${item.price} × {item.qty}
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: 13, fontWeight: 500 }}>${item.price * item.qty}</span>
                <button
                  className="btn-sm"
                  style={{ color: 'var(--color-text-danger)', borderColor: 'var(--color-border-danger)' }}
                  onClick={() => handleRemove(item.id)}
                >
                  ✕
                </button>
              </div>
            </div>
          ))}

          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', fontWeight: 500 }}>
            <span>Total</span>
            <span>${cartTotal}</span>
          </div>

          <button className="btn-primary" onClick={handleCheckout}>
            {user ? 'Place order →' : 'Sign in to checkout'}
          </button>
        </>
      )}
    </div>
  );
}
