import { motion } from 'framer-motion';
import { Shield, Lock, Eye, Database, Cookie, Mail } from 'lucide-react';
import './PolicyPages.css';

export default function PrivacyPolicy() {
  return (
    <main className="policy-page privacy-policy-page">
      <div className="container">
        {/* Hero */}
        <motion.div 
          className="policy-hero"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <span className="section-subtitle">Privacy & Security</span>
          <h1>Privacy Policy</h1>
          <p>Last updated: January 2025</p>
          <p className="hero-description">
            We respect your privacy and are committed to protecting your personal information. 
            This policy explains how we collect, use, and safeguard your data.
          </p>
        </motion.div>

        {/* Content Sections */}
        <div className="policy-content">
          {/* Section 1 */}
          <section className="policy-section">
            <div className="section-icon"><Shield size={32} /></div>
            <h2>1. Information We Collect</h2>
            
            <div className="policy-subsection">
              <h3>Personal Information</h3>
              <p>When you purchase from us, we collect:</p>
              <ul>
                <li>Name and contact information</li>
                <li>Shipping and billing addresses</li>
                <li>Payment information (processed securely through third-party providers)</li>
                <li>Email address and phone number</li>
                <li>Order history and preferences</li>
              </ul>
            </div>

            <div className="policy-subsection">
              <h3>Automatically Collected Information</h3>
              <p>When you browse our website, we automatically receive:</p>
              <ul>
                <li>IP address and browser type</li>
                <li>Device information</li>
                <li>Pages viewed and time spent</li>
                <li>Referral source</li>
              </ul>
            </div>
          </section>

          {/* Section 2 */}
          <section className="policy-section policy-section--gray">
            <div className="section-icon"><Lock size={32} /></div>
            <h2>2. How We Use Your Information</h2>
            
            <p>We use the information we collect to:</p>
            <ul className="policy-list">
              <li>Process and fulfill your orders</li>
              <li>Communicate with you about purchases, accounts, or inquiries</li>
              <li>Send promotional emails (with your consent)</li>
              <li>Improve our website and services</li>
              <li>Prevent fraud and enhance security</li>
              <li>Comply with legal obligations</li>
            </ul>
          </section>

          {/* Section 3 */}
          <section className="policy-section">
            <div className="section-icon"><Eye size={32} /></div>
            <h2>3. Information Sharing</h2>
            
            <p><strong>We do not sell, trade, or rent your personal information.</strong></p>
            <p>We may share information with:</p>
            <ul className="policy-list">
              <li><strong>Service Providers:</strong> Payment processors, shipping carriers, and IT services that help us operate</li>
              <li><strong>Legal Requirements:</strong> When required by law or to protect our rights</li>
              <li><strong>Business Transfers:</strong> In connection with a merger or sale of assets (with notice)</li>
            </ul>
          </section>

          {/* Section 4 */}
          <section className="policy-section policy-section--gray">
            <div className="section-icon"><Database size={32} /></div>
            <h2>4. Data Security</h2>
            
            <p>We implement industry-standard security measures to protect your information:</p>
            <ul className="policy-list">
              <li>SSL encryption for all transactions</li>
              <li>Secure servers and networks</li>
              <li>Regular security audits and updates</li>
              <li>Limited employee access to personal data</li>
              <li>Encrypted payment processing through PCI-compliant providers</li>
            </ul>
            <p className="policy-note">
              <strong>Note:</strong> No method of transmission over the Internet is 100% secure, but we use commercially acceptable means to protect your data.
            </p>
          </section>

          {/* Section 5 */}
          <section className="policy-section">
            <div className="section-icon"><Cookie size={32} /></div>
            <h2>5. Cookies and Tracking</h2>
            
            <p>We use cookies and similar technologies to:</p>
            <ul className="policy-list">
              <li>Remember your preferences and shopping cart</li>
              <li>Analyze site traffic and usage patterns</li>
              <li>Personalize your experience</li>
              <li>Serve relevant advertisements</li>
            </ul>
            <p>You can control cookie settings through your browser. Disabling cookies may affect site functionality.</p>
          </section>

          {/* Section 6 */}
          <section className="policy-section policy-section--gray">
            <div className="section-icon"><Mail size={32} /></div>
            <h2>6. Your Rights</h2>
            
            <p>You have the right to:</p>
            <ul className="policy-list">
              <li>Access your personal information</li>
              <li>Correct inaccurate data</li>
              <li>Request deletion of your data</li>
              <li>Opt-out of marketing communications</li>
              <li>Export your data in a portable format</li>
              <li>Withdraw consent for data processing</li>
            </ul>
            <p>To exercise these rights, contact us at <a href="mailto:privacy@cozhaven.ca">privacy@cozhaven.ca</a></p>
          </section>

          {/* Section 7 */}
          <section className="policy-section">
            <h2>7. Third-Party Links</h2>
            <p>Our website may contain links to external sites. We are not responsible for their privacy practices. We encourage you to review their policies.</p>
          </section>

          {/* Section 8 */}
          <section className="policy-section policy-section--gray">
            <h2>8. Children's Privacy</h2>
            <p>Our services are not directed to individuals under 16. We do not knowingly collect personal information from children. If you believe we have, please contact us immediately.</p>
          </section>

          {/* Section 9 */}
          <section className="policy-section">
            <h2>9. Changes to This Policy</h2>
            <p>We may update this policy periodically. The "Last updated" date will reflect changes. Continued use of our site constitutes acceptance of the updated policy.</p>
          </section>

          {/* Contact */}
          <section className="policy-section policy-section--highlight">
            <h2>Questions or Concerns?</h2>
            <p>If you have questions about this Privacy Policy, please contact us:</p>
            <div className="contact-info">
              <p><strong>Email:</strong> <a href="mailto:privacy@cozhaven.ca">privacy@cozhaven.ca</a></p>
              <p><strong>Phone:</strong> (647) 555-COZY</p>
              <p><strong>Mail:</strong> Cozhaven Inc., Toronto, Ontario, Canada</p>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
