import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CreditCard, Truck, Shield, Check, ArrowLeft, Lock } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import './Checkout.css';

export default function Checkout() {
  const navigate = useNavigate();
  const { items, subtotal, clearCart } = useCart();
  const { addToast } = useToast();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

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
  const [payment, setPayment] = useState({
    cardNumber: '',
    cardName: '',
    expiry: '',
    cvv: '',
  });

  const shippingRates = {
    standard: { price: 0, label: 'Free Standard Shipping', days: '5-7 business days' },
    express: { price: 49, label: 'Express Shipping', days: '2-3 business days' },
    whiteGlove: { price: 149, label: 'White-Glove Delivery', days: 'Scheduled appointment' },
  };

  const total = subtotal + shippingRates[shippingMethod].price;

  const handleShippingSubmit = (e) => {
    e.preventDefault();
    if (!shipping.firstName || !shipping.lastName || !shipping.email || !shipping.address1 || !shipping.city || !shipping.province || !shipping.postalCode) {
      addToast('Please fill in all required shipping fields', 'error');
      return;
    }
    setStep(2);
    window.scrollTo(0, 0);
  };

  const handlePaymentSubmit = (e) => {
    e.preventDefault();
    if (!payment.cardNumber || !payment.cardName || !payment.expiry || !payment.cvv) {
      addToast('Please fill in all payment details', 'error');
      return;
    }
    if (payment.cardNumber.replace(/\s/g, '').length !== 16) {
      addToast('Please enter a valid 16-digit card number', 'error');
      return;
    }
    setStep(3);
    processOrder();
  };

  const processOrder = async () => {
    setLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const orderNumber = `CZH-${Date.now().toString(36).toUpperCase()}`;
    localStorage.setItem('cozhaven_last_order', JSON.stringify({
      orderNumber,
      items,
      total,
      shipping,
      shippingMethod,
      date: new Date().toISOString(),
    }));
    
    clearCart();
    setLoading(false);
    navigate('/checkout/success', { state: { orderNumber, total } });
    addToast('Order placed successfully!', 'success');
  };

  if (items.length === 0 && step !== 3) {
    return (
      <main className="checkout-page">
        <div className="container section-padding" style={{ textAlign: 'center', paddingTop: '150px' }}>
          <h2>Your cart is empty</h2>
          <p style={{ margin: 'var(--space-4) 0' }}>Add some items before checking out</p>
          <button className="btn btn-primary btn-large" onClick={() => navigate('/shop')}>Browse Collection</button>
        </div>
      </main>
    );
  }

  return (
    <main className="checkout-page">
      {/* Progress Steps */}
      <div className="checkout-progress">
        <div className={`checkout-progress__step ${step >= 1 ? 'active' : ''}`}>
          <div className="checkout-progress__number">1</div>
          <span>Shipping</span>
        </div>
        <div className="checkout-progress__line" />
        <div className={`checkout-progress__step ${step >= 2 ? 'active' : ''}`}>
          <div className="checkout-progress__number">2</div>
          <span>Payment</span>
        </div>
        <div className="checkout-progress__line" />
        <div className={`checkout-progress__step ${step >= 3 ? 'active' : ''}`}>
          <div className="checkout-progress__number">3</div>
          <span>Confirm</span>
        </div>
      </div>

      <div className="container checkout-layout">
        {/* Main Content */}
        <motion.div 
          className="checkout-main"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <button className="back-link" onClick={() => step > 1 ? setStep(step - 1) : navigate('/cart')}>
            <ArrowLeft size={16} /> {step > 1 ? 'Back' : 'Back to Cart'}
          </button>

          {step === 1 && (
            <form className="checkout-form" onSubmit={handleShippingSubmit}>
              <h2>Shipping Information</h2>
              
              <div className="form-row">
                <div className="input-group">
                  <label htmlFor="firstName">First Name *</label>
                  <input
                    id="firstName"
                    type="text"
                    className="input-field"
                    value={shipping.firstName}
                    onChange={(e) => setShipping({ ...shipping, firstName: e.target.value })}
                    required
                  />
                </div>
                <div className="input-group">
                  <label htmlFor="lastName">Last Name *</label>
                  <input
                    id="lastName"
                    type="text"
                    className="input-field"
                    value={shipping.lastName}
                    onChange={(e) => setShipping({ ...shipping, lastName: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="input-group">
                  <label htmlFor="email">Email *</label>
                  <input
                    id="email"
                    type="email"
                    className="input-field"
                    value={shipping.email}
                    onChange={(e) => setShipping({ ...shipping, email: e.target.value })}
                    required
                  />
                </div>
                <div className="input-group">
                  <label htmlFor="phone">Phone *</label>
                  <input
                    id="phone"
                    type="tel"
                    className="input-field"
                    value={shipping.phone}
                    onChange={(e) => setShipping({ ...shipping, phone: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="input-group">
                <label htmlFor="address1">Address *</label>
                <input
                  id="address1"
                  type="text"
                  className="input-field"
                  value={shipping.address1}
                  onChange={(e) => setShipping({ ...shipping, address1: e.target.value })}
                  placeholder="Street address"
                  required
                />
              </div>

              <div className="input-group">
                <label htmlFor="address2">Apartment, suite, etc. (optional)</label>
                <input
                  id="address2"
                  type="text"
                  className="input-field"
                  value={shipping.address2}
                  onChange={(e) => setShipping({ ...shipping, address2: e.target.value })}
                />
              </div>

              <div className="form-row">
                <div className="input-group">
                  <label htmlFor="city">City *</label>
                  <input
                    id="city"
                    type="text"
                    className="input-field"
                    value={shipping.city}
                    onChange={(e) => setShipping({ ...shipping, city: e.target.value })}
                    required
                  />
                </div>
                <div className="input-group">
                  <label htmlFor="province">Province *</label>
                  <select
                    id="province"
                    className="input-field"
                    value={shipping.province}
                    onChange={(e) => setShipping({ ...shipping, province: e.target.value })}
                    required
                  >
                    <option value="">Select Province</option>
                    <option value="ON">Ontario</option>
                    <option value="QC">Quebec</option>
                    <option value="BC">British Columbia</option>
                    <option value="AB">Alberta</option>
                    <option value="MB">Manitoba</option>
                    <option value="SK">Saskatchewan</option>
                    <option value="NS">Nova Scotia</option>
                    <option value="NB">New Brunswick</option>
                    <option value="NL">Newfoundland and Labrador</option>
                    <option value="PE">Prince Edward Island</option>
                    <option value="NT">Northwest Territories</option>
                    <option value="YT">Yukon</option>
                    <option value="NU">Nunavut</option>
                  </select>
                </div>
                <div className="input-group">
                  <label htmlFor="postalCode">Postal Code *</label>
                  <input
                    id="postalCode"
                    type="text"
                    className="input-field"
                    value={shipping.postalCode}
                    onChange={(e) => setShipping({ ...shipping, postalCode: e.target.value.toUpperCase() })}
                    placeholder="K1A 0B1"
                    required
                  />
                </div>
              </div>

              <button type="submit" className="btn btn-primary btn-large" style={{ width: '100%', marginTop: 'var(--space-4)' }}>
                Continue to Payment
              </button>
            </form>
          )}

          {step === 2 && (
            <form className="checkout-form" onSubmit={handlePaymentSubmit}>
              <h2>Payment Details</h2>
              
              <div className="payment-methods-info">
                <div className="info-card">
                  <CreditCard size={20} />
                  <div>
                    <strong>We Accept All Major Cards</strong>
                    <span>Visa, Mastercard, American Express</span>
                  </div>
                </div>
                <div className="info-card">
                  <Lock size={20} />
                  <div>
                    <strong>Secure Encryption</strong>
                    <span>256-bit SSL encryption</span>
                  </div>
                </div>
              </div>

              <div className="input-group">
                <label htmlFor="cardName">Name on Card *</label>
                <input
                  id="cardName"
                  type="text"
                  className="input-field"
                  value={payment.cardName}
                  onChange={(e) => setPayment({ ...payment, cardName: e.target.value })}
                  required
                />
              </div>

              <div className="input-group">
                <label htmlFor="cardNumber">Card Number *</label>
                <input
                  id="cardNumber"
                  type="text"
                  className="input-field"
                  value={payment.cardNumber}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, '');
                    const formatted = val.match(/.{1,4}/g)?.join(' ') || '';
                    setPayment({ ...payment, cardNumber: formatted.substring(0, 19) });
                  }}
                  placeholder="1234 5678 9012 3456"
                  maxLength={19}
                  required
                />
              </div>

              <div className="form-row">
                <div className="input-group">
                  <label htmlFor="expiry">Expiry Date *</label>
                  <input
                    id="expiry"
                    type="text"
                    className="input-field"
                    value={payment.expiry}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, '');
                      if (val.length <= 4) {
                        const formatted = val.length > 2 ? `${val.substring(0, 2)}/${val.substring(2)}` : val;
                        setPayment({ ...payment, expiry: formatted });
                      }
                    }}
                    placeholder="MM/YY"
                    maxLength={5}
                    required
                  />
                </div>
                <div className="input-group">
                  <label htmlFor="cvv">CVV *</label>
                  <input
                    id="cvv"
                    type="text"
                    className="input-field"
                    value={payment.cvv}
                    onChange={(e) => setPayment({ ...payment, cvv: e.target.value.replace(/\D/g, '').substring(0, 4) })}
                    placeholder="123"
                    maxLength={4}
                    required
                  />
                </div>
              </div>

              <div className="payment-security-notice">
                <Shield size={18} />
                <span>Your payment information is encrypted and secure. We never store your full card details.</span>
              </div>

              <button 
                type="submit" 
                className="btn btn-primary btn-large" 
                style={{ width: '100%', marginTop: 'var(--space-4)' }}
                disabled={loading}
              >
                {loading ? 'Processing...' : `Pay $${total.toLocaleString()}`}
              </button>
            </form>
          )}

          {step === 3 && (
            <div className="checkout-processing">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                <div className="processing-spinner" />
                <h2>Processing Your Order</h2>
                <p>Please wait while we secure your order...</p>
              </motion.div>
            </div>
          )}
        </motion.div>

        {/* Order Summary Sidebar */}
        <motion.aside 
          className="checkout-summary"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <h3>Order Summary</h3>
          
          <div className="summary-items">
            {items.map(item => (
              <div key={item.key} className="summary-item">
                <img src={item.image} alt={item.name} className="summary-item__image" />
                <div className="summary-item__info">
                  <h4>{item.name}</h4>
                  <p className="summary-item__variant">
                    {item.size} · <span className="color-dot" style={{ background: item.color }} />
                  </p>
                  <p className="summary-item__qty">Qty: {item.quantity}</p>
                </div>
                <p className="summary-item__price">${(item.price * item.quantity).toLocaleString()}</p>
              </div>
            ))}
          </div>

          <div className="summary-totals">
            <div className="summary-row">
              <span>Subtotal</span>
              <span>${subtotal.toLocaleString()}</span>
            </div>
            <div className="summary-row">
              <span>Shipping</span>
              <span>{shippingRates[shippingMethod].price === 0 ? 'FREE' : `$${shippingRates[shippingMethod].price}`}</span>
            </div>
            {step >= 2 && (
              <>
                <div className="summary-row summary-row--detail">
                  <span>— {shippingRates[shippingMethod].label}</span>
                  <span>({shippingRates[shippingMethod].days})</span>
                </div>
                <div className="summary-row summary-row--total">
                  <span>Total</span>
                  <span>${total.toLocaleString()}</span>
                </div>
              </>
            )}
          </div>

          {step === 1 && (
            <div className="shipping-methods">
              <h4>Shipping Method</h4>
              {Object.entries(shippingRates).map(([key, { price, label, days }]) => (
                <label key={key} className={`shipping-option ${shippingMethod === key ? 'active' : ''}`}>
                  <input
                    type="radio"
                    name="shippingMethod"
                    checked={shippingMethod === key}
                    onChange={() => setShippingMethod(key)}
                  />
                  <div className="shipping-option__content">
                    <div className="shipping-option__header">
                      <strong>{label}</strong>
                      {price === 0 ? (
                        <span className="free-badge">FREE</span>
                      ) : (
                        <span>${price}</span>
                      )}
                    </div>
                    <span className="shipping-option__days">{days}</span>
                  </div>
                </label>
              ))}
            </div>
          )}

          <div className="trust-badges">
            <div className="trust-badge">
              <Truck size={18} />
              <span>Free shipping over $999</span>
            </div>
            <div className="trust-badge">
              <Shield size={18} />
              <span>5-year warranty</span>
            </div>
            <div className="trust-badge">
              <Check size={18} />
              <span>30-day returns</span>
            </div>
          </div>
        </motion.aside>
      </div>
    </main>
  );
}
