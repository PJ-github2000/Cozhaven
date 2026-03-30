import { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ZoomIn, ChevronLeft, ChevronRight } from 'lucide-react';
import './ImageZoom.css';

export default function ImageZoom({ images, currentIndex, productName }) {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(currentIndex);
  const [zoomActive, setZoomActive] = useState(false);
  const [zoomPosition, setZoomPosition] = useState({ x: 50, y: 50 });
  const imgRef = useRef(null);

  const handleMouseMove = useCallback((e) => {
    if (!imgRef.current) return;
    const rect = imgRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setZoomPosition({ x, y });
  }, []);

  const openLightbox = () => {
    setLightboxIndex(currentIndex);
    setLightboxOpen(true);
    document.body.style.overflow = 'hidden';
  };

  const closeLightbox = () => {
    setLightboxOpen(false);
    document.body.style.overflow = '';
  };

  const navigateLightbox = (dir) => {
    setLightboxIndex(prev => {
      const next = prev + dir;
      if (next < 0) return images.length - 1;
      if (next >= images.length) return 0;
      return next;
    });
  };

  // Close on Escape
  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowLeft') navigateLightbox(-1);
    if (e.key === 'ArrowRight') navigateLightbox(1);
  }, []);

  return (
    <>
      {/* Hover-to-zoom on main image */}
      <div
        ref={imgRef}
        className={`image-zoom ${zoomActive ? 'image-zoom--active' : ''}`}
        onMouseEnter={() => setZoomActive(true)}
        onMouseLeave={() => setZoomActive(false)}
        onMouseMove={handleMouseMove}
        onClick={openLightbox}
        role="button"
        tabIndex={0}
        aria-label="Click to enlarge image"
      >
        <img src={images[currentIndex]} alt={productName} />
        {zoomActive && (
          <div
            className="image-zoom__lens"
            style={{
              backgroundImage: `url(${images[currentIndex]})`,
              backgroundPosition: `${zoomPosition.x}% ${zoomPosition.y}%`,
            }}
          />
        )}
        <div className="image-zoom__hint">
          <ZoomIn size={16} />
          <span>Click to enlarge</span>
        </div>
      </div>

      {/* Lightbox overlay */}
      <AnimatePresence>
        {lightboxOpen && (
          <motion.div
            className="lightbox"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeLightbox}
            onKeyDown={handleKeyDown}
            tabIndex={-1}
            role="dialog"
            aria-label="Image gallery"
          >
            <motion.div
              className="lightbox__content"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
            >
              <button className="lightbox__close" onClick={closeLightbox} aria-label="Close">
                <X size={24} />
              </button>

              {images.length > 1 && (
                <button className="lightbox__nav lightbox__nav--prev" onClick={() => navigateLightbox(-1)} aria-label="Previous image">
                  <ChevronLeft size={28} />
                </button>
              )}

              <motion.img
                key={lightboxIndex}
                src={images[lightboxIndex]}
                alt={`${productName} - View ${lightboxIndex + 1}`}
                className="lightbox__image"
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -30 }}
                transition={{ duration: 0.25 }}
              />

              {images.length > 1 && (
                <button className="lightbox__nav lightbox__nav--next" onClick={() => navigateLightbox(1)} aria-label="Next image">
                  <ChevronRight size={28} />
                </button>
              )}

              {/* Thumbnail strip */}
              {images.length > 1 && (
                <div className="lightbox__thumbs">
                  {images.map((img, i) => (
                    <button
                      key={i}
                      className={`lightbox__thumb ${lightboxIndex === i ? 'active' : ''}`}
                      onClick={() => setLightboxIndex(i)}
                    >
                      <img src={img} alt={`Thumbnail ${i + 1}`} />
                    </button>
                  ))}
                </div>
              )}

              <div className="lightbox__counter">
                {lightboxIndex + 1} / {images.length}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
