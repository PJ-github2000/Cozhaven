import { motion } from 'framer-motion';
import { FileText, Scale, Gavel, Shield } from 'lucide-react';
import './PolicyPages.css';

export default function TermsOfService() {
  return (
    <main className="policy-page terms-policy-page">
      <div className="container">
        {/* Hero */}
        <motion.div 
          className="policy-hero"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <span className="section-subtitle">Legal Agreement</span>
          <h1>Terms of Service</h1>
          <p>Last updated: January 2025</p>
          <p className="hero-description">
            Please read these terms carefully before using our website or purchasing our products.
            By accessing our site, you agree to be bound by these terms.
          </p>
        </motion.div>

        {/* Content Sections */}
        <div className="policy-content">
          {/* Section 1 */}
          <section className="policy-section">
            <div className="section-icon"><FileText size={32} /></div>
            <h2>1. Acceptance of Terms</h2>
            
            <p>By accessing and using the Cozhaven website (the "Site"), you accept and agree to be legally bound by these Terms of Service ("Terms"). If you do not agree to these Terms, please do not use this Site.</p>
            
            <p className="policy-note">
              <strong>Important:</strong> These Terms constitute a legally binding agreement between you and Cozhaven Inc.
            </p>
          </section>

          {/* Section 2 */}
          <section className="policy-section policy-section--gray">
            <div className="section-icon"><Scale size={32} /></div>
            <h2>2. Use License</h2>
            
            <p>Permission is granted to temporarily access the materials on Cozhaven's Site for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title.</p>
            
            <p><strong>You may NOT:</strong></p>
            <ul className="policy-list">
              <li>Modify or copy the materials</li>
              <li>Use the materials for any commercial purpose</li>
              <li>Attempt to decompile or reverse engineer any software</li>
              <li>Remove any copyright or proprietary notations</li>
              <li>Transfer the materials to another person</li>
              <li>"Mirror" any materials on any other server</li>
            </ul>
            
            <p>This license shall automatically terminate if you violate any restrictions and may be terminated by Cozhaven at any time.</p>
          </section>

          {/* Section 3 */}
          <section className="policy-section">
            <div className="section-icon"><Gavel size={32} /></div>
            <h2>3. Product Information & Pricing</h2>
            
            <div className="policy-subsection">
              <h3>Accuracy</h3>
              <p>We strive to provide accurate product descriptions, images, and pricing. However, we do not warrant that product descriptions or other content is accurate, complete, or error-free.</p>
            </div>

            <div className="policy-subsection">
              <h3>Pricing</h3>
              <p>All prices are in Canadian dollars (CAD) unless otherwise stated. Prices are subject to change without notice. We reserve the right to refuse service to anyone and to correct any pricing errors.</p>
            </div>

            <div className="policy-subsection">
              <h3>Availability</h3>
              <p>Product availability is subject to stock. In the event of a stock error, we will notify you promptly and offer alternatives or a full refund.</p>
            </div>
          </section>

          {/* Section 4 */}
          <section className="policy-section policy-section--gray">
            <div className="section-icon"><Shield size={32} /></div>
            <h2>4. Orders & Payment</h2>
            
            <p><strong>Order Acceptance:</strong> Your order constitutes an offer to purchase. We reserve the right to refuse any order for any reason, including but not limited to:</p>
            <ul className="policy-list">
              <li>Unavailability of products</li>
              <li>Pricing errors</li>
              <li>Suspected fraud or unauthorized use</li>
              <li>Violation of our policies</li>
            </ul>

            <p><strong>Payment Terms:</strong> Full payment is required at time of purchase. We accept major credit cards and other payment methods as displayed at checkout.</p>
            
            <p><strong>Taxes:</strong> Applicable taxes (GST/HST/PST/QST) will be calculated based on your shipping address.</p>
          </section>

          {/* Section 5 */}
          <section className="policy-section">
            <h2>5. Shipping & Delivery</h2>
            
            <p>Shipping times are estimates and not guaranteed. We are not liable for delays caused by carriers, customs, weather, or circumstances beyond our control.</p>
            
            <p>Risk of loss passes to you upon delivery to the carrier. Title passes when you receive the items.</p>
          </section>

          {/* Section 6 */}
          <section className="policy-section policy-section--gray">
            <h2>6. Returns & Refunds</h2>
            
            <p>Our return policy is outlined in our <a href="/shipping-returns">Shipping & Returns Policy</a>. Key points include:</p>
            <ul className="policy-list">
              <li>30-day return window from delivery date</li>
              <li>Items must be in original, unused condition</li>
              <li>Original packaging preferred</li>
              <li>Free return pickup provided</li>
              <li>Refunds processed within 5-7 business days</li>
            </ul>
          </section>

          {/* Section 7 */}
          <section className="policy-section">
            <h2>7. Warranties & Liability</h2>
            
            <div className="policy-subsection">
              <h3>Limited Warranty</h3>
              <p>Cozhaven products come with a manufacturer's warranty covering defects in materials and workmanship. Warranty periods vary by product - see individual product pages for details.</p>
            </div>

            <div className="policy-subsection">
              <h3>Disclaimer</h3>
              <p>EXCEPT AS EXPRESSLY STATED, THE SITE AND ALL MATERIALS ARE PROVIDED "AS IS" WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED.</p>
            </div>

            <div className="policy-subsection">
              <h3>Limitation of Liability</h3>
              <p>COZHAVEN SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES ARISING FROM YOUR USE OF THE SITE OR PRODUCTS.</p>
            </div>
          </section>

          {/* Section 8 */}
          <section className="policy-section policy-section--gray">
            <h2>8. Intellectual Property</h2>
            
            <p>All content on this Site, including text, graphics, logos, images, and software, is the property of Cozhaven Inc. or its content suppliers and protected by Canadian and international copyright laws.</p>
            
            <p><strong>Trademarks:</strong> "Cozhaven" and the Cozhaven logo are trademarks of Cozhaven Inc.</p>
          </section>

          {/* Section 9 */}
          <section className="policy-section">
            <h2>9. Indemnification</h2>
            
            <p>You agree to indemnify and hold Cozhaven harmless from any claims, losses, liabilities, damages, or expenses arising from your use of the Site, violation of these Terms, or infringement of any intellectual property rights.</p>
          </section>

          {/* Section 10 */}
          <section className="policy-section policy-section--gray">
            <h2>10. Governing Law</h2>
            
            <p>These Terms shall be governed by the laws of the Province of Ontario and the federal laws of Canada applicable therein, without regard to conflict of law principles.</p>
            
            <p>Any disputes shall be resolved exclusively in the courts of Toronto, Ontario.</p>
          </section>

          {/* Section 11 */}
          <section className="policy-section">
            <h2>11. Changes to Terms</h2>
            
            <p>We reserve the right to modify these Terms at any time. Changes will be effective immediately upon posting to the Site. Your continued use constitutes acceptance of modified Terms.</p>
          </section>

          {/* Section 12 */}
          <section className="policy-section policy-section--gray">
            <h2>12. Contact Information</h2>
            
            <p>For questions about these Terms of Service, please contact us:</p>
            <div className="contact-info">
              <p><strong>Email:</strong> <a href="mailto:legal@cozhaven.ca">legal@cozhaven.ca</a></p>
              <p><strong>Phone:</strong> (647) 555-COZY</p>
              <p><strong>Address:</strong> Cozhaven Inc., Toronto, Ontario, Canada</p>
            </div>
          </section>

          {/* Final Notice */}
          <section className="policy-section policy-section--highlight">
            <h2>Entire Agreement</h2>
            <p>These Terms, together with our Privacy Policy and other legal policies, constitute the entire agreement between you and Cozhaven regarding the Site and supersede all prior agreements.</p>
          </section>
        </div>
      </div>
    </main>
  );
}
