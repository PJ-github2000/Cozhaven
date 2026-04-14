import React, { useState, useEffect } from "react";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements
} from "@stripe/react-stripe-js";
import { Shield, AlertCircle, Loader2 } from "lucide-react";
import { STRIPE_PUBLISHABLE_KEY, API_BASE } from "../services/apiConfig.js";

// Load Stripe with env var key
const stripePromise = STRIPE_PUBLISHABLE_KEY
  ? loadStripe(STRIPE_PUBLISHABLE_KEY)
  : null;
const isMockCheckoutEnabled = import.meta.env.VITE_E2E_MOCK_CHECKOUT === 'true';

const CheckoutForm = ({ total, clientSecret, onPaymentSuccess, loading, setLoading }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [errorMessage, setErrorMessage] = useState(null);
  const [isReady, setIsReady] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!stripe || !elements || !isReady) {
      return;
    }

    setLoading(true);
    setErrorMessage(null);

    try {
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/checkout/success`,
        },
        redirect: "if_required",
      });

      if (error) {
        setErrorMessage(error.message);
        setLoading(false);
      } else if (paymentIntent && ["succeeded", "processing"].includes(paymentIntent.status)) {
        // We stay in loading state while navigating
        onPaymentSuccess({
          paymentIntentId: paymentIntent.id,
          clientSecret: paymentIntent.client_secret || clientSecret || null,
        });
      } else {
        setErrorMessage("An unexpected error occurred.");
        setLoading(false);
      }
    } catch (err) {
      setErrorMessage(err.message);
      setLoading(false);
    }
  };

  return (
    <form className="checkout__form" onSubmit={handleSubmit}>
      <div className="form-section">
        <h2 className="form-section__title">
          <Shield size={20} style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '8px' }} />
          Payment Details
        </h2>
        
        {/* Helper for key issues */}
        {STRIPE_PUBLISHABLE_KEY && STRIPE_PUBLISHABLE_KEY.startsWith('sk_') && (
          <div style={{ color: "var(--status-error)", marginBottom: "1rem", padding: "1rem", background: "rgba(255,0,0,0.05)", border: "1px solid var(--status-error)", borderRadius: "var(--radius-md)" }}>
             <p><strong>⚠️ Configuration Error:</strong> You are using a <strong>Secret Key</strong> (sk_test_...) instead of a <strong>Publishable Key</strong> (pk_test_...) in your frontend .env.local file. Please swap it!</p>
          </div>
        )}

        <PaymentElement 
            id="payment-element" 
            onReady={() => setIsReady(true)}
            options={{ layout: "tabs" }} 
        />
        
        {!isReady && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--charcoal-muted)', marginTop: '1rem' }}>
            <div className="processing-spinner" style={{ width: 16, height: 16, margin: 0 }} />
            <span>Initializing secure payment fields...</span>
          </div>
        )}
      </div>

      {errorMessage && (
        <div style={{ color: "var(--status-error)", marginTop: "1rem", padding: "1rem", background: "rgba(255,0,0,0.1)", borderRadius: "var(--radius-md)", display: 'flex', gap: '8px' }}>
          <AlertCircle size={18} />
          <span>{errorMessage}</span>
        </div>
      )}

      <div className="checkout__security" style={{ marginTop: 'var(--space-4)' }}>
        <Shield size={18} />
        <span>Your transaction is secured with 256-bit SSL encryption.</span>
      </div>

      <button 
        disabled={!stripe || !isReady || loading} 
        type="submit" 
        className="btn btn-primary btn-large" 
        style={{ width: '100%', marginTop: 'var(--space-3)' }}
      >
        {loading ? (
          <>
            <Loader2 size={18} className="animate-spin" style={{ marginRight: '8px' }} />
            Processing...
          </>
        ) : (
          `Place Order — $${Number(total).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
        )}
      </button>
    </form>
  );
};

