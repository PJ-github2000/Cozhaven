import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import { WishlistProvider } from './context/WishlistContext';
import { ToastProvider } from './context/ToastContext';
import { AuthProvider } from './context/AuthContext';
import { ProductsProvider } from './context/ProductsContext';
import { HelmetProvider } from 'react-helmet-async';
import Header from './components/Header';
import Footer from './components/Footer';
import FloatingActions from './components/FloatingActions';
import ScrollToTop from './components/ScrollToTop';
import TradePopup from './components/TradePopup';
import CataloguePopup from './components/CataloguePopup';
import { useEffect, useState, lazy, Suspense } from 'react';
import { ArrowUp } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import ErrorBoundary from './components/ErrorBoundary';
import Lenis from 'lenis';
import 'lenis/dist/lenis.css';

// Lazy-loaded pages for code splitting
const Home = lazy(() => import('./pages/Home'));
const Shop = lazy(() => import('./pages/Shop'));
const ProductDetail = lazy(() => import('./pages/ProductDetail'));
const CollectionDetail = lazy(() => import('./pages/CollectionDetail'));
const DynamicPage = lazy(() => import('./pages/DynamicPage'));
const TradeProgram = lazy(() => import('./pages/TradeProgram'));
const About = lazy(() => import('./pages/About'));
const Blog = lazy(() => import('./pages/Blog'));
const Contact = lazy(() => import('./pages/Contact'));
const Wishlist = lazy(() => import('./pages/Wishlist'));
const Checkout = lazy(() => import('./pages/Checkout'));
const OrderSuccess = lazy(() => import('./pages/OrderSuccess'));
const ShippingReturns = lazy(() => import('./pages/ShippingReturns'));
const FAQ = lazy(() => import('./pages/FAQ'));
const PrivacyPolicy = lazy(() => import('./pages/PrivacyPolicy'));
const TermsOfService = lazy(() => import('./pages/TermsOfService'));

// Inspiration & Discovery
const Inspiration = lazy(() => import('./pages/Inspiration'));
const InspirationDetail = lazy(() => import('./pages/InspirationDetail'));

// Admin Pages (also lazy-loaded)
const AdminLayout = lazy(() => import('./components/admin/AdminLayout'));
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const ProductManager = lazy(() => import('./pages/admin/ProductManager'));
const InventoryWorkbench = lazy(() => import('./pages/admin/InventoryWorkbench'));
const PromotionsManager = lazy(() => import('./pages/admin/PromotionsManager'));
const ApprovalsManager = lazy(() => import('./pages/admin/ApprovalsManager'));
const OrderManager = lazy(() => import('./pages/admin/OrderManager'));
const CustomerManager = lazy(() => import('./pages/admin/CustomerManager'));
const SalesAnalytics = lazy(() => import('./pages/admin/SalesAnalytics'));
const UserManager = lazy(() => import('./pages/admin/UserManager'));
const PageManager = lazy(() => import('./pages/admin/PageManager'));
const BlogManager = lazy(() => import('./pages/admin/BlogManager'));
const CampaignManager = lazy(() => import('./pages/admin/CampaignManager'));
const PriceListManager = lazy(() => import('./pages/admin/PriceListManager'));
const ImportedCollectionPage = lazy(() => import('./pages/ImportedCollectionPage'));
const LocalCollectionPage = lazy(() => import('./pages/LocalCollectionPage'));
const DesignerSeries = lazy(() => import('./pages/DesignerSeries'));
const NotFound = lazy(() => import('./pages/NotFound'));

function PageLoader() {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      minHeight: '60vh', color: 'var(--charcoal-muted)'
    }}>
      <div className="processing-spinner" style={{ width: 32, height: 32 }} />
    </div>
  );
}

import { Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

function ProtectedRoute({ children, allowedRoles = [] }) {
  const { user, loading, isAuthenticated } = useAuth();

  if (loading) return <PageLoader />;
  if (!isAuthenticated) return <Navigate to="/" replace />;

  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
}

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
  const isAdmin = location.pathname.startsWith('/admin');

  useEffect(() => {
    if (isAdmin) return; // Disable Lenis on admin pages

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
  }, [isAdmin]);

  return (
    <>
      <a href="#main-content" className="skip-to-content">Skip to content</a>
      <ScrollProgress />
      {!isAdmin && <Header />}
      <ScrollToTop />
      {!isAdmin && <TradePopup />}
      <ErrorBoundary>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/shop" element={<Shop />} />
            <Route path="/trade-program" element={<TradeProgram />} />
            <Route path="/pages/:slug" element={<DynamicPage />} />
            <Route path="/collections/:slug" element={<CollectionDetail />} />
            <Route path="/inspiration" element={<Inspiration />} />
            <Route path="/inspiration/:slug" element={<InspirationDetail />} />
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
            <Route path="/imported-collection" element={<ImportedCollectionPage />} />
            <Route path="/local-collection" element={<LocalCollectionPage />} />
            <Route path="/designer-series" element={<DesignerSeries />} />

            {/* Admin Routes */}
            <Route path="/admin" element={
              <ProtectedRoute allowedRoles={['admin', 'manager', 'viewer']}>
                <AdminLayout />
              </ProtectedRoute>
            }>
              <Route index element={<AdminDashboard />} />
              <Route path="products" element={<ProductManager />} />
              <Route path="inventory" element={<InventoryWorkbench />} />
              <Route path="promotions" element={<PromotionsManager />} />
              <Route path="approvals" element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <ApprovalsManager />
                </ProtectedRoute>
              } />
              <Route path="orders" element={<OrderManager />} />
              <Route path="customers" element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <CustomerManager />
                </ProtectedRoute>
              } />
              <Route path="users" element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <UserManager />
                </ProtectedRoute>
              } />
              <Route path="analytics" element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <SalesAnalytics />
                </ProtectedRoute>
              } />
              
              <Route path="cms/pages" element={<PageManager />} />
              <Route path="cms/blog" element={<BlogManager />} />

              {/* Merchandising Routes */}
              <Route path="merchandising/campaigns" element={<CampaignManager />} />
              <Route path="merchandising/price-lists" element={<PriceListManager />} />

              <Route path="settings" element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <div className="admin-placeholder">Settings Coming Soon</div>
                </ProtectedRoute>
              } />
            </Route>

            {/* 404 Catch-all */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </ErrorBoundary>
      {!isAdmin && <Footer />}
      {!isAdmin && <FloatingActions />}
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
