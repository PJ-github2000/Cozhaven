import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, User, ShoppingBag, Heart, Menu, X, ChevronDown } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useAuth } from '../context/AuthContext';
import CartDrawer from './CartDrawer';
import SearchModal from './SearchModal';
import AuthModal from './AuthModal';
import './Header.css';

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const { itemCount } = useCart();
  const { items: wishItems } = useWishlist();
  const { user, logout } = useAuth();
  const location = useLocation();

  // Pages with dark hero backgrounds need white header text
  const isHeroPage = (location.pathname === '/' || location.pathname === '/about') 
    && (typeof window !== 'undefined' && window.innerWidth > 768);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => { setMenuOpen(false); }, [location]);

  const navLinks = [
    { to: '/', label: 'Home' },
    { to: '/shop', label: 'Shop' },
    { to: '/about', label: 'About' },
    { to: '/blog', label: 'Journal' },
    { to: '/contact', label: 'Contact' },
  ];

  const headerClass = [
    'header',
    isHeroPage && !scrolled ? 'header--transparent' : 'header--scrolled',
  ].filter(Boolean).join(' ');

  return (
    <>
      <header className={headerClass} id="header">
        {/* Promo Banner */}
        <PromoBanner />

        <div className="header__inner container">
          {/* Mobile Menu Toggle */}
          <button className="header__menu-toggle hide-desktop" onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle menu">
            {menuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>

          {/* Logo */}
          <Link to="/" className="header__logo" aria-label="Cozhaven Home">
            <span className="header__logo-text">COZHAVEN</span>
          </Link>

          {/* Desktop Nav */}
          <nav className="header__nav hide-mobile" role="navigation" aria-label="Main navigation">
            {navLinks.map(link => (
              <Link
                key={link.to}
                to={link.to}
                className={`header__nav-link ${location.pathname === link.to ? 'active' : ''}`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Actions */}
          <div className="header__actions">
            <button className="header__action-btn" onClick={() => setSearchOpen(true)} aria-label="Search">
              <Search size={20} />
            </button>
            <Link to="/wishlist" className="header__action-btn hide-mobile" aria-label="Wishlist">
              <Heart size={20} />
              {wishItems.length > 0 && <span className="header__badge">{wishItems.length}</span>}
            </Link>
            {user ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                <span style={{ fontSize: '0.85rem', color: isHeroPage && !scrolled ? 'var(--warm-white)' : 'var(--deep-charcoal)' }}>
                  Hi, {user.first_name}!
                </span>
                <button 
                  className="header__action-btn" 
                  onClick={logout} 
                  aria-label="Logout"
                  title="Logout"
                >
                  <X size={20} />
                </button>
              </div>
            ) : (
              <button 
                className="header__action-btn" 
                onClick={() => setAuthModalOpen(true)} 
                aria-label="Account"
                title="Sign In"
              >
                <User size={20} />
              </button>
            )}
            <button className="header__action-btn" onClick={() => setCartOpen(true)} aria-label="Shopping cart">
              <ShoppingBag size={20} />
              {itemCount > 0 && (
                <motion.span
                  className="header__badge"
                  key={itemCount}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 15 }}
                >
                  {itemCount}
                </motion.span>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Nav */}
        <AnimatePresence>
          {menuOpen && (
            <motion.nav
              className="header__mobile-nav"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
            >
              {navLinks.map((link, i) => (
                <motion.div
                  key={link.to}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Link
                    to={link.to}
                    className={`header__mobile-link ${location.pathname === link.to ? 'active' : ''}`}
                  >
                    {link.label}
                  </Link>
                </motion.div>
              ))}
            </motion.nav>
          )}
        </AnimatePresence>
      </header>

      <CartDrawer isOpen={cartOpen} onClose={() => setCartOpen(false)} />
      <SearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
      <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} />
    </>
  );
}

function PromoBanner() {
  const [visible, setVisible] = useState(true);
  if (!visible) return null;
  return (
    <div className="promo-banner">
      <p>🎉 Canadian-Made Comfort — <strong>20% Off</strong> with <code>COZHAVEN20</code></p>
      <button onClick={() => setVisible(false)} aria-label="Close promo banner"><X size={16} /></button>
    </div>
  );
}
