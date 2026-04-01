import { Link } from 'react-router-dom';
import { Instagram, Facebook, Linkedin, Youtube, ArrowRight, MapPin, Phone, Mail, Clock } from 'lucide-react';
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
            <img src="/assets/logo-cozhaven.webp" alt="Cozhaven" className="footer__logo-img" style={{ height: '32px', width: 'auto', marginBottom: 'var(--space-4)', display: 'block' }} />
            <p className="footer__tagline">Creating Comfort, Crafting Style.</p>
            <p className="footer__desc">Premium Canadian-made furniture for modern living. Every piece tells a story of quality craftsmanship.</p>
            <div className="footer__contact-mini">
              <span><MapPin size={14} /> 6435 Dixie Rd, Unit 4, Mississauga, ON L5T 1X4</span>
              <span><Clock size={14} /> Store Hours: Mon-Fri 12pm-8pm | Sat-Sun 12pm-9pm</span>
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

          {/* Company Column */}
          <div className="footer__col">
            <h4>Company</h4>
            <Link to="/about">Our Story</Link>
            <Link to="/blog">Design Journal</Link>
            <Link to="/contact">Contact Us</Link>
            <a href="#">Careers</a>
            <a href="#">Sustainability</a>
            <a href="#">Trade Program</a>
          </div>

          {/* Resources Column — Inspiration Driven */}
          <div className="footer__col">
            <h4>Resources</h4>
            <Link to="/inspiration">Room Inspiration</Link>
            <a href="#">Buying Guides</a>
            <a href="#">Material Care</a>
            <a href="#">Assembly Help</a>
            <a href="#">Design Tips</a>
            <a href="#">Virtual Styling</a>
          </div>

          {/* Support Column */}
          <div className="footer__col">
            <h4>Support</h4>
            <Link to="/shipping-returns">Shipping & Returns</Link>
            <Link to="/faq">Track Order</Link>
            <Link to="/faq">Help Center</Link>
            <a href="#">Warranty</a>
            <a href="#">Financing</a>
            <Link to="/terms">Terms & Legal</Link>
          </div>
        </div>

        <div className="footer__bottom">
          <p>© 2025 Cozhaven. All rights reserved. Made with ♥ in Canada.</p>
          <div className="footer__bottom-links">
            <Link to="/privacy">Privacy Policy</Link>
            <Link to="/terms">Terms of Service</Link>
            <a href="#">Accessibility</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
