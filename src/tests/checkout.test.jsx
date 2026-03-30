import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter, MemoryRouter } from 'react-router-dom';
import { describe, it, expect, vi } from 'vitest';
import Checkout from '../pages/Checkout';
import OrderSuccess from '../pages/OrderSuccess';

// Mock contexts
vi.mock('../context/CartContext', () => ({
  useCart: () => ({
    items: [
      { id: 1, name: 'Test Sofa', price: 1000, quantity: 1, color: 'Blue', size: 'Large' }
    ],
    subtotal: 1000,
    clearCart: vi.fn(),
  })
}));

vi.mock('../context/AuthContext', () => ({
  useAuth: () => ({
    user: { id: 1, name: 'Test User' },
    isAuthenticated: true,
  })
}));

vi.mock('../context/ToastContext', () => ({
  useToast: () => ({
    addToast: vi.fn(),
  })
}));

// Mock Stripe elements
vi.mock('@stripe/react-stripe-js', () => ({
  Elements: ({ children }) => <div>{children}</div>,
  PaymentElement: () => <div data-testid="payment-element">Stripe Element</div>,
  useStripe: () => ({
    confirmPayment: vi.fn().mockResolvedValue({ paymentIntent: { status: 'succeeded', id: 'pi_test_123' } })
  }),
  useElements: () => ({}),
}));

describe('Checkout Flow Tests', () => {

  it('renders information step initially', () => {
    // We cannot fully mount memory router if missing route wrapper, but can test basic render
    render(
      <BrowserRouter>
        <Checkout />
      </BrowserRouter>
    );
    
    expect(screen.getByText('Contact Information')).toBeInTheDocument();
  });

  it('moves to shipping method when valid info is entered', async () => {
    render(
      <BrowserRouter>
        <Checkout />
      </BrowserRouter>
    );

    fireEvent.change(screen.getByPlaceholderText('you@example.com'), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByPlaceholderText('(555) 000-0000'), { target: { value: '5551234567' } });
    fireEvent.change(screen.getByLabelText('First Name *'), { target: { value: 'John' } });
    fireEvent.change(screen.getByLabelText('Last Name *'), { target: { value: 'Doe' } });
    fireEvent.change(screen.getByPlaceholderText('123 Furniture St'), { target: { value: '123 Test St' } });
    fireEvent.change(screen.getByLabelText('City *'), { target: { value: 'Toronto' } });
    fireEvent.change(screen.getByLabelText('Province *'), { target: { value: 'ON' } });
    fireEvent.change(screen.getByPlaceholderText('A1B 2C3'), { target: { value: 'M5V 2N2' } });

    fireEvent.click(screen.getByText('Continue to Shipping Method'));

    await waitFor(() => {
      expect(screen.getByText('Shipping Method')).toBeInTheDocument();
    });
  });

});

describe('OrderSuccess Page Tests', () => {
  it('renders correctly with order data', () => {
    const mockState = {
      orderNumber: 'CZH-TEST12345',
      total: 1130
    };

    render(
      <MemoryRouter initialEntries={[{ pathname: '/checkout/success', state: mockState }]}>
        <OrderSuccess />
      </MemoryRouter>
    );

    expect(screen.getByText('Order Confirmed!')).toBeInTheDocument();
    expect(screen.getByText('CZH-TEST12345')).toBeInTheDocument();
    expect(screen.getByText('$1,130')).toBeInTheDocument();
  });
});
