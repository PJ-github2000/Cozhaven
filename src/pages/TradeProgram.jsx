import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Phone, MapPin, CheckCircle2, Building, Globe, Send } from 'lucide-react';
import { useToast } from '../context/ToastContext';
import { Helmet } from 'react-helmet-async';
import './TradeProgram.css';

export default function TradeProgram() {
  const { addToast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Simulate API request
    setTimeout(() => {
      setIsSubmitting(false);
      addToast('Application submitted successfully. Our team will review your account closely.', 'success');
      e.target.reset();
    }, 1500);
  };

  return (
    <main className="trade-page">
      <Helmet>
        <title>Professional Trade Program | Cozhaven</title>
        <meta name="description" content="Register to become a Cozhaven Professional for preferred pricing, dedicated support, and early access to curated furniture collections." />
      </Helmet>

      {/* Hero Section */}
      <section className="trade-hero">
        <div className="trade-hero__bg" />
        <div className="trade-hero__content container">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <span className="trade-hero__subtitle">TRADE PROGRAM</span>
            <h1 className="trade-hero__title">
              CREATE MEANINGFUL<br />SPACES WITH US
            </h1>
            <p className="trade-hero__desc">
              Ordering for your client or business? Register to become a Cozhaven Professional for preferred pricing, dedicated support, and exclusive trade benefits.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Main Content Split */}
      <section className="trade-content container section-padding">
        <div className="trade-grid">
          {/* Left Column: Perks */}
          <motion.div 
            className="trade-perks"
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2>Exclusive Trade Perks</h2>
            <p className="trade-perks__intro">
              Partner with us to gain access to wholesale benefits tailored for interior designers, architects, contractors, and developers.
            </p>
            
            <ul className="trade-perks__list">
              <li>
                <CheckCircle2 className="perk-icon" />
                <div>
                  <strong>Preferred Trade Pricing</strong>
                  <p>Unlock wholesale discounts up to 30% off retail pricing, strictly reserved for our trade partners.</p>
                </div>
              </li>
              <li>
                <CheckCircle2 className="perk-icon" />
                <div>
                  <strong>Dedicated Concierge Support</strong>
                  <p>Get personalized assistance for large-scale orders, fabric sourcing, and custom logistics management.</p>
                </div>
              </li>
              <li>
                <CheckCircle2 className="perk-icon" />
                <div>
                  <strong>Early Access & Insider Drops</strong>
                  <p>Subscribe to our trade-exclusive newsletter for first looks at new collections and limited-edition product launches.</p>
                </div>
              </li>
              <li>
                <CheckCircle2 className="perk-icon" />
                <div>
                  <strong>Tax Exemption</strong>
                  <p>Streamlined purchasing with automated tax exemption processing for qualified resellers.</p>
                </div>
              </li>
            </ul>
          </motion.div>

          {/* Right Column: Registration Form */}
          <motion.div 
            className="trade-form-wrapper"
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="trade-form-card">
              <h3>Professional Registration</h3>
              <p>Apply below. Application approval typically takes 1-2 business days.</p>
              
              <form onSubmit={handleSubmit} className="trade-form">
                <div className="form-row">
                  <div className="form-group">
                    <label>First Name</label>
                    <input type="text" required placeholder="Jane" />
                  </div>
                  <div className="form-group">
                    <label>Last Name</label>
                    <input type="text" required placeholder="Doe" />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Email Address</label>
                    <input type="email" required placeholder="jane@studio.com" />
                  </div>
                  <div className="form-group">
                    <label>Phone Number</label>
                    <input type="tel" required placeholder="(555) 123-4567" />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Business Name</label>
                    <div className="input-icon-wrapper">
                      <Building size={16} />
                      <input type="text" required placeholder="Jane Doe Interiors" />
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Business Website (URL)</label>
                    <div className="input-icon-wrapper">
                      <Globe size={16} />
                      <input type="url" required placeholder="https://www.studio.com" />
                    </div>
                  </div>
                </div>

                <div className="form-group">
                  <label>Business Type</label>
                  <select required defaultValue="">
                    <option value="" disabled>Select your profession...</option>
                    <option value="interior_designer">Interior Designer</option>
                    <option value="architect">Architect</option>
                    <option value="contractor">Contractor / Builder</option>
                    <option value="developer">Real Estate Developer</option>
                    <option value="home_stager">Home Stager</option>
                    <option value="hospitality">Hospitality</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Business Address</label>
                  <div className="input-icon-wrapper">
                    <MapPin size={16} />
                    <input type="text" required placeholder="123 Design Avenue, Suite 100" />
                  </div>
                </div>

                <div className="form-group">
                  <label>How can we help? / Specific Needs</label>
                  <textarea rows="4" placeholder="Tell us about an upcoming project or what you are looking to source..."></textarea>
                </div>

                 <div className="form-checkbox">
                    <input type="checkbox" id="newsletter" defaultChecked />
                    <label htmlFor="newsletter">Keep me informed via the Trade-Exclusive Newsletter for product launches and offers.</label>
                </div>

                <button type="submit" className="btn btn-primary btn-full" disabled={isSubmitting}>
                  {isSubmitting ? 'Submitting Application...' : 'Apply for Trade Program'} <Send size={16} style={{marginLeft: 8}} />
                </button>
              </form>
            </div>
          </motion.div>
        </div>
      </section>
    </main>
  );
}
