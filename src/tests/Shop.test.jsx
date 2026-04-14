import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, it, expect, vi } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Shop from '../pages/Shop';
import { ProductsProvider } from '../context/ProductsContext';
import { CartProvider } from '../context/CartContext';
import { AuthProvider } from '../context/AuthContext';
import { WishlistProvider } from '../context/WishlistContext';
import { ToastProvider } from '../context/ToastContext';

// Mock the products API call
globalThis.fetch = vi.fn((url) => {
  if (url.includes('/api/products') && !url.includes('/categories')) {
    return Promise.resolve({
      ok: true,
      json: () => Promise.resolve({
        products: [
          { id: '1', name: 'Velvet Sofa', description: 'A soft velvet sofa.', price: 1200, category: 'sofas', images: ['/sofa.jpg'], in_stock: true, stock: 5 },
        ],
        total: 1,
        page: 1,
        pages: 1,
      }),
    });
  }
  return Promise.resolve({ ok: true, json: () => Promise.resolve({ products: [] }) });
});

describe('Shop Page', () => {
  it('renders products and filters', async () => {
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } }
    });

    render(
      <QueryClientProvider client={queryClient}>
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
      </QueryClientProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('The Collection')).toBeInTheDocument();
    });

    await waitFor(() => {
      expect(screen.getByText('Velvet Sofa')).toBeInTheDocument();
      expect(screen.getByText(/\$1,200/)).toBeInTheDocument();
    });
  });
});
