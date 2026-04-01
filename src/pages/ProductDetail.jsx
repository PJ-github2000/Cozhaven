import { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Minus, Plus, ChevronDown, Star, Share2, Truck, Shield, RotateCcw, Ruler, ShoppingCart, CreditCard, Calendar, MessageCircle, Check, ChevronLeft, ChevronRight, Package, Sparkles, Layers } from 'lucide-react';
import { useProduct } from '../context/ProductsContext';
import { API_BASE } from '../services/apiConfig.js';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import ProductCard from '../components/ProductCard';
import ReviewsSection from '../components/ReviewsSection';
import UrgencyIndicators from '../components/UrgencyIndicators';
import SizeGuide from '../components/SizeGuide';
import Breadcrumbs from '../components/Breadcrumbs';
import RecommendationRow from '../components/RecommendationRow';
import { discoveryApi } from '../services/discoveryApi.js';
import { CATEGORIES } from '../data/products';
import './ProductDetail.css';

export default function ProductDetail() {
  const { id } = useParams();
  const { data: product, isLoading: productLoading, error: productError } = useProduct(id);
  const { addItem } = useCart();
  const { toggle, isWished } = useWishlist();
  const { addToast } = useToast();
  const { user } = useAuth();

  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedColor, setSelectedColor] = useState(0);
  const [selectedSize, setSelectedSize] = useState(0);
  const [selectedConfiguration, setSelectedConfiguration] = useState(0);
  const [selectedMaterial, setSelectedMaterial] = useState(0);
  const [seatDepth, setSeatDepth] = useState('');
  const [firmness, setFirmness] = useState('');
  const [isCustomDimensions, setIsCustomDimensions] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [openAccordion, setOpenAccordion] = useState('description');
  const [showSizeGuide, setShowSizeGuide] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [zoomActive, setZoomActive] = useState(false);
  const [zoomPosition, setZoomPosition] = useState({ x: 50, y: 50 });
  const mainImageRef = useRef(null);
  const galleryScrollRef = useRef(null);

  // Reset state when ID changes
  useEffect(() => {
    setSelectedImage(0);
    setSelectedColor(0);
    setSelectedSize(0);
    setSelectedConfiguration(0);
    setSelectedMaterial(0);
    setSeatDepth('');
    setFirmness('');
    setIsCustomDimensions(false);
    setQuantity(1);
    window.scrollTo(0, 0);
  }, [id]);

  // Track Recently Viewed & Discovery Engagement (Phase 6)
  useEffect(() => {
    if (product) {
      // Record view in backend for personalization if user is logged in
      if (user) {
        discoveryApi.recordView(product.id).catch(err => console.debug('Discovery record failed:', err));
      }

      // Legacy local storage fallback for guest users
      const viewed = JSON.parse(localStorage.getItem('recentlyViewed') || '[]');
      const filteredViewed = viewed.filter(vid => vid !== product.id);
      const newViewed = [product.id, ...filteredViewed].slice(0, 10);
      localStorage.setItem('recentlyViewed', JSON.stringify(newViewed));
    }
  }, [id, product, user]);

  const handleMouseMove = (e) => {
    if (!mainImageRef.current) return;
    const rect = mainImageRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setZoomPosition({ x, y });
  };

  const handleAddToCart = () => {
    const selectedOptions = {
      color: selectedColor === -1 ? 'Decide Later' : (product.colorNames ? product.colorNames[selectedColor] : product.colors?.[selectedColor]),
      configuration: product.configurations?.[selectedConfiguration],
      material: product.materials?.[selectedMaterial],
      dimensions: isCustomDimensions ? 'Custom' : (product.sizes?.[selectedSize] || product.specs?.dimensions),
      seatDepth,
      firmness
    };

    addItem({
      ...product,
      quantity,
      selectedOptions
    });

    addToast(`${product.name} added to cart`, 'success');
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: product.name, url: window.location.href });
      } catch { /* user cancelled */ }
    } else {
      navigator.clipboard.writeText(window.location.href);
      addToast('Link copied to clipboard', 'info');
    }
  };

  const scrollGallery = (dir) => {
    if (!galleryScrollRef.current) return;
    const newIndex = Math.max(0, Math.min(product.images.length - 1, selectedImage + dir));
    setSelectedImage(newIndex);
  };

  if (productLoading) {
    return (
      <div className="pdp">
        <div className="container pdp__loading">
          <div className="pdp__loading-gallery">
            <div className="skeleton" style={{ width: '100%', aspectRatio: '1/1', borderRadius: '8px' }} />
            <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="skeleton" style={{ width: '72px', height: '72px', borderRadius: '4px' }} />
              ))}
            </div>
          </div>
          <div className="pdp__loading-info">
            <div className="skeleton" style={{ height: '20px', width: '40%' }} />
            <div className="skeleton" style={{ height: '44px', width: '85%', marginTop: '12px' }} />
            <div className="skeleton" style={{ height: '28px', width: '30%', marginTop: '16px' }} />
            <div className="skeleton" style={{ height: '100px', width: '100%', marginTop: '20px' }} />
            <div className="skeleton" style={{ height: '54px', width: '100%', marginTop: '24px' }} />
          </div>
        </div>
      </div>
    );
  }

  if (productError || !product) {
    return (
      <div className="container" style={{ textAlign: 'center', padding: '150px 20px' }}>
        <h2>Product not found</h2>
        <p>The piece you are looking for might have been moved or is no longer available.</p>
        <Link to="/shop" className="btn btn-primary" style={{ marginTop: '20px', display: 'inline-block' }}>
          Back to Collection
        </Link>
      </div>
    );
  }

  const jsonLd = {
    "@context": "https://schema.org/",
    "@type": "Product",
    "name": product.name,
    "image": product.images,
    "description": product.description,
    "sku": product.sku || `CH-${product.id}`,
    "brand": { "@type": "Brand", "name": "Cozhaven" },
    "offers": {
      "@type": "Offer",
      "url": window.location.href,
      "priceCurrency": "USD",
      "price": product.price,
      "availability": product.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      "itemCondition": "https://schema.org/NewCondition"
    },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": product.rating,
      "reviewCount": product.reviews
    }
  };

  const currentImage = product.images?.[selectedImage] || product.image;

  return (
    <main className="pdp">
      <Helmet>
        <title>{product.seo?.metaTitle || `${product.name} | Cozhaven — Premium Furniture`}</title>
        <meta name="description" content={product.seo?.metaDescription || product.description?.substring(0, 160)} />
        <meta property="og:title" content={product.seo?.metaTitle || product.name} />
        <meta property="og:description" content={product.seo?.metaDescription || product.description?.substring(0, 160)} />
        <meta property="og:image" content={product.image} />
        {product.seo?.canonicalUrl && <link rel="canonical" href={product.seo.canonicalUrl} />}
        <script type="application/ld+json">
          {JSON.stringify(jsonLd)}
        </script>
      </Helmet>

      <Breadcrumbs
        items={[
          { label: 'Shop', link: '/shop' },
          { label: CATEGORIES.find(c => c.id === product.category)?.name || product.category, link: `/shop?cat=${product.category}` },
          { label: product.name }
        ]}
      />

      {/* ═══ Main Product Section ═══ */}
      <div className="container pdp__layout">

        {/* ─── Gallery Column ─── */}
        <motion.div
          className="pdp__gallery"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          {/* Main Image with Zoom */}
          <div
            className={`pdp__main-image ${zoomActive ? 'pdp__main-image--zoomed' : ''}`}
            ref={mainImageRef}
            onMouseEnter={() => setZoomActive(true)}
            onMouseLeave={() => setZoomActive(false)}
            onMouseMove={handleMouseMove}
          >
            <AnimatePresence mode="wait">
              <motion.img
                key={selectedImage}
                src={currentImage}
                alt={`${product.name} - View ${selectedImage + 1}`}
                className="pdp__hero-img"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              />
            </AnimatePresence>

            {zoomActive && (
              <div
                className="pdp__zoom-lens"
                style={{
                  backgroundImage: `url(${currentImage})`,
                  backgroundPosition: `${zoomPosition.x}% ${zoomPosition.y}%`,
                }}
              />
            )}

            {/* Navigation arrows */}
            {product.images?.length > 1 && (
              <>
                <button
                  className="pdp__gallery-nav pdp__gallery-nav--prev"
                  onClick={(e) => { e.stopPropagation(); scrollGallery(-1); }}
                  disabled={selectedImage === 0}
                  aria-label="Previous image"
                >
                  <ChevronLeft size={20} />
                </button>
                <button
                  className="pdp__gallery-nav pdp__gallery-nav--next"
                  onClick={(e) => { e.stopPropagation(); scrollGallery(1); }}
                  disabled={selectedImage === product.images.length - 1}
                  aria-label="Next image"
                >
                  <ChevronRight size={20} />
                </button>
              </>
            )}

            {/* Image counter */}
            {product.images?.length > 1 && (
              <div className="pdp__image-counter">
                {selectedImage + 1} / {product.images.length}
              </div>
            )}

            {product.badge && (
              <span className={`pdp__badge pdp__badge--${product.badge}`}>
                {product.badge === 'sale' ? `-${product.salePercent}%` : product.badge}
              </span>
            )}
            {product.isCanadianMade && (
              <span className="pdp__badge pdp__badge--canadian">
                🇨🇦 Canadian Made
              </span>
            )}
          </div>

          {/* Thumbnail Strip */}
          <div className="pdp__thumbnails" ref={galleryScrollRef}>
            {product.images?.map((img, i) => (
              <button
                key={i}
                className={`pdp__thumb ${selectedImage === i ? 'active' : ''}`}
                onClick={() => setSelectedImage(i)}
                aria-label={`View image ${i + 1}`}
              >
                <img src={img} alt={`${product.name} thumbnail ${i + 1}`} />
              </button>
            ))}
          </div>
        </motion.div>

        {/* ─── Product Info Column ─── */}
        <motion.div
          className="pdp__info"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.15 }}
        >
          {/* Header */}
          <div className="pdp__header">
            <div className="pdp__meta-top">
              <div className="pdp__rating-summary">
                <div className="stars">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      size={14}
                      fill={i < Math.floor(product.rating) ? 'currentColor' : 'none'}
                      className={i < Math.floor(product.rating) ? 'star-filled' : 'star-empty'}
                    />
                  ))}
                </div>
                <a href="#reviews" className="pdp__reviews-link">
                  {product.rating} ({product.reviews} reviews)
                </a>
              </div>
              <button className="pdp__share-btn" onClick={handleShare} aria-label="Share product">
                <Share2 size={18} />
              </button>
            </div>

            <h1 className="pdp__title">{product.name}</h1>

            {product.specs?.dimensions && (
              <div className="pdp__quick-specs">
                <span className="pdp__spec-chip">
                  <Ruler size={13} />
                  {product.specs.dimensions}
                </span>
                <span className="pdp__spec-chip">
                  <Shield size={13} />
                  10-Year Warranty
                </span>
              </div>
            )}
          </div>

          {/* Price Block */}
          <div className="pdp__price-block">
            <div className="pdp__price-row">
              <span className="pdp__current-price">${product.price?.toLocaleString()}</span>
              {product.originalPrice && product.originalPrice > product.price && (
                <span className="pdp__old-price">${product.originalPrice?.toLocaleString()}</span>
              )}
              {product.originalPrice && product.originalPrice > product.price && (
                <span className="pdp__save-badge">
                  Save ${(product.originalPrice - product.price).toLocaleString()}
                </span>
              )}
            </div>
            <div className="pdp__financing-hint">
              <CreditCard size={14} />
              <span>As low as <strong>${Math.floor(product.price / 12)}/mo</strong> with PayBright / Affirm</span>
            </div>
          </div>

          <UrgencyIndicators product={product} />

          {/* Short Description */}
          <p className="pdp__short-desc">{product.description}</p>

          {/* ─── Customization Options ─── */}
          <div className="pdp__customization">
            {product.colors && (
              <div className="pdp__selector">
                <div className="pdp__selector-header">
                  <span className="pdp__selector-label">Color</span>
                  <span className="pdp__selector-value">
                    {selectedColor === -1 ? 'Decide Later' : (product.colorNames ? product.colorNames[selectedColor] : product.colors[selectedColor])}
                  </span>
                </div>
                <div className="pdp__color-grid">
                  {product.colors.map((c, i) => (
                    <button
                      key={i}
                      className={`pdp__color-option ${selectedColor === i ? 'active' : ''}`}
                      onClick={() => setSelectedColor(i)}
                      style={{ background: c }}
                      title={product.colorNames ? product.colorNames[i] : c}
                    />
                  ))}
                  <button
                    className={`pdp__color-option pdp__color-option--decide ${selectedColor === -1 ? 'active' : ''}`}
                    onClick={() => setSelectedColor(-1)}
                    title="Decide Later"
                  >
                    <span>?</span>
                  </button>
                </div>
              </div>
            )}

            {product.configurations && (
              <div className="pdp__selector">
                <div className="pdp__selector-header">
                  <span className="pdp__selector-label">Configuration</span>
                  <span className="pdp__selector-value">{product.configurations[selectedConfiguration]}</span>
                </div>
                <div className="pdp__config-grid">
                  {product.configurations.map((config, i) => (
                    <button
                      key={i}
                      className={`pdp__config-option ${selectedConfiguration === i ? 'active' : ''}`}
                      onClick={() => setSelectedConfiguration(i)}
                    >
                      {config}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {product.materials && (
              <div className="pdp__selector">
                <div className="pdp__selector-header">
                  <span className="pdp__selector-label">Material</span>
                </div>
                <div className="pdp__material-pills">
                  {product.materials.map((mat, i) => (
                    <button
                      key={i}
                      className={`pdp__material-pill ${selectedMaterial === i ? 'active' : ''}`}
                      onClick={() => setSelectedMaterial(i)}
                    >
                      {mat}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {product.sizes && !product.configurations && (
              <div className="pdp__selector">
                <div className="pdp__selector-header">
                  <span className="pdp__selector-label">Size</span>
                  <button className="pdp__size-guide-trigger" onClick={() => setShowSizeGuide(true)}>
                    <Ruler size={14} /> Size Guide
                  </button>
                </div>
                <div className="pdp__size-grid">
                  {product.sizes.map((s, i) => (
                    <button
                      key={i}
                      className={`pdp__size-option ${selectedSize === i ? 'active' : ''}`}
                      onClick={() => setSelectedSize(i)}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Seat Depth & Firmness */}
            <div className="pdp__guides">
              <div className="pdp__guide-item">
                <button className="pdp__guide-link">Seat Depth Guide</button>
                <div className="pdp__select-wrapper">
                  <select
                    className="pdp__select"
                    value={seatDepth}
                    onChange={(e) => setSeatDepth(e.target.value)}
                  >
                    <option value="" disabled>Choose Seat Depth</option>
                    <option value="standard">Standard (22")</option>
                    <option value="deep">Deep (24")</option>
                  </select>
                  <ChevronDown size={14} className="pdp__select-icon" />
                </div>
              </div>
              <div className="pdp__guide-item">
                <button className="pdp__guide-link">Firmness Guide</button>
                <div className="pdp__select-wrapper">
                  <select
                    className="pdp__select"
                    value={firmness}
                    onChange={(e) => setFirmness(e.target.value)}
                  >
                    <option value="" disabled>Choose Firmness</option>
                    <option value="soft">Soft & Cloud-like</option>
                    <option value="medium">Medium Firm</option>
                    <option value="firm">Supportive Firm</option>
                  </select>
                  <ChevronDown size={14} className="pdp__select-icon" />
                </div>
              </div>
            </div>

            {/* Custom Dimensions Toggle */}
            <div className="pdp__toggle-row">
              <div className="pdp__toggle-wrapper">
                <label className="pdp__toggle">
                  <input
                    type="checkbox"
                    checked={isCustomDimensions}
                    onChange={(e) => setIsCustomDimensions(e.target.checked)}
                  />
                  <span className="pdp__toggle-slider"></span>
                </label>
                <span className="pdp__toggle-label">Switch To Custom Dimensions</span>
              </div>
              {isCustomDimensions && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="pdp__custom-dims"
                >
                  <div className="pdp__dims-grid">
                    <div className="pdp__dim-field">
                      <label>Width (in)</label>
                      <input type="number" placeholder="84" />
                    </div>
                    <div className="pdp__dim-field">
                      <label>Depth (in)</label>
                      <input type="number" placeholder="38" />
                    </div>
                    <div className="pdp__dim-field">
                      <label>Height (in)</label>
                      <input type="number" placeholder="34" />
                    </div>
                  </div>
                  <p className="pdp__dim-note">* Custom dimensions may add 2-4 weeks to delivery time.</p>
                </motion.div>
              )}
            </div>

            {product.isCanadianMade && (
              <div className="pdp__delivery-estimate">
                <Truck size={16} />
                <span>Estimated Delivery: <strong>{new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} – {new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</strong></span>
              </div>
            )}
          </div>

          {/* ─── Purchase Actions ─── */}
          <div className="pdp__purchase-box">
            <div className="pdp__qty-selector">
              <button onClick={() => setQuantity(Math.max(1, quantity - 1))} aria-label="Decrease quantity"><Minus size={14} /></button>
              <input type="number" value={quantity} readOnly aria-label="Quantity" />
              <button onClick={() => setQuantity(quantity + 1)} aria-label="Increase quantity"><Plus size={14} /></button>
            </div>
            <button className="pdp__add-to-cart-btn" onClick={handleAddToCart}>
              <ShoppingCart size={18} />
              Add to Cart — ${(product.price * quantity).toLocaleString()}
            </button>
            <button
              className={`pdp__wishlist-btn ${isWished(product.id) ? 'active' : ''}`}
              onClick={() => { toggle(product); addToast(isWished(product.id) ? 'Removed' : 'Added to Wishlist', 'info'); }}
              aria-label={isWished(product.id) ? 'Remove from wishlist' : 'Add to wishlist'}
            >
              <Heart size={20} fill={isWished(product.id) ? 'currentColor' : 'none'} />
            </button>
          </div>

          {/* Secondary Actions */}
          <div className="pdp__secondary-btns">
            <button className="pdp__secondary-btn" onClick={() => window.open('https://calendly.com', '_blank')}>
              <Calendar size={18} /> Book Showroom Appointment
            </button>
            <button className="pdp__secondary-btn" onClick={() => window.open('https://wa.me/16475552699', '_blank')}>
              <MessageCircle size={18} /> Ask a Design Expert
            </button>
          </div>

          {/* ─── Trust Signals ─── */}
          <div className="pdp__trust-bar">
            <div className="pdp__trust-item">
              <Truck size={20} />
              <div>
                <strong>Free Delivery</strong>
                <span>On orders over $1,500</span>
              </div>
            </div>
            <div className="pdp__trust-item">
              <RotateCcw size={20} />
              <div>
                <strong>30-Day Returns</strong>
                <span>Hassle-free guarantee</span>
              </div>
            </div>
            <div className="pdp__trust-item">
              <Shield size={20} />
              <div>
                <strong>10-Year Warranty</strong>
                <span>Crafted to last</span>
              </div>
            </div>
          </div>

          {/* ─── Accordion Details ─── */}
          <div className="pdp__accordion">
            {[
              { id: 'details', title: 'Product Details', content: product.description },
              { id: 'materials', title: 'Materials & Origin', content: 'Crafted with sustainably sourced Canadian hardwood and premium upholstery fabrics. Every stitch is a testament to our commitment to quality.' },
              { id: 'dimensions', title: 'Specifications', content: product.specs ? Object.entries(product.specs).map(([k, v]) => `${k.charAt(0).toUpperCase() + k.slice(1)}: ${v}`).join('\n') : 'Contact us for detailed specifications.' },
              { id: 'shipping', title: 'Shipping & Delivery', content: 'Free white-glove delivery on orders over $1,500. Standard delivery takes 5-10 business days. Express delivery available for select areas.' },
            ].map(item => (
              <div key={item.id} className={`pdp__acc-item ${openAccordion === item.id ? 'open' : ''}`}>
                <button
                  className="pdp__acc-header"
                  onClick={() => setOpenAccordion(openAccordion === item.id ? '' : item.id)}
                  aria-expanded={openAccordion === item.id}
                >
                  {item.title}
                  <ChevronDown size={16} />
                </button>
                <div className="pdp__acc-content">
                  <div className="pdp__acc-inner">{item.content}</div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* ═══ Feature Highlights Section ═══ */}
      <section className="pdp__features">
        <div className="container">
          <div className="pdp__features-header">
            <motion.span
              className="pdp__features-eyebrow"
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              Make Your Life Easier
            </motion.span>
            <motion.h2
              className="pdp__features-title"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
            >
              Designed for How You Actually Live
            </motion.h2>
          </div>
          <div className="pdp__features-grid">
            <motion.div
              className="pdp__feature-card"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
            >
              <div className="pdp__feature-icon">
                <Sparkles size={28} />
              </div>
              <h3>Premium Materials</h3>
              <p>Every surface is crafted from the finest materials – from kiln-dried hardwood frames to hand-finished upholstery that ages beautifully.</p>
            </motion.div>
            <motion.div
              className="pdp__feature-card"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
            >
              <div className="pdp__feature-icon">
                <Layers size={28} />
              </div>
              <h3>Multi-Layer Comfort</h3>
              <p>High-resilience foam core wrapped in goose-down blend cushioning provides the perfect balance of support and cloud-like softness.</p>
            </motion.div>
            <motion.div
              className="pdp__feature-card"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
            >
              <div className="pdp__feature-icon">
                <Package size={28} />
              </div>
              <h3>Easy Assembly</h3>
              <p>Pre-assembled modules with intuitive connectors. Set up your dream space in under 30 minutes, no tools required.</p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ═══ Editorial Story Section ═══ */}
      <section className="pdp__story">
        <div className="container">
          <div className="pdp__story-grid">
            <motion.div
              className="pdp__story-content"
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
            >
              <span className="pdp__story-eyebrow">Craftsmanship</span>
              <h2 className="pdp__story-title">Design Meets Durability</h2>
              <p className="pdp__story-text">
                Every piece is a testament to our commitment to excellence. We combine traditional woodworking techniques with modern ergonomics to create furniture that doesn't just fill a space, but defines it.
              </p>
              <div className="pdp__story-stats">
                <div className="pdp__stat">
                  <strong>48h</strong>
                  <span>Fast Assembly</span>
                </div>
                <div className="pdp__stat">
                  <strong>100%</strong>
                  <span>Solid Wood</span>
                </div>
                <div className="pdp__stat">
                  <strong>0%</strong>
                  <span>Toxins</span>
                </div>
              </div>
            </motion.div>
            <motion.div
              className="pdp__story-image"
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: 0.2 }}
            >
              <img
                src={product.images?.[product.images.length > 1 ? 1 : 0] || product.image}
                alt="Craftsmanship detail"
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* ═══ Checklist Section ("Ready for Your Real Life" style) ═══ */}
      <section className="pdp__checklist">
        <div className="container">
          <motion.h2
            className="pdp__checklist-title"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            Ready for Your Real Life
          </motion.h2>
          <div className="pdp__checklist-grid">
            {[
              { text: 'Modern minimalist design suits clean, tidy spaces' },
              { text: 'Complements diverse modern decor styles effortlessly' },
              { text: 'Pet-friendly and kid-proof performance fabrics' },
              { text: 'Pre-assembled modules – no tools required' },
              { text: 'Stain-resistant, easy-to-clean surfaces' },
              { text: 'Engineered for everyday durability and comfort' },
            ].map((item, i) => (
              <motion.div
                key={i}
                className="pdp__checklist-item"
                initial={{ opacity: 0, x: -10 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
              >
                <Check size={18} className="pdp__check-icon" />
                <span>{item.text}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ Reviews ═══ */}
      <div id="reviews">
        <ReviewsSection productId={product.id} />
      </div>

      {/* Phase 6: Discovery Sections */}
      <RecommendationRow type="related" productId={product.id} title="Complete the Look" />
      <RecommendationRow type="trending" title="Global Bestsellers" />
      {user && <RecommendationRow type="recent" title="Pick up where you left off" />}

      {showSizeGuide && <SizeGuide onClose={() => setShowSizeGuide(false)} />}
    </main>
  );
}
