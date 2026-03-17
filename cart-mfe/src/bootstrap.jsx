import { createRoot } from 'react-dom/client';
import { AuthProvider } from '@company/auth';
import { CartProvider } from '@company/cart';
import CartMFE from './CartMFE';

const root = createRoot(document.getElementById('root'));
root.render(
  <AuthProvider>
    <CartProvider>
      <CartMFE />
    </CartProvider>
  </AuthProvider>
);
