import { useRef, useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Ruler } from 'lucide-react';

export default function ProductGallery({ 
  product, 
  galleryImages, 
  selectedImage, 
  setSelectedImage, 
  onShowDetails 
}) {
  const [zoomActive, setZoomActive] = useState(false);
  const [zoomPosition, setZoomPosition] = useState({ x: 50, y: 50 });
  const mainImageRef = useRef(null);
  const galleryScrollRef = useRef(null);

  const handleMouseMove = (e) => {
    if (!mainImageRef.current) return;
    const rect = mainImageRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setZoomPosition({ x, y });
  };

  const scrollGallery = (dir) => {
    const newIndex = Math.max(0, Math.min(galleryImages.length - 1, selectedImage + dir));
    setSelectedImage(newIndex);
  };

  const currentImage = galleryImages[selectedImage] || galleryImages[0] || product?.image;

  return (
    <div className="pdp__gallery">
      {/* Vertical thumbnail strip */}
      {galleryImages.length > 1 && (
        <div className="pdp__thumbs-vert" ref={galleryScrollRef}>
          {galleryImages.map((img, i) => (
            <button
              key={i}
              className={`pdp__thumb-vert ${selectedImage === i ? 'active' : ''}`}
              onClick={() => setSelectedImage(i)}
            >
              <img src={img} alt={`${product.name} view ${i + 1}`} />
            </button>
          ))}
        </div>
      )}

      {/* Main image */}
      <div
        className={`pdp__main-image-wrap ${zoomActive ? 'zoomed' : ''}`}
        ref={mainImageRef}
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setZoomActive(true)}
        onMouseLeave={() => setZoomActive(false)}
      >
        <img
          src={currentImage}
          alt={`${product.name} - View ${selectedImage + 1}`}
          className="pdp__main-image"
          style={zoomActive ? {
            transformOrigin: `${zoomPosition.x}% ${zoomPosition.y}%`,
            transform: 'scale(1.6)',
          } : {}}
        />
        <div className="pdp__image-badges">
          {product.badge && (
            <span className={`pdp__badge pdp__badge--${product.badge}`}>
              {product.badge === 'sale' ? `-${product.salePercent}%` : product.badge}
            </span>
          )}
          {product.isCanadianMade && (
            <span className="pdp__badge pdp__badge--canadian">🇨🇦 CA Made</span>
          )}
        </div>
        {galleryImages.length > 1 && (
          <>
            <button
              className="pdp__gallery-nav pdp__gallery-nav--prev"
              onClick={() => scrollGallery(-1)}
              disabled={selectedImage === 0}
              aria-label="Previous image"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              className="pdp__gallery-nav pdp__gallery-nav--next"
              onClick={() => scrollGallery(1)}
              disabled={selectedImage === galleryImages.length - 1}
              aria-label="Next image"
            >
              <ChevronRight size={20} />
            </button>
          </>
        )}
        <button className="pdp__dims-btn" onClick={onShowDetails}>
          <Ruler size={14} />
          <span>Dimensions</span>
        </button>
      </div>
    </div>
  );
}
