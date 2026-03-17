import { createRoot } from 'react-dom/client';
import { AuthProvider } from '@company/auth';
import { CartProvider } from '@company/cart';
import ProductsMFE from './ProductsMFE';

const root = createRoot(document.getElementById('root'));
root.render(
  <AuthProvider>
    <CartProvider>
      <ProductsMFE />
    </CartProvider>
  </AuthProvider>
);
