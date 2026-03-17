/**
 * products-mfe/src/ProductsMFE.jsx
 *
 * Team: Catalog
 * Consumes: CartContext (@company/cart), eventBus (@company/event-bus)
 * Owns: product data, catalog UI, filtering
 *
 * This component is completely unaware of the Shell or other MFEs.
 * It communicates only through shared contexts and the event bus.
 */

import React, { useState } from 'react';
import { useCart } from '@company/cart';
import eventBus from '@company/event-bus';

const PRODUCTS = [
  { id: 1, name: 'Mechanical keyboard', price: 149, category: 'Input' },
  { id: 2, name: 'Ergonomic mouse',     price: 79,  category: 'Input' },
  { id: 3, name: 'USB-C hub',           price: 49,  category: 'Accessories' },
  { id: 4, name: 'Monitor stand',       price: 89,  category: 'Accessories' },
  { id: 5, name: 'Webcam 4K',           price: 129, category: 'Video' },
  { id: 6, name: 'Desk lamp',           price: 59,  category: 'Lighting' },
];

export default function ProductsMFE() {
  const { addItem, cart } = useCart();
  const [filter, setFilter] = useState('All');

  const categories = ['All', ...new Set(PRODUCTS.map((p) => p.category))];
  const visible    = filter === 'All' ? PRODUCTS : PRODUCTS.filter((p) => p.category === filter);
  const inCart     = (id) => cart.some((i) => i.id === id);

  const handleAdd = (product) => {
    addItem(product);                          // updates shared CartContext
    eventBus.emit('cart:add', product);        // notifies any listener (analytics, header badge, etc.)
  };

  return (
    <div style={{ padding: '14px 16px' }}>
      <p className="mfe-tag">products mfe · team catalog</p>

      {/* Category filter */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 12, flexWrap: 'wrap' }}>
        {categories.map((c) => (
          <button
            key={c}
            onClick={() => setFilter(c)}
            className={filter === c ? 'pill active' : 'pill'}
          >
            {c}
          </button>
        ))}
      </div>

      {/* Product grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
        {visible.map((p) => (
          <div key={p.id} className="card" style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <div style={{ fontSize: 13, fontWeight: 500 }}>{p.name}</div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 13, color: 'var(--color-text-secondary)' }}>${p.price}</span>
              <button
                className="btn-sm"
                onClick={() => handleAdd(p)}
                style={inCart(p.id) ? { background: 'var(--color-background-success)', color: 'var(--color-text-success)' } : {}}
              >
                {inCart(p.id) ? '✓ Added' : 'Add +'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
