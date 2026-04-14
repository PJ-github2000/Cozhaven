import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, it, expect, vi } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Header from '../components/Header';
import { CartProvider } from '../context/CartContext';
import { AuthProvider } from '../context/AuthContext';
import { WishlistProvider } from '../context/WishlistContext';
import { ToastProvider } from '../context/ToastContext';
import { ProductsProvider } from '../context/ProductsContext';

// Mock fetch for ProductsProvider
globalThis.fetch = vi.fn().mockResolvedValue({
  ok: true,
  json: () => Promise.resolve({ products: [] })
});

describe('Header Component', () => {
  it('renders logo and navigation links', () => {
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } }
    });

    render(
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <AuthProvider>
            <CartProvider>
              <WishlistProvider>
                <ToastProvider>
                  <ProductsProvider>
                    <Header />
                  </ProductsProvider>
                </ToastProvider>
              </WishlistProvider>
            </CartProvider>
          </AuthProvider>
        </BrowserRouter>
      </QueryClientProvider>
    );

    expect(screen.getByAltText('Cozhaven Logo')).toBeInTheDocument();
    expect(screen.getByText('Shop')).toBeInTheDocument();
    expect(screen.getByText('About')).toBeInTheDocument();
  });
});
