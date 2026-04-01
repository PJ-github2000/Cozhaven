import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Heart, Eye, Star, ShoppingCart } from 'lucide-react';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import Magnetic from './Magnetic';
import './ProductCard.css';

export default function ProductCard({ product, index = 0 }) {
  const [imgLoaded, setImgLoaded] = useState(false);
  const [selectedColor, setSelectedColor] = useState(0);
  const { toggle, isWished } = useWishlist();
  const { addItem } = useCart();
  const { addToast } = useToast();

  const handleQuickAdd = (e) => {
    e.preventDefault();
    e.stopPropagation();
    addItem(product, product.colors?.[selectedColor] || product.colors?.[0], product.sizes?.[0], 1);
    addToast(`${product.name} added to cart!`, 'success');
  };

  const productPath = `/products/${product.slug || product.id}`;

  return (
    <motion.div
      className="product-card"
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.1 }}
      transition={{ duration: 0.5, delay: index * 0.08 }}
    >
      <div className="product-card__image-wrap">
        {!imgLoaded && <div className="skeleton skeleton-image" />}
        <img
          src={product.images?.[selectedColor] || product.images?.[0] || product.image}
          alt={product.name}
          className="product-card__img-primary"
          loading="lazy"
          onLoad={() => setImgLoaded(true)}
          style={{ opacity: imgLoaded ? 1 : 0 }}
        />
        {product.images?.[1] && (
          <img
            src={product.images[1]}
            alt={`${product.name} alternate view`}
            className="product-card__img-secondary"
            loading="lazy"
          />
        )}
        <div className="product-card__overlay">
          <Magnetic>
            <Link to={productPath} className="product-card__quickview" aria-label={`Quick view of ${product.name}`}>
              <Eye size={18} aria-hidden="true" /> Quick View
            </Link>
          </Magnetic>
          <Magnetic>
            <button
              className="product-card__add-to-cart"
              onClick={handleQuickAdd}
              aria-label={`Add ${product.name} to cart`}
            >
              <ShoppingCart size={16} aria-hidden="true" /> Add to Cart
            </button>
          </Magnetic>
        </div>
        <div className="product-card__wishlist-wrapper">
          <Magnetic>
            <button
              className={`product-card__wishlist ${isWished(product.id) ? 'active' : ''}`}
              onClick={(e) => { e.preventDefault(); toggle(product); }}
              aria-label={isWished(product.id) ? `Remove ${product.name} from wishlist` : `Add ${product.name} to wishlist`}
            >
              <Heart size={18} fill={isWished(product.id) ? 'currentColor' : 'none'} aria-hidden="true" />
            </button>
          </Magnetic>
        </div>
        {product.isCanadianMade && (
          <span className="badge badge-canadian">
            🇨🇦 MADE IN CANADA
          </span>
        )}
        {product.badge && (
          <span className={`badge badge-${product.badge}`}>
            {product.badge === 'sale' ? `-${product.salePercent}%` : product.badge}
          </span>
        )}
      </div>

      <Link to={productPath} className="product-card__info">
        <h3 className="product-card__name">{product.name}</h3>

        <div className="product-card__price-group">
          <span className="product-card__price">
            ${product.price?.toLocaleString()}
          </span>
          {product.originalPrice && product.originalPrice > product.price && (
            <span className="product-card__original">
              ${product.originalPrice?.toLocaleString()}
            </span>
          )}
        </div>

        <div className="product-card__rating">
          <Star size={12} fill="currentColor" />
          <span>{product.rating} ({product.reviews})</span>
        </div>
      </Link>
    </motion.div>
  );
}
