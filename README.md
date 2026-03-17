# React Micro Frontend Example

A working micro frontend architecture using **React 18** + **Webpack 5 Module Federation**.

---

## Getting started

### Prerequisites

- Node.js 18+
- npm 8+ (workspaces support required)

### Install

```bash
npm install
```

This installs dependencies for all workspaces (shell-app, products-mfe, cart-mfe, reco-mfe, and all shared packages) in one command.

### Start

```bash
npm start
```

Starts all 4 dev servers concurrently:

| App | URL | Role |
|---|---|---|
| shell-app | http://localhost:3000 | **Main app** — open this in your browser |
| products-mfe | http://localhost:3001 | Remote (products + header) |
| cart-mfe | http://localhost:3002 | Remote (cart) |
| reco-mfe | http://localhost:3003 | Remote (recommendations) |

> **Note:** All 4 servers must be running. The Shell fetches `remoteEntry.js`
> from each remote at runtime — if a remote is down, that MFE slot shows a loading state.

### Start individually

```bash
npm run start -w shell-app       # http://localhost:3000
npm run start -w products-mfe    # http://localhost:3001
npm run start -w cart-mfe        # http://localhost:3002
npm run start -w reco-mfe        # http://localhost:3003
```

### Build

```bash
npm run build
```

Builds all packages in dependency order (shared first, then MFEs).

---

## Project structure

```
react-mfe/
├── shared/                        # Local npm workspace packages
│   ├── src/
│   │   ├── contexts/
│   │   │   ├── AuthContext.jsx    # Auth state + useAuth() hook
│   │   │   └── CartContext.jsx    # Cart state + useCart() hook
│   │   └── events/
│   │       └── eventBus.js        # Pub/sub event bus (singleton)
│   ├── auth/                      # @company/auth workspace package
│   ├── cart/                      # @company/cart workspace package
│   └── event-bus/                 # @company/event-bus workspace package
│
├── shell-app/                     # HOST — port 3000 — the main app
│   ├── webpack.config.js          # Declares remotes + shared singletons
│   └── src/
│       ├── index.jsx              # Async bootstrap (required for MF)
│       ├── App.jsx                # Providers + layout + lazy MFE slots
│       └── styles.css             # Global dark theme
│
├── products-mfe/                  # REMOTE — port 3001 — Team Catalog
│   ├── webpack.config.js          # Exposes ProductsMFE, HeaderMFE
│   └── src/
│       ├── index.jsx              # Async bootstrap
│       ├── bootstrap.jsx          # Standalone dev entry (wraps with providers)
│       ├── ProductsMFE.jsx        # Product grid + add to cart
│       └── HeaderMFE.jsx          # App header (nav bar)
│
├── cart-mfe/                      # REMOTE — port 3002 — Team Commerce
│   ├── webpack.config.js          # Exposes CartMFE
│   └── src/
│       ├── index.jsx
│       ├── bootstrap.jsx
│       └── CartMFE.jsx            # Cart items + checkout
│
└── reco-mfe/                      # REMOTE — port 3003 — Team Personalisation
    ├── webpack.config.js          # Exposes RecoMFE
    └── src/
        ├── index.jsx
        ├── bootstrap.jsx
        └── RecoMFE.jsx            # Personalised recommendations
```

---

## Architecture

### How the Shell loads MFEs

The Shell is the only app the user navigates to (`localhost:3000`). It pulls in remote components **at runtime** — no rebuild required when a remote team deploys.

```
User browser
  └── shell-app (3000)
        ├── fetch → http://localhost:3001/remoteEntry.js  → loads ProductsMFE, HeaderMFE
        ├── fetch → http://localhost:3002/remoteEntry.js  → loads CartMFE
        └── fetch → http://localhost:3003/remoteEntry.js  → loads RecoMFE
```

Each remote declares what it exposes in its `webpack.config.js`:

```js
// products-mfe/webpack.config.js
exposes: {
  './ProductsMFE': './src/ProductsMFE',
  './HeaderMFE':   './src/HeaderMFE',
}
```

The Shell lazy-loads them with no static import dependency:

```js
// shell-app/src/App.jsx
const ProductsMFE = lazy(() => import('products/ProductsMFE'));
const CartMFE     = lazy(() => import('cart/CartMFE'));
const RecoMFE     = lazy(() => import('reco/RecoMFE'));
```

---

### Shared singletons

React and all `@company/*` packages are declared `singleton: true` in every webpack config. This guarantees **one copy** runs across the entire app — critical because React hooks break if multiple React instances exist.

```js
shared: {
  react:               { singleton: true, requiredVersion: '^18.0.0' },
  'react-dom':         { singleton: true, requiredVersion: '^18.0.0' },
  '@company/auth':     { singleton: true },
  '@company/cart':     { singleton: true },
  '@company/event-bus':{ singleton: true },
}
```

---

### Communication between MFEs

There are 3 ways components talk to each other. MFEs **never** import from each other directly.

#### 1. React Context — shared state

The Shell mounts `<AuthProvider>` and `<CartProvider>` once. Because they are singletons, every MFE that calls `useAuth()` or `useCart()` reads from the exact same context instance.

```
Shell
└── <AuthProvider>        ← owns auth state
    └── <CartProvider>    ← owns cart state
        ├── <ProductsMFE />   → useCart() ✓
        ├── <CartMFE />       → useCart() + useAuth() ✓
        └── <RecoMFE />       → useAuth() + useCart() ✓
```

Use this for: **state that needs to stay in sync** (who is logged in, what's in the cart).

#### 2. Event bus — fire-and-forget signals

A lightweight pub/sub instance shared as a singleton. One MFE emits, any listener anywhere receives it.

```js
// ProductsMFE — fires when item added
eventBus.emit('cart:add', product);

// RecoMFE — refreshes after checkout
eventBus.on('checkout:complete', () => setRecos(freshRecos));

// Shell — logs all events for observability
eventBus.on('cart:add', (d) => addLog('sub', `cart:add ← "${d.name}"`));
```

Use this for: **one-way notifications** (analytics, toasts, cross-MFE reactions).

#### 3. Props — Shell to MFE

The Shell can pass props directly to any MFE it renders.

```jsx
<HeaderMFE
  user={user}
  cartCount={cartCount}
  onLogin={handleLogin}
  onLogout={handleLogout}
  onCartClick={() => setTab('cart')}
/>
```

Use this for: **values the Shell owns** that a child MFE needs to display.

---

### Communication at a glance

| Need | Mechanism |
|---|---|
| Shared state (auth, cart items) | React Context via `useAuth()` / `useCart()` |
| One-way signals (analytics, refresh triggers) | `eventBus.emit()` / `eventBus.on()` |
| Shell passing data to an MFE | Props |
| Load a remote component | `lazy(() => import('remote/Component'))` |
| MFE → MFE directly | Never — always go through context or event bus |

---

### Async bootstrap pattern

Every app has a tiny `index.jsx` that does nothing but a dynamic import:

```js
// index.jsx
import('./bootstrap');  // or import('./App')
```

This creates an async chunk boundary, which is **required** for Module Federation shared singletons to negotiate versions before any module executes.

---

## Deployment

In production each app is built independently and deployed to its own CDN path. Update the `remotes` URLs in `shell-app/webpack.config.js`:

```js
remotes: {
  products: 'products@https://cdn.company.com/products/remoteEntry.js',
  cart:     'cart@https://cdn.company.com/cart/remoteEntry.js',
  reco:     'reco@https://cdn.company.com/reco/remoteEntry.js',
}
```

Teams deploy independently — the Shell picks up each team's latest `remoteEntry.js` on the next page load with no shell rebuild required.
