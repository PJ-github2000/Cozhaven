import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Heart, Star, ShoppingCart } from 'lucide-react';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import './ProductCard.css';

export default function ProductCard({ product, index = 0 }) {
  const [imgLoaded, setImgLoaded] = useState(false);
  const [selectedColor, setSelectedColor] = useState(0);
  const { toggle, isWished } = useWishlist();
  const { addItem } = useCart();
  const { addToast } = useToast();
  const colorSwatches = Array.isArray(product.colors) ? product.colors.slice(0, 4) : [];
  const imageGallery = Array.isArray(product.images) ? product.images.filter(Boolean) : [];
  const selectedImageIndex = imageGallery.length > 0 ? Math.min(selectedColor, imageGallery.length - 1) : 0;
  const primaryImage = imageGallery[selectedImageIndex] || imageGallery[0] || product.image;
  const secondaryImage = imageGallery.find((img, idx) => idx !== selectedImageIndex && img);
  const formatBadgeText = (badge) => String(badge || '').replace(/[_-]+/g, ' ').trim();

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
          src={primaryImage}
          alt={product.name}
          className="product-card__img-primary"
          loading="lazy"
          onLoad={() => setImgLoaded(true)}
          onError={(e) => {
            e.currentTarget.style.visibility = 'hidden';
            setImgLoaded(true);
          }}
          style={{ opacity: imgLoaded ? 1 : 0 }}
        />
        {secondaryImage && (
          <img
            src={secondaryImage}
            alt={`${product.name} alternate view`}
            className="product-card__img-secondary"
            loading="lazy"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
            }}
          />
        )}
        <div className="product-card__overlay">
          <button
            className="product-card__add-to-cart"
            onClick={handleQuickAdd}
            aria-label={`Add ${product.name} to cart`}
          >
            <ShoppingCart size={15} aria-hidden="true" /> Add to cart
          </button>
        </div>
        <div className="product-card__wishlist-wrapper">
          <button
            className={`product-card__wishlist ${isWished(product.id) ? 'active' : ''}`}
            onClick={(e) => { e.preventDefault(); toggle(product); }}
            aria-label={isWished(product.id) ? `Remove ${product.name} from wishlist` : `Add ${product.name} to wishlist`}
          >
            <Heart size={18} fill={isWished(product.id) ? 'currentColor' : 'none'} aria-hidden="true" />
          </button>
        </div>
        {(product.isCanadianMade || product.badge) && (
          <div className="product-card__badges">
            {product.badge && (
              <span className={`badge badge-${product.badge}`}>
                {product.badge === 'sale' ? `-${product.salePercent}%` : formatBadgeText(product.badge)}
              </span>
            )}
            {product.isCanadianMade && (
              <span className="badge badge-canadian">
                MADE IN CANADA
              </span>
            )}
          </div>
        )}
      </div>

      <div className="product-card__info">
        <Link to={productPath} className="product-card__info-link" data-testid={`product-card-link-${product.id}`}>
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

        </Link>

        <div className="product-card__meta-row">
          <div className="product-card__rating">
            <Star size={12} fill="currentColor" />
            <span>{product.rating} ({product.reviews})</span>
          </div>

          <Link to={productPath} className="product-card__quickview" aria-label={`Quick view of ${product.name}`}>
            Quick view
          </Link>
        </div>

        {colorSwatches.length > 1 && (
          <div className="product-card__swatches" aria-label="Available colors">
            {colorSwatches.map((swatch, swatchIndex) => (
              <button
                key={`${product.id}-${swatch}-${swatchIndex}`}
                type="button"
                className={`product-card__swatch ${selectedColor === swatchIndex ? 'active' : ''}`}
                style={{ background: swatch }}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setSelectedColor(swatchIndex);
                  setImgLoaded(false);
                }}
                aria-label={`Select color ${swatchIndex + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}
