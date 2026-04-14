import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';

// Page Loader Component
const PageLoader = () => (
  <div style={{
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    minHeight: '60vh', color: 'var(--charcoal-muted)'
  }}>
    <div className="processing-spinner" style={{ width: 32, height: 32 }} />
  </div>
);



// Lazy-loaded Pages
const Home = lazy(() => import('../pages/Home'));
const Shop = lazy(() => import('../pages/Shop'));
const ProductDetail = lazy(() => import('../pages/ProductDetail'));
const CollectionDetail = lazy(() => import('../pages/CollectionDetail'));
const DynamicPage = lazy(() => import('../pages/DynamicPage'));
const TradeProgram = lazy(() => import('../pages/TradeProgram'));
const About = lazy(() => import('../pages/About'));
const Blog = lazy(() => import('../pages/Blog'));
const Contact = lazy(() => import('../pages/Contact'));
const Wishlist = lazy(() => import('../pages/Wishlist'));
const Checkout = lazy(() => import('../pages/Checkout'));
const OrderSuccess = lazy(() => import('../pages/OrderSuccess'));
const ShippingReturns = lazy(() => import('../pages/ShippingReturns'));
const FAQ = lazy(() => import('../pages/FAQ'));
const PrivacyPolicy = lazy(() => import('../pages/PrivacyPolicy'));
const TermsOfService = lazy(() => import('../pages/TermsOfService'));
const Inspiration = lazy(() => import('../pages/Inspiration'));
const InspirationDetail = lazy(() => import('../pages/InspirationDetail'));
const ImportedCollectionPage = lazy(() => import('../pages/ImportedCollectionPage'));
const LocalCollectionPage = lazy(() => import('../pages/LocalCollectionPage'));
const DesignerSeries = lazy(() => import('../pages/DesignerSeries'));
const NotFound = lazy(() => import('../pages/NotFound'));
const LoginPage = lazy(() => import('../pages/LoginPage'));
const SignupPage = lazy(() => import('../pages/SignupPage'));

const AppRoutes = () => {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/shop" element={<Shop />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/trade-program" element={<TradeProgram />} />
        <Route path="/pages/:slug" element={<DynamicPage />} />
        <Route path="/collections/:slug" element={<CollectionDetail />} />
        <Route path="/inspiration" element={<Inspiration />} />
        <Route path="/inspiration/:slug" element={<InspirationDetail />} />
        <Route path="/products/:id" element={<ProductDetail />} />
        <Route path="/product/:id" element={<ProductDetail />} />
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

        {/* 404 Catch-all */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
};

export default AppRoutes;