export default function StripePaymentWrapper({ cartItems, shippingMethod, province, promoCode, email, shippingAddress, fallbackTotal = 0, onPaymentSuccess, onCalculation }) {
  const [clientSecret, setClientSecret] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [serverTotal, setServerTotal] = useState(0);

  const computedFallbackTotal = Number(
    cartItems.reduce((sum, item) => sum + (Number(item.price) || 0) * (Number(item.quantity) || 1), 0)
  );
  const displayTotal = serverTotal || fallbackTotal || computedFallbackTotal;

  useEffect(() => {
    if (!isMockCheckoutEnabled || !onCalculation) return;
    const subtotal = cartItems.reduce((sum, item) => sum + (Number(item.price) || 0) * (Number(item.quantity) || 1), 0);
    onCalculation({
      subtotal,
      discount: 0,
      shipping: Math.max(0, Number(fallbackTotal || 0) - subtotal),
      tax_label: 'Estimated',
      tax_amount: 0,
      total: Number(fallbackTotal || subtotal),
    });
  }, [cartItems, fallbackTotal, onCalculation]);

  useEffect(() => {
    if (isMockCheckoutEnabled) return;
    if (!cartItems || cartItems.length === 0) return;

    const fetchIntent = async () => {
      try {
        setError(null);
        
        // Ensure shippingAddress is passed as an object to prevent double-stringifying
        const parsedAddress = typeof shippingAddress === 'string' ? JSON.parse(shippingAddress) : shippingAddress;

        const response = await fetch(`${API_BASE}/create-payment-intent`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            items: cartItems.map(item => ({
              product_id: item.id || item.product_id,
              quantity: item.quantity || 1,
              color: item.color || null,
              size: item.size || null,
            })),
            shipping_method: shippingMethod || "standard",
            province: province || "ON",
            promo_code: promoCode || null,
            email: email || null,
            shipping_address: parsedAddress || null,
          }),
        });

        if (!response.ok) {
          const errData = await response.json();
          throw new Error(errData.detail || "Failed to create payment intent");
        }

        const data = await response.json();
        setClientSecret(data.clientSecret);
        setServerTotal(data.calculation.total);

        // Pass calculation back to parent for display
        if (onCalculation) {
          onCalculation(data.calculation);
        }
      } catch (err) {
        console.error("Failed to initialize payment", err);
        setError(err.message);
      }
    };
    fetchIntent();
  }, [cartItems, shippingMethod, province, promoCode, email, shippingAddress]);

  if (isMockCheckoutEnabled) {
    return (
      <div className="checkout__form">
        <div className="form-section">
          <h2 className="form-section__title">Payment Details</h2>
          <p style={{ color: 'var(--charcoal-muted)', marginBottom: '1rem' }}>
            E2E mock checkout is enabled for browser automation.
          </p>
          <button
            type="button"
            className="btn btn-primary btn-large"
            data-testid="mock-place-order"
            style={{ width: '100%' }}
            onClick={() => onPaymentSuccess({ paymentIntentId: 'pi_mock_e2e_success', clientSecret: null })}
          >
            Place Order — ${Number(displayTotal).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </button>
        </div>
      </div>
    );
  }

  if (!STRIPE_PUBLISHABLE_KEY) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--status-error)' }}>
        <p><strong>Stripe not configured.</strong></p>
        <p style={{ fontSize: '0.85rem', marginTop: '0.5rem' }}>
          Set VITE_STRIPE_PUBLISHABLE_KEY in your .env.local file.
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--status-error)' }}>
        <p><strong>Payment Setup Failed</strong></p>
        <p style={{ fontSize: '0.9rem', marginTop: '0.5rem' }}>{error}</p>
        <button className="btn btn-secondary" style={{ marginTop: '1rem' }} onClick={() => window.location.reload()}>
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="stripe-payment-wrapper">
      {clientSecret && stripePromise ? (
        <Elements options={{
          clientSecret,
          appearance: {
            theme: 'night',
            variables: {
              colorPrimary: '#cba052',
              colorBackground: '#111111',
              colorText: '#ffffff',
              colorDanger: '#ff4d4d',
              fontFamily: 'Inter, system-ui, sans-serif',
            }
          }
        }} stripe={stripePromise}>
          <CheckoutForm
            total={serverTotal}
            clientSecret={clientSecret}
            onPaymentSuccess={(piId) => onPaymentSuccess(piId)}
            loading={loading}
            setLoading={setLoading}
          />
        </Elements>
      ) : (
        <div style={{ padding: '3rem', textAlign: 'center' }}>
          <div className="processing-spinner" style={{ margin: '0 auto var(--space-3)' }} />
          <p style={{ color: 'var(--charcoal-muted)' }}>Preparing secure checkout...</p>
        </div>
      )}
    </div>
  );
}
