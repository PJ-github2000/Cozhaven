import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Heart, Minus, Plus, ChevronDown, Star, ArrowLeft, Share2, Truck, Shield, RotateCcw, Lock, Ruler } from 'lucide-react';
import PRODUCTS from '../data/products';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useToast } from '../context/ToastContext';
import ProductCard from '../components/ProductCard';
import ReviewsSection from '../components/ReviewsSection';
import TrustBadges from '../components/TrustBadges';
import SizeGuide from '../components/SizeGuide';
import UrgencyIndicators from '../components/UrgencyIndicators';
import './ProductDetail.css';

export default function ProductDetail() {
  const { id } = useParams();
  const product = PRODUCTS.find(p => p.id === Number(id));
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedColor, setSelectedColor] = useState(0);
  const [selectedSize, setSelectedSize] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [openAccordion, setOpenAccordion] = useState('description');
  const [showSizeGuide, setShowSizeGuide] = useState(false);
  const { addItem } = useCart();
  const { toggle, isWished } = useWishlist();
  const { addToast } = useToast();

  if (!product) return <div className="container section-padding" style={{ paddingTop: '150px', textAlign: 'center' }}><h2>Product not found</h2><Link to="/shop" className="btn btn-primary" style={{ marginTop: '24px' }}>Back to Shop</Link></div>;

  const related = PRODUCTS.filter(p => p.category === product.category && p.id !== product.id).slice(0, 5);

  const handleAddToCart = () => {
    addItem(product, product.colors?.[selectedColor], product.sizes?.[selectedSize], quantity);
    addToast(`${product.name} added to cart!`, 'success');
  };

  return (
    <main className="pdp">
      {/* Breadcrumb */}
      <div className="container pdp__breadcrumb">
        <Link to="/shop"><ArrowLeft size={16} /> Back to Shop</Link>
      </div>

      {/* Product Layout */}
      <div className="container pdp__layout">
        {/* Left — Gallery */}
        <motion.div className="pdp__gallery" initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}>
          <div className="pdp__main-image">
            <img src={product.images[selectedImage]} alt={product.name} />
            {product.badge && <span className={`badge badge-${product.badge === 'last' ? 'last' : product.badge}`}>{product.badge === 'sale' ? `-${product.salePercent}%` : product.badge === 'new' ? 'New' : 'Last Stock'}</span>}
          </div>
          {product.images.length > 1 && (
            <div className="pdp__thumbnails">
              {product.images.map((img, i) => (
                <button key={i} className={`pdp__thumb ${selectedImage === i ? 'active' : ''}`} onClick={() => setSelectedImage(i)}>
                  <img src={img} alt={`${product.name} view ${i + 1}`} />
                </button>
              ))}
            </div>
          )}
        </motion.div>

        {/* Right — Info */}
        <motion.div className="pdp__info" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.1 }}>
          <div className="pdp__rating">
            <div className="stars">{Array.from({ length: 5 }).map((_, i) => <Star key={i} size={14} fill={i < Math.floor(product.rating) ? 'currentColor' : 'none'} className={i < Math.floor(product.rating) ? 'star' : 'star-empty'} />)}</div>
            <span>{product.rating} ({product.reviews} reviews)</span>
          </div>

          <h1 className="pdp__name">{product.name}</h1>

          <div className="pdp__price">
            {product.originalPrice && <span className="pdp__original">${product.originalPrice.toLocaleString()}</span>}
            <span className={product.originalPrice ? 'pdp__sale-price' : ''}>${product.price.toLocaleString()}</span>
            {product.salePercent && <span className="badge badge-sale">Save {product.salePercent}%</span>}
          </div>

          {/* Urgency Indicators */}
          <UrgencyIndicators product={product} />

          {/* Colors */}
          {product.colors && (
            <div className="pdp__option">
              <label>Color</label>
              <div className="pdp__colors">
                {product.colors.map((c, i) => (
                  <button key={i} className={`pdp__color-btn ${selectedColor === i ? 'active' : ''}`} onClick={() => setSelectedColor(i)} style={{ background: c }} aria-label={`Color ${i + 1}`} />
                ))}
              </div>
            </div>
          )}

          {/* Sizes */}
          {product.sizes && (
            <div className="pdp__option">
              <label>Size</label>
              <div className="pdp__sizes">
                {product.sizes.map((s, i) => (
                  <button key={i} className={`pdp__size-btn ${selectedSize === i ? 'active' : ''}`} onClick={() => setSelectedSize(i)}>{s}</button>
                ))}
              </div>
              <button className="size-guide-link" onClick={() => setShowSizeGuide(true)}>
                <Ruler size={14} /> Size Guide
              </button>
            </div>
          )}

          {/* Quantity + Add to Cart */}
          <div className="pdp__actions">
            <div className="pdp__quantity">
              <button onClick={() => setQuantity(Math.max(1, quantity - 1))}><Minus size={16} /></button>
              <span>{quantity}</span>
              <button onClick={() => setQuantity(quantity + 1)}><Plus size={16} /></button>
            </div>
            <button className="btn btn-primary btn-large pdp__add-btn" onClick={handleAddToCart}>Add to Cart — ${(product.price * quantity).toLocaleString()}</button>
            <button className={`pdp__wish-btn ${isWished(product.id) ? 'active' : ''}`} onClick={() => { toggle(product); addToast(isWished(product.id) ? 'Removed from wishlist' : 'Added to wishlist ♥', 'info'); }}>
              <Heart size={20} fill={isWished(product.id) ? 'currentColor' : 'none'} />
            </button>
          </div>

          {/* Trust Badges */}
          <TrustBadges />

          {/* Accordions */}
          <div className="pdp__accordions">
            {[
              { key: 'description', title: 'Description', content: product.description },
              { key: 'specs', title: 'Specifications', content: product.specs ? Object.entries(product.specs).map(([k, v]) => `${k.charAt(0).toUpperCase() + k.slice(1)}: ${v}`).join('\n') : 'N/A' },
              { key: 'shipping', title: 'Shipping & Returns', content: 'Free standard shipping on orders over $999. Express shipping available. 30-day hassle-free return policy. Items must be in original condition.' },
            ].map(acc => (
              <div key={acc.key} className={`pdp__accordion ${openAccordion === acc.key ? 'open' : ''}`}>
                <button className="pdp__accordion-header" onClick={() => setOpenAccordion(openAccordion === acc.key ? '' : acc.key)}>
                  <span>{acc.title}</span>
                  <ChevronDown size={18} />
                </button>
                <div className="pdp__accordion-body">
                  <p style={{ whiteSpace: 'pre-line' }}>{acc.content}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Customer Reviews */}
          <ReviewsSection productId={product.id} />
        </motion.div>
      </div>

      {/* Related Products */}
      {related.length > 0 && (
        <section className="pdp__related section-padding" style={{ background: 'var(--soft-cream)' }}>
          <div className="container">
            <h2 className="section-title" style={{ marginBottom: 'var(--space-6)' }}>You May Also Like</h2>
            <div className="pdp__related-grid">
              {related.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
            </div>
          </div>
        </section>
      )}

      {/* Size Guide Modal */}
      {showSizeGuide && <SizeGuide onClose={() => setShowSizeGuide(false)} />}
    </main>
  );
}
