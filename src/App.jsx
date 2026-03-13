import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import { WishlistProvider } from './context/WishlistContext';
import { ToastProvider } from './context/ToastContext';
import { AuthProvider } from './context/AuthContext';
import Header from './components/Header';
import Footer from './components/Footer';
import ScrollToTop from './components/ScrollToTop';
import Breadcrumbs from './components/Breadcrumbs';
import { useEffect, useState, lazy } from 'react';
import { ArrowUp } from 'lucide-react';

// Lazy-loaded pages for code splitting - commented out for testing
// const Home = lazy(() => import('./pages/Home'));
// const Shop = lazy(() => import('./pages/Shop'));
// const ProductDetail = lazy(() => import('./pages/ProductDetail'));
// const About = lazy(() => import('./pages/About'));
// const Blog = lazy(() => import('./pages/Blog'));
// const Contact = lazy(() => import('./pages/Contact'));
// const Wishlist = lazy(() => import('./pages/Wishlist'));
// const Checkout = lazy(() => import('./pages/Checkout'));
// const OrderSuccess = lazy(() => import('./pages/OrderSuccess'));
// const ShippingReturns = lazy(() => import('./pages/ShippingReturns'));
// const FAQ = lazy(() => import('./pages/FAQ'));
// const PrivacyPolicy = lazy(() => import('./pages/PrivacyPolicy'));
// const TermsOfService = lazy(() => import('./pages/TermsOfService'));

import Home from './pages/Home';
import Shop from './pages/Shop';
import ProductDetail from './pages/ProductDetail';
import About from './pages/About';
import Blog from './pages/Blog';
import Contact from './pages/Contact';
import Wishlist from './pages/Wishlist';
import Checkout from './pages/Checkout';
import OrderSuccess from './pages/OrderSuccess';
import ShippingReturns from './pages/ShippingReturns';
import FAQ from './pages/FAQ';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsOfService from './pages/TermsOfService';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <WishlistProvider>
            <ToastProvider>
              <a href="#main-content" className="skip-to-content">Skip to content</a>
              <ScrollProgress />
              <Header />
              <Breadcrumbs />
              <ScrollToTop />
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/shop" element={<Shop />} />
                <Route path="/products/:id" element={<ProductDetail />} />
                <Route path="/about" element={<About />} />
                <Route path="/blog" element={<Blog />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/wishlist" element={<Wishlist />} />
                <Route path="/checkout" element={<Checkout />} />
                <Route path="/checkout/success" element={<OrderSuccess />} />
                <Route path="/shipping-returns" element={<ShippingReturns />} />
                <Route path="/faq" element={<FAQ />} />
                <Route path="/privacy" element={<PrivacyPolicy />} />
                <Route path="/terms" element={<TermsOfService />} />
              </Routes>
              <Footer />
              <BackToTop />
            </ToastProvider>
          </WishlistProvider>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

function ScrollProgress() {
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    const onScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(docHeight > 0 ? (scrollTop / docHeight) * 100 : 0);
    };
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  return <div id="scroll-progress" style={{ width: `${progress}%` }} />;
}

function BackToTop() {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 400);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  if (!visible) return null;

  return (
    <button
      className="back-to-top"
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      aria-label="Back to top"
      style={{
        position: 'fixed',
        bottom: '2rem',
        right: '2rem',
        width: 48,
        height: 48,
        borderRadius: '50%',
        background: 'var(--deep-charcoal)',
        color: 'var(--warm-white)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: 'var(--shadow-lg)',
        zIndex: 100,
        transition: 'all 0.3s',
        cursor: 'pointer',
        border: 'none',
      }}
    >
      <ArrowUp size={20} />
    </button>
  );
}
