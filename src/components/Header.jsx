import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, User, ShoppingBag, Heart, Menu, X, ChevronDown, LogOut, LayoutDashboard, Download } from 'lucide-react';
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
  const { user, logout, isAdmin } = useAuth();
  const location = useLocation();

  const handleDownloadCatalogue = () => {
    const link = document.createElement('a');
    link.href = '/Cozhaven_2026_Catalog.pdf';
    link.download = 'Cozhaven_2026_Catalog.pdf';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Pages with dark hero backgrounds need white header text
  const isHeroPage = (location.pathname === '/' || location.pathname === '/about' || location.pathname.startsWith('/collections/'));

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => { setMenuOpen(false); }, [location]);

  const navLinks = [
    { to: '/', label: 'Home' },
    {
      to: '/shop',
      label: 'Shop',
      dropdown: [
        { to: '/shop?cat=sectionals', label: 'Sectionals' },
        { to: '/shop?cat=sofas', label: 'Sofas' },
        { to: '/shop?cat=dining', label: 'Dining' },
        { to: '/shop?cat=bedroom', label: 'Bedroom' },
        { to: '/shop?cat=tables', label: 'Tables' },
        { to: '/shop?cat=living-room', label: 'Living Sets' },
        { to: '/shop?cat=chairs', label: 'Chairs' },
        { to: '/shop?cat=lighting', label: 'Lighting' },
        { to: '/shop?cat=vanity', label: 'Vanities' },
        { to: '/designer-series', label: 'Designer Series ✨' },
      ]
    },
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
        <div className="header__top-banner">
          <div className="container header__top-banner-inner">
            <div className="header__top-banner-left">
              <span>Proudly Canadian</span>
              <span className="separator">|</span>
              <span>Fast & Free Shipping</span>
            </div>
            <div className="header__top-banner-right hide-mobile">
              <Link to="/about">About Us</Link>
              <Link to="/contact">Help & Support</Link>
              <Link to="/contact">Our Locations</Link>
            </div>
          </div>
        </div>
        <div className="header__inner container">
          {/* Mobile Menu Toggle */}
          <button className="header__menu-toggle hide-desktop" onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle menu">
            {menuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>

          {/* Logo */}
          <Link to="/" className="header__logo" aria-label="Cozhaven Home">
            <span className="header__logo-text">cozhaven</span>
          </Link>

          {/* Desktop Nav */}
          <nav className="header__nav hide-mobile" role="navigation" aria-label="Main navigation">
            {navLinks.map(link => (
              <div key={link.label} className={`nav-item ${link.dropdown ? 'has-dropdown' : ''}`}>
                <Link
                  to={link.to}
                  className={`header__nav-link ${location.pathname === link.to ? 'active' : ''}`}
                >
                  {link.label}
                  {link.dropdown && <ChevronDown size={14} className="dropdown-icon" />}
                </Link>
                {link.dropdown && (
                  <div className="nav-dropdown">
                    {link.dropdown.map(dropLink => (
                      <Link
                        key={dropLink.label}
                        to={dropLink.to}
                        className="dropdown-link"
                      >
                        {dropLink.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </nav>

          {/* Actions */}
          <div className="header__actions">
            <button
              className="header__action-btn header__catalogue-btn hide-mobile"
              onClick={handleDownloadCatalogue}
              aria-label="Download Catalog"
              title="Download 2026 Catalog"
            >
              <Download size={15} />
              <span className="btn-label">2026 CATALOGUE</span>
            </button>
            <button className="header__action-btn" onClick={() => setSearchOpen(true)} aria-label="Search">
              <Search size={20} />
            </button>
            <Link to="/wishlist" className="header__action-btn hide-mobile" aria-label="Wishlist">
              <Heart size={20} />
              {wishItems.length > 0 && <span className="header__badge">{wishItems.length}</span>}
            </Link>
            {user ? (
              <div className="header__user-account">
                <button
                  className="header__action-btn header__account-trigger"
                  aria-label="Account"
                  title={`Logged in as ${user.first_name}`}
                >
                  <User size={20} />
                  <span className="header__user-name hide-mobile">{user.first_name}</span>
                </button>
                {isAdmin && (
                  <Link
                    to="/admin"
                    className="header__action-btn"
                    title="Admin Dashboard"
                    style={{ background: 'var(--rich-bronze)', color: 'white', borderRadius: '4px', padding: '4px 8px', fontSize: '10px', fontWeight: 'bold' }}
                  >
                    ADMIN
                  </Link>
                )}
                <button
                  className="header__action-btn"
                  onClick={logout}
                  aria-label="Logout"
                  title="Logout"
                >
                  <LogOut size={18} />
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
                  key={link.label}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className={`mobile-nav-item ${link.dropdown ? 'has-dropdown' : ''}`}
                >
                  <Link
                    to={link.to}
                    className={`header__mobile-link ${location.pathname === link.to ? 'active' : ''}`}
                    onClick={() => { if (!link.dropdown) setMenuOpen(false); }}
                  >
                    {link.label}
                  </Link>
                  {link.dropdown && (
                    <div className="mobile-dropdown">
                      {link.dropdown.map(drop => (
                        <Link
                          key={drop.label}
                          to={drop.to}
                          className="mobile-dropdown-link"
                          onClick={() => setMenuOpen(false)}
                        >
                          {drop.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </motion.div>
              ))}

              <motion.div
                className="header__mobile-utils"
                style={{ marginTop: 'var(--space-4)', paddingTop: 'var(--space-4)', borderTop: '1px solid var(--taupe-light)' }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                <Link to="/about" className="header__mobile-link" onClick={() => setMenuOpen(false)}>About Us</Link>
                <Link to="/contact" className="header__mobile-link" onClick={() => setMenuOpen(false)}>Help & Support</Link>
                <Link to="/contact" className="header__mobile-link" onClick={() => setMenuOpen(false)}>Our Locations</Link>
              </motion.div>
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


