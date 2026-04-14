import { Minus, Plus, Star, Share2, Truck } from 'lucide-react';
import SofaFloorPlan from '../SofaFloorPlan';
import { IconToken, titleize } from './utils';

export default function ProductConfigurator({
  product,
  quantity,
  setQuantity,
  selectedColor,
  setSelectedColor,
  selectedConfiguration,
  handleConfigChange,
  isOutOfStock,
  handleAddToCart,
  handleShare,
  promoRows,
  configurationOptions,
  materialSummaryItems,
  bundleOffers,
  trustHighlights,
  setVisualSelectionPriority
}) {
  const monthlyInstallment = Math.max(1, Math.ceil(((product?.price || 0) * quantity) / 12));
  const shippingWindow = product?.shipsInDays || product?.ships_in_days || '3-7 days';

  return (
    <aside className="pdp__config-sidebar">
      <div className="pdp__config-inner">
        <header className="pdp__header">
          <div className="pdp__meta-top">
            <div className="pdp__rating-summary">
              <div className="stars">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} size={14} fill={i < Math.floor(product.rating) ? 'currentColor' : 'none'} className={i < Math.floor(product.rating) ? 'star-filled' : 'star-empty'} />
                ))}
              </div>
              <a href="#reviews" className="pdp__reviews-link">{product.rating} ({product.reviews} reviews)</a>
            </div>
            <button className="pdp__share-btn" onClick={handleShare}><Share2 size={18} /></button>
          </div>
          <div className="pdp__eyebrow-row">
            {product.category && <span className="pdp__eyebrow-label">{titleize(product.category)}</span>}
            {product.sku && <span className="pdp__eyebrow-sep">•</span>}
            {product.sku && <span className="pdp__eyebrow-sku">SKU {product.sku}</span>}
          </div>
          <h1 className="pdp__title">{product.name}</h1>
          {(product.shortDescription || product.description) && (
            <p className="pdp__intro-copy">
              {product.shortDescription || String(product.description).slice(0, 170)}
            </p>
          )}
        </header>

        <div className="pdp__price-sticky">
          <span className="pdp__current-price">${(product.price * quantity).toLocaleString()}</span>
          {product.originalPrice > product.price && <span className="pdp__old-price">${(product.originalPrice * quantity).toLocaleString()}</span>}
          <span className={`pdp__stock-pill ${isOutOfStock ? 'out' : 'in'}`}>
            {isOutOfStock ? 'Out of stock' : 'In stock'}
          </span>
        </div>

        {promoRows.length > 0 && (
          <div className="pdp__promo-strip">
            {promoRows.slice(0, 2).map((row, i) => (
              <div key={`${row.spend}-${row.save}-${i}`} className="pdp__promo-row">
                <span>{row.spend}</span>
                <strong>{row.save}</strong>
              </div>
            ))}
          </div>
        )}

        {/* Configuration Grid */}
        {configurationOptions.length > 0 && (
          <div className="pdp__config-section">
            <p className="pdp__config-heading">Select Base Configuration</p>
            <div className="pdp__floor-grid">
              {configurationOptions.map((config, i) => (
                <button
                  key={i}
                  className={`pdp__floor-card ${selectedConfiguration === i && !(config.slug || config.id) ? 'active' : ''}`}
                  onClick={() => handleConfigChange(i, config)}
                  title={config.name}
                >
                  <span className="pdp__floor-card-media">
                    {config.previewImage
                      ? <img src={config.previewImage} alt={config.name} />
                      : <SofaFloorPlan type={config.optionKey || config.iconKey || config.icon_key || '3-seater'} size={52} />
                    }
                  </span>
                  <span className="pdp__floor-card-label">{config.name}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Color Swatches */}
        {product.colors && product.colors.length > 0 && (
          <div className="pdp__color-section">
            <p className="pdp__color-heading">
              Color: <span>{selectedColor === -1 ? '-' : (product.colorNames?.[selectedColor] || product.colors?.[selectedColor])}</span>
            </p>
            <div className="pdp__swatches">
              {product.colors.map((c, i) => (
                <button
                  key={i}
                  className={`pdp__swatch ${selectedColor === i ? 'active' : ''}`}
                  onClick={() => { setSelectedColor(i); setVisualSelectionPriority('color'); }}
                  style={{ background: c }}
                  title={product.colorNames?.[i] || c}
                />
              ))}
            </div>
          </div>
        )}

        {/* Material Quick Reference */}
        {materialSummaryItems.length > 0 && (
          <div className="pdp__material-quick">
            {materialSummaryItems.map((item, i) => (
              <div key={i} className="pdp__material-quick-row">
                <span>{item.label}</span>
                <strong>{item.value}</strong>
              </div>
            ))}
          </div>
        )}

        {/* Bundle Add-ons */}
        {bundleOffers.length > 0 && (
          <div className="pdp__addons-section">
            <p className="pdp__config-heading">Enhance Your Order</p>
            <div className="pdp__addons-list">
              {bundleOffers.map((offer, i) => (
                <div key={i} className="pdp__addon-card">
                  <div className="pdp__addon-info">
                    <strong>{offer.title}</strong>
                    <span>{offer.badge || 'Optional upgrade'}</span>
                  </div>
                  <Plus size={16} />
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="pdp__purchase-stack">
          <div className="pdp__qty-row">
            <div className="pdp__qty-control">
              <button onClick={() => setQuantity(Math.max(1, quantity - 1))}><Minus size={14} /></button>
              <span>{quantity}</span>
              <button onClick={() => setQuantity(quantity + 1)}><Plus size={14} /></button>
            </div>
            <div className="pdp__shipping-tag">
              <Truck size={14} /> Estimated delivery: {shippingWindow}
            </div>
          </div>

          <button className="pdp__add-to-cart-sticky" onClick={handleAddToCart} disabled={isOutOfStock}>
            {isOutOfStock ? 'Out of Stock' : `Add to Cart - $${(product.price * quantity).toLocaleString()}`}
          </button>

          <div className="pdp__finance-row">
            {`Or $${monthlyInstallment}/mo with `}
            <span className="highlight">Affirm</span>
          </div>
        </div>

        <div className="pdp__trust-grid-sticky">
          {trustHighlights.slice(0, 3).map((item, i) => (
            <div key={`${item.title}-${i}`} className="trust-item">
              <IconToken token={item.icon} size={18} />
              <strong>{item.title}</strong>
              {item.description && <span>{item.description}</span>}
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
}
