import { motion } from 'framer-motion';
import { Truck, Clock, Package, RotateCcw, CheckCircle } from 'lucide-react';
import './ShippingReturns.css';

export default function ShippingReturns() {
  return (
    <main className="policy-page shipping-returns-page">
      <div className="container">
        {/* Hero */}
        <motion.div 
          className="policy-hero"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <span className="section-subtitle">Customer Care</span>
          <h1>Shipping & Returns</h1>
          <p>We make it easy to get your Cozhaven furniture delivered and hassle-free returns if needed.</p>
        </motion.div>

        {/* Shipping Methods */}
        <section className="policy-section">
          <div className="section-header">
            <h2>Shipping Methods & Rates</h2>
          </div>

          <div className="shipping-methods-grid">
            <motion.div 
              className="shipping-method-card"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
            >
              <div className="shipping-icon"><Truck size={32} /></div>
              <h3>Standard Shipping</h3>
              <div className="shipping-price">FREE</div>
              <ul className="shipping-features">
                <li><CheckCircle size={16} /> 5-7 business days</li>
                <li><CheckCircle size={16} /> Curbside delivery</li>
                <li><CheckCircle size={16} /> Tracking included</li>
                <li><CheckCircle size={16} /> Available across Canada</li>
              </ul>
              <p className="shipping-note">Free on all orders over $999</p>
            </motion.div>

            <motion.div 
              className="shipping-method-card featured"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
            >
              <div className="featured-badge">Most Popular</div>
              <div className="shipping-icon"><Clock size={32} /></div>
              <h3>Express Shipping</h3>
              <div className="shipping-price">$49</div>
              <ul className="shipping-features">
                <li><CheckCircle size={16} /> 2-3 business days</li>
                <li><CheckCircle size={16} /> Priority handling</li>
                <li><CheckCircle size={16} /> Real-time tracking</li>
                <li><CheckCircle size={16} /> Signature required</li>
              </ul>
              <p className="shipping-note">Expedited processing and delivery</p>
            </motion.div>

            <motion.div 
              className="shipping-method-card"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
            >
              <div className="shipping-icon"><Package size={32} /></div>
              <h3>White-Glove Delivery</h3>
              <div className="shipping-price">$149</div>
              <ul className="shipping-features">
                <li><CheckCircle size={16} /> Scheduled appointment</li>
                <li><CheckCircle size={16} /> Room of choice placement</li>
                <li><CheckCircle size={16} /> Unpacking service</li>
                <li><CheckCircle size={16} /> Packaging removal</li>
              </ul>
              <p className="shipping-note">Premium full-service delivery</p>
            </motion.div>
          </div>
        </section>

        {/* Processing Time */}
        <section className="policy-section policy-section--gray">
          <div className="container">
            <div className="processing-info">
              <h2>Order Processing Time</h2>
              <div className="processing-timeline">
                <div className="timeline-item">
                  <div className="timeline-dot">1</div>
                  <h4>Order Placed</h4>
                  <p>Confirmation email sent immediately</p>
                </div>
                <div className="timeline-arrow">→</div>
                <div className="timeline-item">
                  <div className="timeline-dot">2</div>
                  <h4>Processing</h4>
                  <p>1-2 business days to prepare</p>
                </div>
                <div className="timeline-arrow">→</div>
                <div className="timeline-item">
                  <div className="timeline-dot">3</div>
                  <h4>Shipped</h4>
                  <p>Tracking number emailed to you</p>
                </div>
              </div>
              <p className="processing-note">
                <strong>Note:</strong> Orders placed after 2 PM EST or on weekends/holidays will be processed the next business day.
              </p>
            </div>
          </div>
        </section>

        {/* Returns Policy */}
        <section className="policy-section">
          <div className="section-header">
            <h2>Returns & Exchanges</h2>
            <p>We want you to love your Cozhaven furniture. If you're not completely satisfied, we're here to help.</p>
          </div>

          <div className="returns-grid">
            <div className="returns-card">
              <div className="returns-icon"><RotateCcw size={32} /></div>
              <h3>30-Day Return Window</h3>
              <p>Return any item within 30 days of delivery for a full refund. No questions asked.</p>
            </div>

            <div className="returns-card">
              <div className="returns-icon"><CheckCircle size={32} /></div>
              <h3>Free Return Pickup</h3>
              <p>We'll arrange and pay for pickup of your return. Just pack it up and we'll handle the rest.</p>
            </div>

            <div className="returns-card">
              <div className="returns-icon"><Package size={32} /></div>
              <h3>Original Condition</h3>
              <p>Items must be in original condition with tags attached and original packaging if possible.</p>
            </div>
          </div>

          <div className="returns-process">
            <h3>How to Return an Item</h3>
            <ol className="returns-steps">
              <li>
                <strong>Contact Us</strong>
                <p>Email hello@cozhaven.ca or call (647) 555-COZY within 30 days of delivery</p>
              </li>
              <li>
                <strong>Pack Securely</strong>
                <p>Use original packaging when possible. Include all parts, cushions, and hardware</p>
              </li>
              <li>
                <strong>Schedule Pickup</strong>
                <p>We'll arrange free pickup at your convenience. Be available during the pickup window</p>
              </li>
              <li>
                <strong>Receive Refund</strong>
                <p>Refund processed within 5-7 business days after we receive and inspect the item</p>
              </li>
            </ol>
          </div>
        </section>

        {/* What's Returnable */}
        <section className="policy-section policy-section--gray">
          <div className="container">
            <h2>What Can Be Returned?</h2>
            
            <div className="returnable-grid">
              <div className="returnable-item yes">
                <h4>✓ Returnable Items</h4>
                <ul>
                  <li>Furniture in original condition</li>
                  <li>Unused textiles and pillows</li>
                  <li>Unopened accent items</li>
                  <li>Damaged or defective items</li>
                  <li>Wrong items shipped by us</li>
                </ul>
              </div>

              <div className="returnable-item no">
                <h4>✗ Non-Returnable Items</h4>
                <ul>
                  <li>Custom or made-to-order items</li>
                  <li>Final sale or clearance items</li>
                  <li>Used or assembled furniture</li>
                  <li>Personalized or monogrammed items</li>
                  <li>Gift cards</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Refunds */}
        <section className="policy-section">
          <div className="container">
            <h2>Refund Information</h2>
            
            <div className="refunds-info">
              <div className="refund-detail">
                <h4>Refund Timing</h4>
                <p>Refunds are processed within 5-7 business days after we receive and inspect your return. The credit will appear on your original payment method within 3-5 additional business days depending on your bank.</p>
              </div>

              <div className="refund-detail">
                <h4>Refund Amount</h4>
                <p>You'll receive a full refund for the item price. Original shipping charges are non-refundable unless the return is due to our error or a defective item.</p>
              </div>

              <div className="refund-detail">
                <h4>Return Shipping</h4>
                <p>Free return pickup is provided for all returns. For international returns or oversized items, customer is responsible for return shipping costs.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Damaged Items */}
        <section className="policy-section policy-section--alert">
          <div className="container">
            <h2>Damaged or Defective Items</h2>
            <p className="alert-text">
              If your item arrives damaged or defective, please contact us within 48 hours of delivery. 
              We'll arrange immediate replacement or full refund at no cost to you, including return shipping.
            </p>
            <div className="alert-actions">
              <a href="mailto:hello@cozhaven.ca" className="btn btn-primary">Email Us</a>
              <a href="tel:+16475559269" className="btn btn-secondary">Call (647) 555-COZY</a>
            </div>
          </div>
        </section>

        {/* Contact */}
        <section className="policy-section">
          <div className="container">
            <div className="contact-cta">
              <h2>Questions?</h2>
              <p>Our customer care team is here to help Monday - Saturday, 10 AM - 8 PM EST</p>
              <div className="contact-methods">
                <a href="mailto:hello@cozhaven.ca" className="contact-method">
                  <strong>Email</strong>
                  <span>hello@cozhaven.ca</span>
                </a>
                <a href="tel:+16475559269" className="contact-method">
                  <strong>Phone</strong>
                  <span>(647) 555-COZY</span>
                </a>
                <a href="/contact" className="contact-method">
                  <strong>Contact Form</strong>
                  <span>Get a response within 24 hours</span>
                </a>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
