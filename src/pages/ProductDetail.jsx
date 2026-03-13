import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Heart, Minus, Plus, ChevronDown, Star, ArrowLeft, Share2, Truck, Shield, RotateCcw, Lock, Ruler, ShoppingCart, CreditCard } from 'lucide-react';
import { useProducts } from '../context/ProductsContext';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useToast } from '../context/ToastContext';
import ProductCard from '../components/ProductCard';
import ReviewsSection from '../components/ReviewsSection';
import UrgencyIndicators from '../components/UrgencyIndicators';
import './ProductDetail.css';

export default function ProductDetail() {
  const { id } = useParams();
  const { products, loading } = useProducts();
  const product = products.find(p => p.id === Number(id));
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedColor, setSelectedColor] = useState(0);
  const [selectedSize, setSelectedSize] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [openAccordion, setOpenAccordion] = useState('description');
  const [showSizeGuide, setShowSizeGuide] = useState(false);
  const { addItem } = useCart();
  const { toggle, isWished } = useWishlist();
  const { addToast } = useToast();

  if (loading) return null;
  if (!product) return <div className="container section-padding" style={{ paddingTop: '150px', textAlign: 'center' }}><h2>Product not found</h2><Link to="/shop" className="btn btn-primary" style={{ marginTop: '24px' }}>Back to Shop</Link></div>;

  const related = products.filter(p => p.category === product.category && p.id !== product.id).slice(0, 5);

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
            <button className="btn btn-primary btn-large pdp__add-btn" onClick={handleAddToCart}>
              <ShoppingCart size={18} style={{ marginRight: '8px' }} /> Add to Cart — ${(product.price * quantity).toLocaleString()}
            </button>
            <button className={`pdp__wish-btn ${isWished(product.id) ? 'active' : ''}`} onClick={() => { toggle(product); addToast(isWished(product.id) ? 'Removed from wishlist' : 'Added to wishlist ♥', 'info'); }}>
              <Heart size={20} fill={isWished(product.id) ? 'currentColor' : 'none'} />
            </button>
          </div>

          {/* Mobile sticky bar (visible on small screens via CSS) */}
          <div className="pdp__sticky-bar">
            <div className="pdp__sticky-info">
              <span className="pdp__sticky-name">{product.name}</span>
              <span className="pdp__sticky-price">${(product.price * quantity).toLocaleString()}</span>
            </div>
            <button
              className="btn btn-primary btn-small pdp__sticky-btn"
              onClick={handleAddToCart}
            >
              Add to Cart
            </button>
          </div>

          {/* Minimal Trust Badges for Atunus Style */}
          <div className="pdp__trust">
            <div><RotateCcw size={20} /><span>30-Day Return</span></div>
            <div><CreditCard size={20} /><span>Financing Made Easy</span></div>
            <div><Truck size={20} /><span>Free Shipping</span></div>
            <div><Shield size={20} /><span>10-Year Warranty</span></div>
          </div>

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

      {/* Detailed Features Section — Atunus Style */}
      <section className="pdp__features">
        <div className="container">
          {[
            {
              title: "Spacious & Deep Seating",
              desc: "Designed for ultimate lounging, the deep cushions provide a perfect sanctuary for relaxation after a long day.",
              img: "https://images.unsplash.com/photo-1550254478-ead40cc54513?w=1200&q=80"
            },
            {
              title: "Premium Fabric Texture",
              desc: "Our carefully selected upholstery offers a soft touch and exceptional durability, ensuring your furniture looks new for years.",
              img: "https://images.unsplash.com/photo-1583847268964-b28dc2f51ac9?w=1200&q=80"
            },
            {
              title: "Structural Integrity",
              desc: "Built with a kiln-dried hardwood frame and reinforced joints, providing the stability and longevity you deserve.",
              img: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=1200&q=80"
            }
          ].map((feat, i) => (
            <div key={i} className={`pdp__feature-block ${i % 2 !== 0 ? 'reverse' : ''}`}>
              <div className="pdp__feature-text">
                <h3 className="pdp__feature-title">{feat.title}</h3>
                <p>{feat.desc}</p>
              </div>
              <div className="pdp__feature-image">
                <img src={feat.img} alt={feat.title} loading="lazy" />
              </div>
            </div>
          ))}
        </div>
      </section>

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
