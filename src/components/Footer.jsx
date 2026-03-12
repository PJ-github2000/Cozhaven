import { Link } from 'react-router-dom';
import { Instagram, Facebook, Linkedin, Youtube, ArrowRight, MapPin, Phone, Mail } from 'lucide-react';
import { useState } from 'react';
import { useToast } from '../context/ToastContext';
import './Footer.css';

export default function Footer() {
  const [email, setEmail] = useState('');
  const { addToast } = useToast();

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email.includes('@')) {
      addToast('Welcome to the Cozhaven family! ✨', 'success');
      setEmail('');
    }
  };

  return (
    <footer className="footer" id="footer">
      <div className="container">
        {/* Newsletter */}
        <div className="footer__newsletter">
          <span className="section-subtitle" style={{ color: 'var(--rich-bronze)' }}>Stay Connected</span>
          <h2>Join the Cozhaven Family</h2>
          <p>Be the first to know about new collections, exclusive offers, and design inspiration.</p>
          <form className="footer__newsletter-form" onSubmit={handleSubscribe}>
            <input
              type="email"
              placeholder="Your email address"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="footer__newsletter-input"
              aria-label="Email for newsletter"
            />
            <button type="submit" className="footer__newsletter-btn" aria-label="Subscribe">
              <ArrowRight size={20} />
            </button>
          </form>
        </div>

        <div className="footer__grid">
          {/* Brand Column */}
          <div className="footer__col footer__col--brand">
            <span className="footer__logo">COZHAVEN</span>
            <p className="footer__tagline">Creating Comfort, Crafting Style.</p>
            <p className="footer__desc">Premium Canadian-made furniture for modern living. Every piece tells a story of quality craftsmanship.</p>
            <div className="footer__contact-mini">
              <a href="tel:+16475559269"><Phone size={14} /> (647) 555-COZY</a>
              <a href="mailto:hello@cozhaven.ca"><Mail size={14} /> hello@cozhaven.ca</a>
              <span><MapPin size={14} /> GTA, Ontario, Canada</span>
            </div>
            <div className="footer__socials">
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" aria-label="Instagram"><Instagram size={18} /></a>
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" aria-label="Facebook"><Facebook size={18} /></a>
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn"><Linkedin size={18} /></a>
              <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" aria-label="YouTube"><Youtube size={18} /></a>
            </div>
          </div>

          {/* Link Columns */}
          <div className="footer__col">
            <h4>Shop</h4>
            <Link to="/shop?cat=living-room">Living Room</Link>
            <Link to="/shop?cat=bedroom">Bedroom</Link>
            <Link to="/shop?cat=dining">Dining Room</Link>
            <Link to="/shop?cat=occasional">Occasional Tables</Link>
            <Link to="/shop?cat=accents">Accents</Link>
            <Link to="/shop">All Products</Link>
          </div>

          <div className="footer__col">
            <h4>Company</h4>
            <Link to="/about">Our Story</Link>
            <Link to="/blog">Journal</Link>
            <Link to="/contact">Contact Us</Link>
            <a href="#">Careers</a>
            <a href="#">Press</a>
            <a href="#">Trade Program</a>
          </div>

          <div className="footer__col">
            <h4>Support</h4>
            <a href="#">Shipping & Returns</a>
            <a href="#">Care Guide</a>
            <a href="#">Warranty</a>
            <a href="#">FAQ</a>
            <a href="#">Size Guide</a>
            <a href="#">Financing</a>
          </div>
        </div>

        <div className="footer__bottom">
          <p>© 2025 Cozhaven. All rights reserved. Made with ♥ in Canada.</p>
          <div className="footer__bottom-links">
            <a href="#">Privacy Policy</a>
            <a href="#">Terms of Service</a>
            <a href="#">Accessibility</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
