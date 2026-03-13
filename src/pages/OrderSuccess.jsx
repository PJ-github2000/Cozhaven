import { useLocation, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Check, Package, Truck, Mail, ArrowRight } from 'lucide-react';

export default function OrderSuccess() {
  const location = useLocation();
  const { orderNumber, total } = location.state || {};

  // Fallback if no state (direct URL access)
  const lastOrder = JSON.parse(localStorage.getItem('cozhaven_last_order') || '{}');
  const displayOrderNumber = orderNumber || lastOrder.orderNumber;
  const displayTotal = total || lastOrder.total;
  const estimatedDelivery = new Date();
  estimatedDelivery.setDate(estimatedDelivery.getDate() + 7);

  return (
    <main className="order-success-page">
      <div className="container">
        <motion.div 
          className="success-content"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Success Icon */}
          <motion.div 
            className="success-icon"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3, type: 'spring', stiffness: 200 }}
          >
            <Check size={48} />
          </motion.div>

          {/* Header */}
          <h1>Order Confirmed!</h1>
          <p className="success-subtitle">Thank you for your purchase</p>

          {/* Order Details Card */}
          <div className="order-details-card">
            <div className="order-header">
              <div>
                <h3>Order Number</h3>
                <p className="order-number">{displayOrderNumber}</p>
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
                <span>Estimated Delivery</span>
                <strong>{estimatedDelivery.toLocaleDateString('en-CA', { month: 'short', day: 'numeric', year: 'numeric' })}</strong>
              </div>
            </div>

            <div className="order-actions">
              <Link to="/shop" className="btn btn-primary">Continue Shopping</Link>
              <button className="btn btn-secondary" onClick={() => window.print()}>
                Print Receipt
              </button>
            </div>
          </div>

          {/* Next Steps */}
          <div className="next-steps">
            <h2>What's Next?</h2>
            
            <div className="steps-grid">
              <motion.div 
                className="step-card"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <div className="step-icon"><Mail size={24} /></div>
                <h3>Confirmation Email</h3>
                <p>We've sent an order confirmation to your email with all the details</p>
              </motion.div>

              <motion.div 
                className="step-card"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <div className="step-icon"><Package size={24} /></div>
                <h3>Processing & Shipping</h3>
                <p>Your order will be processed and shipped within 1-2 business days</p>
              </motion.div>

              <motion.div 
                className="step-card"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
              >
                <div className="step-icon"><Truck size={24} /></div>
                <h3>Track Your Order</h3>
                <p>You'll receive a tracking number via email once your order ships</p>
              </motion.div>
            </div>
          </div>

          {/* Support Info */}
          <div className="support-info">
            <h3>Need Help?</h3>
            <p>Our customer support team is here for you</p>
            <div className="support-links">
              <a href="mailto:hello@cozhaven.ca">hello@cozhaven.ca</a>
              <span className="divider">•</span>
              <a href="tel:+16475559269">(647) 555-COZY</a>
              <span className="divider">•</span>
              <Link to="/contact">Contact Form</Link>
            </div>
          </div>

          {/* Create Account CTA */}
          {!localStorage.getItem('cozhaven_user') && (
            <motion.div 
              className="account-cta"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
            >
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
