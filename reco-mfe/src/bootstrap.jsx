import { createRoot } from 'react-dom/client';
import { AuthProvider } from '@company/auth';
import { CartProvider } from '@company/cart';
import RecoMFE from './RecoMFE';

const root = createRoot(document.getElementById('root'));
root.render(
  <AuthProvider>
    <CartProvider>
      <RecoMFE />
    </CartProvider>
  </AuthProvider>
);
