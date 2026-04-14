import { BrowserRouter, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { ArrowUp } from 'lucide-react';
import Lenis from 'lenis';
import 'lenis/dist/lenis.css';

// Context Providers
import { CartProvider } from './context/CartContext';
import { WishlistProvider } from './context/WishlistContext';
import { ToastProvider } from './context/ToastContext';
import { AuthProvider } from './context/AuthContext';
import { ProductsProvider } from './context/ProductsContext';
import { HelmetProvider } from 'react-helmet-async';

// Components
import Header from './components/Header';
import Footer from './components/Footer';
import FloatingActions from './components/FloatingActions';
import ScrollToTop from './components/ScrollToTop';
import TradePopup from './components/TradePopup';
import ErrorBoundary from './components/ErrorBoundary';

// Routes
import AppRoutes from './routes/AppRoutes';

export default function App() {
  return (
    <HelmetProvider>
      <BrowserRouter>
        <AuthProvider>
          <ProductsProvider>
            <CartProvider>
              <WishlistProvider>
                <ToastProvider>
                  <AppContent />
                </ToastProvider>
              </WishlistProvider>
            </CartProvider>
          </ProductsProvider>
        </AuthProvider>
      </BrowserRouter>
    </HelmetProvider>
  );
}

function AppContent() {
  const location = useLocation();
  const isTransparentPage = location.pathname === '/' || location.pathname === '/about' || location.pathname.startsWith('/collections/');

  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 1,
      smoothTouch: false,
      touchMultiplier: 2,
      infinite: false,
    });

    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);

    return () => {
      lenis.destroy();
    };
  }, []);

  return (
    <>
      <a href="#main-content" className="skip-to-content">Skip to content</a>
      <ScrollProgress />
      <Header />
      <ScrollToTop />
      <TradePopup />
      
      <main id="main-content" className={(!isTransparentPage) ? 'main-content--with-header' : ''}>
        <ErrorBoundary>
          <AppRoutes />
        </ErrorBoundary>
      </main>

      <Footer />
      <FloatingActions />
      <BackToTop />
    </>
  );
}

function ScrollProgress() {
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    let ticking = false;
    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const scrollTop = window.scrollY;
          const docHeight = document.documentElement.scrollHeight - window.innerHeight;
          setProgress(docHeight > 0 ? (scrollTop / docHeight) * 100 : 0);
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  return <div id="scroll-progress" style={{ width: `${progress}%` }} />;
}

function BackToTop() {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    let ticking = false;
    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          setVisible(window.scrollY > 400);
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  if (!visible) return null;

  return (
    <button
      className="back-to-top"
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      aria-label="Back to top"
    >
      <ArrowUp size={20} />
    </button>
  );
}
