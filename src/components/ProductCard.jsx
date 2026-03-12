import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Heart, Eye, Star } from 'lucide-react';
import { useWishlist } from '../context/WishlistContext';
import './ProductCard.css';

export default function ProductCard({ product, index = 0 }) {
  const [imgLoaded, setImgLoaded] = useState(false);
  const { toggle, isWished } = useWishlist();

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
          src={product.image}
          alt={product.name}
          loading="lazy"
          onLoad={() => setImgLoaded(true)}
          style={{ opacity: imgLoaded ? 1 : 0 }}
        />
        <div className="product-card__overlay">
          <Link to={`/products/${product.id}`} className="product-card__quickview" aria-label="Quick view">
            <Eye size={18} /> Quick View
          </Link>
        </div>
        <button
          className={`product-card__wishlist ${isWished(product.id) ? 'active' : ''}`}
          onClick={(e) => { e.preventDefault(); toggle(product); }}
          aria-label="Add to wishlist"
        >
          <Heart size={18} fill={isWished(product.id) ? 'currentColor' : 'none'} />
        </button>
        {product.badge && (
          <span className={`badge badge-${product.badge === 'last' ? 'last' : product.badge}`}>
            {product.badge === 'sale' ? `-${product.salePercent}%` : product.badge === 'new' ? 'New' : 'Last Stock'}
          </span>
        )}
        {product.colors && (
          <div className="product-card__colors">
            {product.colors.slice(0, 3).map((c, i) => (
              <span key={i} className="product-card__color-dot" style={{ background: c }} />
            ))}
          </div>
        )}
      </div>
      <Link to={`/products/${product.id}`} className="product-card__info">
        <h3 className="product-card__name">{product.name}</h3>
        <div className="product-card__meta">
          <div className="product-card__rating">
            <Star size={13} fill="currentColor" />
            <span>{product.rating}</span>
          </div>
          <div className="product-card__price">
            {product.originalPrice && (
              <span className="product-card__original">${product.originalPrice.toLocaleString()}</span>
            )}
            <span className={product.originalPrice ? 'product-card__sale' : ''}>
              ${product.price.toLocaleString()}
            </span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
