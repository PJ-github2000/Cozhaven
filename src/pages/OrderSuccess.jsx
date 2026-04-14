import { useEffect, useMemo, useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { loadStripe } from '@stripe/stripe-js';
import { Check, Package, Truck, Mail, ArrowRight, FileText, X, Download, Loader2, AlertCircle } from 'lucide-react';
import OrderInvoice from '../components/OrderInvoice';
import { API_BASE, STRIPE_PUBLISHABLE_KEY } from '../services/apiConfig.js';
import './OrderSuccess.css';

const stripePromise = STRIPE_PUBLISHABLE_KEY ? loadStripe(STRIPE_PUBLISHABLE_KEY) : null;

export default function OrderSuccess() {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const state = location.state || {};
  const [showInvoice, setShowInvoice] = useState(false);
  const [status, setStatus] = useState('loading');
  const [statusMessage, setStatusMessage] = useState('Verifying your payment and order status...');
  const [resolvedOrder, setResolvedOrder] = useState({
    orderNumber: state.orderNumber || null,
    total: state.total || null,
    paymentIntentId: state.paymentIntentId || null,
    paymentStatus: null,
  });

  const lastOrder = useMemo(
    () => JSON.parse(localStorage.getItem('cozhaven_last_order') || '{}'),
    []
  );
  const clientSecret = params.get('payment_intent_client_secret');
  const shipping = lastOrder.shipping || {};
  const customerName = [shipping.firstName, shipping.lastName].filter(Boolean).join(' ').trim() || 'Valued Customer';
  const shippingAddress = [
    shipping.address1,
    shipping.address2,
    [shipping.city, shipping.province, shipping.postalCode].filter(Boolean).join(', '),
    shipping.country,
  ].filter(Boolean).join(', ');
  const displayOrderNumber = resolvedOrder.orderNumber || lastOrder.orderNumber;
  const displayTotal = resolvedOrder.total || lastOrder.total || 0;

  useEffect(() => {
    let isActive = true;
    let pollTimer = null;

    const persistResolvedOrder = (next) => {
      const merged = {
        ...lastOrder,
        orderNumber: next.orderNumber ?? lastOrder.orderNumber ?? null,
        paymentIntentId: next.paymentIntentId ?? lastOrder.paymentIntentId ?? null,
        paymentStatus: next.paymentStatus ?? lastOrder.paymentStatus ?? null,
        total: next.total ?? lastOrder.total ?? null,
      };
      localStorage.setItem('cozhaven_last_order', JSON.stringify(merged));
    };

    const fetchOrderStatus = async (paymentIntentId, attempts = 0) => {
      const response = await fetch(`${API_BASE}/orders/confirm`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ paymentIntentId }),
      });

      if (!response.ok) {
        const errorPayload = await response.json().catch(() => ({}));
        throw new Error(errorPayload.detail || 'Unable to verify order status');
      }

      const payload = await response.json();
      if (!isActive) return;

      setResolvedOrder((current) => ({
        ...current,
        paymentIntentId,
        paymentStatus: payload.payment_status || current.paymentStatus,
        orderNumber: payload.order_number || current.orderNumber,
        total: payload.total ?? current.total,
      }));

      if (payload.status === 'success') {
        setStatus('success');
        setStatusMessage('Your order has been confirmed.');
        persistResolvedOrder({
          orderNumber: payload.order_number,
          paymentIntentId,
          paymentStatus: payload.payment_status || 'succeeded',
          total: payload.total,
        });
        return;
      }

      if (payload.status === 'processing' && attempts < 10) {
        setStatus('processing');
        setStatusMessage('Payment succeeded. We are finalizing your order now.');
        pollTimer = window.setTimeout(() => {
          fetchOrderStatus(paymentIntentId, attempts + 1).catch((error) => {
            if (!isActive) return;
            setStatus('error');
            setStatusMessage(error.message);
          });
        }, 2000);
        return;
      }

      setStatus('error');
      setStatusMessage(payload.payment_status === 'succeeded'
        ? 'Payment succeeded, but order finalization is delayed. Please contact support if this persists.'
        : 'Payment was not completed. Please try checkout again.');
    };

    const resolveFromStripe = async () => {
      if (!clientSecret) {
        const fallbackIntentId = state.paymentIntentId || lastOrder.paymentIntentId;
        if (!fallbackIntentId) {
          setStatus(displayOrderNumber ? 'success' : 'error');
          setStatusMessage(displayOrderNumber ? 'Your order has been confirmed.' : 'We could not find a recent payment to verify.');
          return;
        }
        await fetchOrderStatus(fallbackIntentId);
        return;
      }

      if (!stripePromise) {
        setStatus('error');
        setStatusMessage('Stripe publishable key is missing. Unable to verify payment status.');
        return;
      }

      const stripe = await stripePromise;
      if (!stripe) {
        setStatus('error');
        setStatusMessage('Stripe failed to initialize on the success page.');
        return;
      }

      const { paymentIntent, error } = await stripe.retrievePaymentIntent(clientSecret);
      if (error) {
        setStatus('error');
        setStatusMessage(error.message || 'Unable to verify payment status.');
        return;
      }

      if (!paymentIntent) {
        setStatus('error');
        setStatusMessage('Stripe did not return a payment intent for this confirmation.');
        return;
      }

      setResolvedOrder((current) => ({
        ...current,
        paymentIntentId: paymentIntent.id,
        paymentStatus: paymentIntent.status,
      }));

      if (paymentIntent.status === 'requires_payment_method' || paymentIntent.status === 'canceled') {
        setStatus('error');
        setStatusMessage('Payment was not completed. Please return to checkout and try again.');
        return;
      }

      await fetchOrderStatus(paymentIntent.id);
    };

    resolveFromStripe().catch((error) => {
      if (!isActive) return;
      setStatus('error');
      setStatusMessage(error.message || 'Unable to verify order status.');
    });

    return () => {
      isActive = false;
      if (pollTimer) window.clearTimeout(pollTimer);
    };
  }, [clientSecret, displayOrderNumber, lastOrder, state.paymentIntentId]);

  const estimatedDelivery = new Date();
  estimatedDelivery.setDate(estimatedDelivery.getDate() + 7);

  const orderData = {
    id: displayOrderNumber?.replace('CZH-', '') || '0000',
    customer_name: customerName,
    user_email: shipping.email || 'N/A',
    shipping_address: shippingAddress || 'N/A',
    total_amount: displayTotal || 0,
    created_at: new Date().toISOString(),
    status: status === 'success' ? 'Confirmed' : 'Processing',
    items: lastOrder.items || [],
  };

  return (
    <main className="order-success-page">
      <div className="container">
        <motion.div
          className="success-content"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <motion.div
            className="success-icon"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3, type: 'spring', stiffness: 200 }}
          >
            {status === 'error' ? <AlertCircle size={48} /> : status === 'success' ? <Check size={48} /> : <Loader2 size={48} className="animate-spin" />}
          </motion.div>

          <h1>{status === 'success' ? 'Order Confirmed!' : status === 'error' ? 'Payment Verification Needed' : 'Finalizing Your Order'}</h1>
          <p className="success-subtitle">{statusMessage}</p>

          <div className="order-details-card">
            <div className="order-header">
              <div>
                <h3>Order Number</h3>
                <p className="order-number">{displayOrderNumber || 'Pending confirmation'}</p>
              </div>
              <div className="order-date">
                <span>{new Date().toLocaleDateString('en-CA', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
              </div>
            </div>

            <div className="order-summary-mini">
              <div className="summary-row">
                <span>Total Paid</span>
                <strong>${displayTotal?.toLocaleString()}</strong>
              </div>
              <div className="summary-row">
                <span>Payment Status</span>
                <strong>{resolvedOrder.paymentStatus || lastOrder.paymentStatus || 'Pending'}</strong>
              </div>
              <div className="summary-row">
                <span>Estimated Delivery</span>
                <strong>{estimatedDelivery.toLocaleDateString('en-CA', { month: 'short', day: 'numeric', year: 'numeric' })}</strong>
              </div>
            </div>

            <div className="order-actions">
              <Link to="/shop" className="btn btn-primary">Continue Shopping</Link>
              {status === 'success' && (
                <button className="btn btn-secondary btn-icon-text" onClick={() => setShowInvoice(true)}>
                  <FileText size={18} /> View Invoice
                </button>
              )}
            </div>
          </div>

          <AnimatePresence>
            {showInvoice && (
              <motion.div
                className="invoice-modal-overlay"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <div className="invoice-modal">
                  <div className="invoice-modal__header no-print">
                    <h3>Order Invoice</h3>
                    <div className="header-actions">
                      <button className="btn btn-primary btn-sm" onClick={() => window.print()}>
                        <Download size={16} /> Print / Save PDF
                      </button>
                      <button className="close-icon" onClick={() => setShowInvoice(false)}><X size={24} /></button>
                    </div>
                  </div>
                  <div className="invoice-modal__body">
                    <OrderInvoice order={orderData} />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="next-steps">
            <h2>What's Next?</h2>
            <div className="steps-grid">
              <motion.div className="step-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
                <div className="step-icon"><Mail size={24} /></div>
                <h3>Confirmation Email</h3>
                <p>We send the confirmation once the webhook finishes creating the order.</p>
              </motion.div>

              <motion.div className="step-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
                <div className="step-icon"><Package size={24} /></div>
                <h3>Processing & Shipping</h3>
                <p>Your order enters processing after payment confirmation and inventory reservation.</p>
              </motion.div>

              <motion.div className="step-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
                <div className="step-icon"><Truck size={24} /></div>
                <h3>Track Your Order</h3>
                <p>Tracking details are sent after fulfillment is prepared.</p>
              </motion.div>
            </div>
          </div>

          <div className="support-info">
            <h3>Need Help?</h3>
            <p>Our customer support team is here for you</p>
            <div className="support-links">
              <a href="mailto:hello@cozhaven.ca">hello@cozhaven.ca</a>
              <span className="divider">|</span>
              <a href="tel:+16475559269">(647) 555-COZY</a>
              <span className="divider">|</span>
              <Link to="/contact">Contact Form</Link>
            </div>
          </div>

          {!localStorage.getItem('cozhaven_user') && (
            <motion.div className="account-cta" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }}>
              <h3>Create an Account</h3>
              <p>Save your information for faster checkout next time and track your orders easily</p>
              <div className="account-cta__actions">
                <Link to="/account/create" className="btn btn-ghost">
                  Create Account <ArrowRight size={16} />
                </Link>
              </div>
            </motion.div>
          )}
        </motion.div>
      </div>
    </main>
  );
}
