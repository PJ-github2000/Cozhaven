import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Truck, Shield, Check, ArrowLeft } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import StripePaymentWrapper from '../components/StripePaymentForm';
import './Checkout.css';

export default function Checkout() {
  const navigate = useNavigate();
  const { items, subtotal, clearCart } = useCart();
  const { addToast } = useToast();
  const [step, setStep] = useState(1);

  const [shipping, setShipping] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address1: '',
    address2: '',
    city: '',
    province: '',
    postalCode: '',
    country: 'Canada',
  });

  const [shippingMethod, setShippingMethod] = useState('standard');

  // Server-calculated breakdown (populated when Stripe form loads)
  const [serverCalc, setServerCalc] = useState(null);

  const shippingRates = {
    standard: { price: 0, label: 'Free Standard Shipping', days: '5-7 business days' },
    express: { price: 49, label: 'Express Shipping', days: '2-3 business days' },
    whiteGlove: { price: 149, label: 'White-Glove Delivery', days: 'Scheduled appointment' },
  };

  const displayTotal = serverCalc ? serverCalc.total : subtotal + shippingRates[shippingMethod].price;

  const buildOrderSnapshot = ({ orderNumber = null, paymentIntentId = null, paymentStatus = 'pending' } = {}) => ({
    orderNumber,
    paymentIntentId,
    paymentStatus,
    items,
    total: displayTotal,
    shipping,
    shippingMethod,
    date: new Date().toISOString(),
  });

  const handleShippingSubmit = (e) => {
    e.preventDefault();
    if (!shipping.firstName || !shipping.lastName || !shipping.email || !shipping.address1 || !shipping.city || !shipping.province || !shipping.postalCode) {
      addToast('Please fill in all required shipping fields', 'error');
      return;
    }
    setStep(2);
    window.scrollTo(0, 0);
  };

  const processOrder = async ({ paymentIntentId, clientSecret = null }) => {
    localStorage.setItem('cozhaven_last_order', JSON.stringify(
      buildOrderSnapshot({ paymentIntentId, paymentStatus: 'processing' })
    ));
    clearCart();
    const successUrl = clientSecret
      ? `/checkout/success?payment_intent_client_secret=${encodeURIComponent(clientSecret)}`
      : '/checkout/success';
    navigate(successUrl, { state: { paymentIntentId, total: displayTotal } });
    addToast('Payment received. Finalizing your order.', 'info');
  };

  const steps = [
    { id: 1, label: 'Information' },
    { id: 2, label: 'Shipping' },
    { id: 3, label: 'Payment' },
  ];

  if (items.length === 0 && step !== 4) {
    return (
      <main className="checkout-page">
        <div className="container section-padding" style={{ textAlign: 'center', paddingTop: '100px' }}>
          <h2>Your cart is empty</h2>
          <p style={{ margin: 'var(--space-4) 0' }}>Add some items before checking out</p>
          <button className="btn btn-primary btn-large" onClick={() => navigate('/shop')}>Browse Collection</button>
        </div>
      </main>
    );
  }

  return (
    <main className="checkout">
      <div className="checkout__container">
        <header className="checkout__header">
          <h1 className="checkout__title">Checkout</h1>
          <p className="checkout__subtitle">Complete your order with secure payment</p>
        </header>

        {/* Progress Steps */}
        <div className="checkout__progress">
          {steps.map((s) => (
            <div 
              key={s.id} 
              className={`checkout__step ${step === s.id ? 'active' : ''} ${step > s.id ? 'completed' : ''}`}
              onClick={() => step > s.id && setStep(s.id)}
            >
              <div className="checkout__step-number">
                {step > s.id ? <Check size={16} /> : s.id}
              </div>
              <span className="checkout__step-label">{s.label}</span>
            </div>
          ))}
        </div>

        <div className="checkout__layout">
          {/* Main Content */}
          <motion.div 
            className="checkout__main"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <button className="back-link" onClick={() => step > 1 ? setStep(step - 1) : navigate('/cart')} style={{ marginBottom: 'var(--space-4)' }}>
              <ArrowLeft size={16} /> {step > 1 ? `Back to ${steps[step-2].label}` : 'Back to Cart'}
            </button>

            {step === 1 && (
              <form className="checkout__form" onSubmit={(e) => { e.preventDefault(); setStep(2); }}>
                <div className="form-section">
                  <h2 className="form-section__title">Contact Information</h2>
                  <div className="form-group" style={{ marginBottom: 'var(--space-3)' }}>
                    <label htmlFor="email">Email Address *</label>
                    <input
                      id="email"
                      type="email"
                      placeholder="you@example.com"
                      value={shipping.email}
                      onChange={(e) => setShipping({ ...shipping, email: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="phone">Phone Number (for delivery scheduling) *</label>
                    <input
                      id="phone"
                      type="tel"
                      placeholder="(555) 000-0000"
                      value={shipping.phone}
                      onChange={(e) => setShipping({ ...shipping, phone: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="form-section">
                  <h2 className="form-section__title">Shipping Address</h2>
                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="firstName">First Name *</label>
                      <input id="firstName" type="text" value={shipping.firstName} onChange={(e) => setShipping({ ...shipping, firstName: e.target.value })} required />
                    </div>
                    <div className="form-group">
                      <label htmlFor="lastName">Last Name *</label>
                      <input id="lastName" type="text" value={shipping.lastName} onChange={(e) => setShipping({ ...shipping, lastName: e.target.value })} required />
                    </div>
                  </div>

                  <div className="form-group" style={{ marginBottom: 'var(--space-3)' }}>
                    <label htmlFor="address1">Address *</label>
                    <input id="address1" type="text" placeholder="123 Furniture St" value={shipping.address1} onChange={(e) => setShipping({ ...shipping, address1: e.target.value })} required />
                  </div>

                  <div className="form-group" style={{ marginBottom: 'var(--space-3)' }}>
                    <label htmlFor="address2">Unit / Suite (optional)</label>
                    <input id="address2" type="text" value={shipping.address2} onChange={(e) => setShipping({ ...shipping, address2: e.target.value })} />
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="city">City *</label>
                      <input id="city" type="text" value={shipping.city} onChange={(e) => setShipping({ ...shipping, city: e.target.value })} required />
                    </div>
                    <div className="form-group">
                      <label htmlFor="province">Province *</label>
                      <select id="province" value={shipping.province} onChange={(e) => setShipping({ ...shipping, province: e.target.value })} required>
                        <option value="">Select</option>
                        <option value="ON">Ontario</option>
                        <option value="QC">Quebec</option>
                        <option value="BC">British Columbia</option>
                        <option value="AB">Alberta</option>
                        <option value="SK">Saskatchewan</option>
                        <option value="MB">Manitoba</option>
                        <option value="NS">Nova Scotia</option>
                        <option value="NB">New Brunswick</option>
                        <option value="NL">Newfoundland</option>
                        <option value="PE">Prince Edward Island</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label htmlFor="postalCode">Postal Code *</label>
                      <input id="postalCode" type="text" placeholder="A1B 2C3" value={shipping.postalCode} onChange={(e) => setShipping({ ...shipping, postalCode: e.target.value.toUpperCase() })} required />
                    </div>
                  </div>
                </div>

                <button type="submit" className="btn btn-primary btn-large" style={{ width: '100%', marginTop: 'var(--space-3)' }}>
                  Continue to Shipping Method
                </button>
              </form>
            )}

            {step === 2 && (
              <div className="checkout__form">
                <div className="form-section">
                  <h2 className="form-section__title">Shipping Method</h2>
                  <p style={{ color: 'var(--charcoal-muted)', marginBottom: 'var(--space-4)', fontSize: '0.9rem' }}>
                    Select how you would like to receive your furniture.
                  </p>
                  <div className="shipping-methods">
                    {Object.entries(shippingRates).map(([key, method]) => (
                      <div 
                        key={key} 
                        className={`shipping-option ${shippingMethod === key ? 'selected' : ''}`}
                        onClick={() => setShippingMethod(key)}
                      >
                        <div className="shipping-option__info">
                          <span className="shipping-option__label">{method.label}</span>
                          <span className="shipping-option__days">{method.days}</span>
                          {key === 'whiteGlove' && <span style={{ fontSize: '0.75rem', color: 'var(--rich-bronze)', marginTop: '4px' }}>* Includes assembly & debris removal</span>}
                        </div>
                        <span className="shipping-option__price">{method.price === 0 ? 'FREE' : `$${method.price}`}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="checkout__actions">
                   <button onClick={() => setStep(3)} className="btn btn-primary btn-large">
                      Continue to Payment
                   </button>
                </div>
              </div>
            )}

            {step === 3 && (
              <StripePaymentWrapper
                cartItems={items}
                shippingMethod={shippingMethod}
                province={shipping.province || "ON"}
                promoCode={null}
                email={shipping.email}
                shippingAddress={JSON.stringify(shipping)}
                fallbackTotal={displayTotal}
                onPaymentSuccess={processOrder}
                onCalculation={setServerCalc}
              />
            )}

          </motion.div>

        {/* Order Summary Sidebar */}
        <motion.aside 
          className="checkout__summary"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <h3 className="summary-title">Order Summary</h3>
          
          <div className="summary-items">
            {items.map((item, index) => (
              <div key={item.key || item.id || item.product_id || `${item.name}-${index}`} className="summary-item">
                <img src={item.image} alt={item.name} className="summary-item__image" />
                <div className="summary-item__details">
                  <h4 className="summary-item__name">{item.name}</h4>
                  <p className="summary-item__variant">
                    {item.size} · <span className="color-dot" style={{ background: item.color }} />
                  </p>
                  <p className="summary-item__quantity">Qty: {item.quantity}</p>
                </div>
                <p className="summary-item__price">${(item.price * item.quantity).toLocaleString()}</p>
              </div>
            ))}
          </div>

          <div className="summary-totals">
            <div className="summary-row">
              <span>Subtotal</span>
              <span>${(serverCalc?.subtotal ?? subtotal).toLocaleString()}</span>
            </div>
            {serverCalc?.discount > 0 && (
              <div className="summary-row" style={{ color: 'var(--rich-bronze)' }}>
                <span>Discount</span>
                <span>-${serverCalc.discount.toLocaleString()}</span>
              </div>
            )}
            <div className="summary-row">
              <span>Shipping</span>
              <span>{(serverCalc?.shipping ?? shippingRates[shippingMethod].price) === 0 ? 'FREE' : `$${serverCalc?.shipping ?? shippingRates[shippingMethod].price}`}</span>
            </div>
            {serverCalc && (
              <div className="summary-row">
                <span>Tax ({serverCalc.tax_label})</span>
                <span>${serverCalc.tax_amount.toLocaleString()}</span>
              </div>
            )}
            <div className="summary-row total">
              <span>Total</span>
              <span>${displayTotal.toLocaleString()}</span>
            </div>
          </div>

          <div className="trust-badges" style={{ marginTop: 'var(--space-4)', display: 'grid', gap: '12px' }}>
            <div className="checkout__security" style={{ background: 'transparent', padding: 0 }}>
              <Truck size={18} />
              <span>Ships in 2-5 business days</span>
            </div>
            <div className="checkout__security" style={{ background: 'transparent', padding: 0 }}>
              <Shield size={18} />
              <span>5-Year Manufacturer Warranty</span>
            </div>
          </div>
        </motion.aside>
        </div>
      </div>
    </main>
  );
}
