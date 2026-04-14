import { useRef, useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { CATEGORIES } from '../../data/products';

export default function VisualCategories({ category, setCategory, updateUrlParams, search }) {
  const categoriesRef = useRef(null);
  const [showScrollLeft, setShowScrollLeft] = useState(false);
  const [showScrollRight, setShowScrollRight] = useState(true);

  const handleCategoriesScroll = () => {
    if (categoriesRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = categoriesRef.current;
      setShowScrollLeft(scrollLeft > 0);
      setShowScrollRight(scrollLeft + clientWidth < scrollWidth - 10);
    }
  };

  useEffect(() => {
    handleCategoriesScroll();
    window.addEventListener('resize', handleCategoriesScroll);
    return () => window.removeEventListener('resize', handleCategoriesScroll);
  }, []);

  const scrollCategories = (direction) => {
    if (categoriesRef.current) {
      const scrollAmount = 200;
      categoriesRef.current.scrollBy({ left: direction === 'left' ? -scrollAmount : scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <section className="shop-visual-categories">
      <div className="categories-scroll-wrapper">
        <button
          className={`categories-scroll-btn scroll-left ${showScrollLeft ? 'visible' : ''}`}
          onClick={() => scrollCategories('left')}
          aria-label="Scroll categories left"
        >
          <ChevronLeft size={20} />
        </button>
        <div className="visual-categories-track" ref={categoriesRef} onScroll={handleCategoriesScroll}>
          <button
            className={`visual-category-card ${category === 'all' ? 'active' : ''}`}
            onClick={() => {
              setCategory('all');
              updateUrlParams('all', search);
            }}
          >
            <div className="visual-category-img">
              <div className="all-icon">ALL</div>
            </div>
            <span className="category-label">Shop All</span>
          </button>
          {CATEGORIES.map(cat => (
            <button
              key={cat.id}
              className={`visual-category-card ${category === cat.id ? 'active' : ''}`}
              onClick={() => {
                setCategory(cat.id);
                updateUrlParams(cat.id, search);
              }}
            >
              <div className="visual-category-img">
                <img src={cat.image} alt={cat.name} loading="lazy" />
              </div>
              <span className="category-label">{cat.name}</span>
            </button>
          ))}
        </div>
        <button
          className={`categories-scroll-btn scroll-right ${showScrollRight ? 'visible' : ''}`}
          onClick={() => scrollCategories('right')}
          aria-label="Scroll categories right"
        >
          <ChevronRight size={20} />
        </button>
      </div>
    </section>
  );
}
