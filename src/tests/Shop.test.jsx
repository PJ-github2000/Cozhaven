import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, it, expect, vi } from 'vitest';
import Shop from '../pages/Shop';
import { ProductsProvider } from '../context/ProductsContext';
import { CartProvider } from '../context/CartContext';
import { AuthProvider } from '../context/AuthContext';
import { WishlistProvider } from '../context/WishlistContext';
import { ToastProvider } from '../context/ToastContext';

// Mock the products API call
global.fetch = vi.fn((url) => {
  if (url.includes('/api/products') && !url.includes('/categories')) {
    return Promise.resolve({
      ok: true,
      json: () => Promise.resolve([
        { id: '1', name: 'Velvet Sofa', description: 'A soft velvet sofa.', price: 1200, category: 'sofas', images: ['/sofa.jpg'], in_stock: true, stock: 5 },
      ]),
    });
  }
  if (url.includes('/api/products/categories')) {
    return Promise.resolve({
      ok: true,
      json: () => Promise.resolve(['sofas', 'beds', 'tables']),
    });
  }
  return Promise.resolve({ ok: true, json: () => Promise.resolve([]) });
});

describe('Shop Page', () => {
  it('renders products and filters', async () => {
    render(
      <BrowserRouter>
        <AuthProvider>
          <ProductsProvider>
            <CartProvider>
              <WishlistProvider>
                <ToastProvider>
                  <Shop />
                </ToastProvider>
              </WishlistProvider>
            </CartProvider>
          </ProductsProvider>
        </AuthProvider>
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('All Furniture')).toBeInTheDocument();
    });

    await waitFor(() => {
      expect(screen.getByText('Velvet Sofa')).toBeInTheDocument();
      expect(screen.getByText(/\$1,200/)).toBeInTheDocument();
    });
  });
});
