import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { CATEGORIES } from '../../data/products';

export default function MobileFilterDrawer({
  filtersOpen,
  setFiltersOpen,
  category,
  setCategory,
  priceRange,
  setPriceRange,
  sortBy,
  setSortBy,
  inStockOnly,
  setInStockOnly,
  resetAllFilters,
  hasActiveFilters,
  updateUrlParams,
  search,
  totalItems,
  isFetching,
  MAX_PRICE
}) {
  return (
    <AnimatePresence>
      {filtersOpen && (
        <>
          <motion.div
            className="filter-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setFiltersOpen(false)}
          />
          <motion.aside
            className="mobile-filter-drawer"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          >
            <div className="mobile-filter-header">
              <h3>Filters</h3>
              <button className="mobile-filter-close" onClick={() => setFiltersOpen(false)}>
                <X size={20} />
              </button>
            </div>
            <div className="mobile-filter-content">
              <div className="filter-group">
                <h4>Price Range</h4>
                <div className="price-slider-container">
                  <div className="price-slider-track">
                    <div className="price-slider-fill" style={{ left: `${(priceRange[0] / MAX_PRICE) * 100}%`, right: `${100 - (priceRange[1] / MAX_PRICE) * 100}%` }} />
                    <input
                      type="range"
                      min="0"
                      max={MAX_PRICE}
                      step="100"
                      value={priceRange[0]}
                      onChange={e => {
                        const val = Math.min(Number(e.target.value), priceRange[1] - 100);
                        setPriceRange([val, priceRange[1]]);
                      }}
                      className="price-slider price-slider-min"
                    />
                    <input
                      type="range"
                      min="0"
                      max={MAX_PRICE}
                      step="100"
                      value={priceRange[1]}
                      onChange={e => {
                        const val = Math.max(Number(e.target.value), priceRange[0] + 100);
                        setPriceRange([priceRange[0], val]);
                      }}
                      className="price-slider price-slider-max"
                    />
                  </div>
                  <div className="price-labels">
                    <span>${priceRange[0].toLocaleString()}</span>
                    <span>${priceRange[1].toLocaleString()}</span>
                  </div>
                </div>
              </div>

              <div className="filter-group">
                <h4>Categories</h4>
                <button
                  className={`filter-opt ${category === 'all' ? 'active' : ''}`}
                  onClick={() => {
                    setCategory('all');
                    updateUrlParams('all', search);
                  }}
                >
                  All Collections
                </button>
                {CATEGORIES.map(cat => (
                  <button
                    key={cat.id}
                    className={`filter-opt ${category === cat.id ? 'active' : ''}`}
                    onClick={() => {
                      setCategory(cat.id);
                      updateUrlParams(cat.id, search);
                    }}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>

              <div className="filter-group">
                <h4>Sort By</h4>
                <button className={`filter-opt ${sortBy === 'featured' ? 'active' : ''}`} onClick={() => setSortBy('featured')}>Featured</button>
                <button className={`filter-opt ${sortBy === 'newest' ? 'active' : ''}`} onClick={() => setSortBy('newest')}>New Arrivals</button>
                <button className={`filter-opt ${sortBy === 'price-asc' ? 'active' : ''}`} onClick={() => setSortBy('price-asc')}>Price: Low to High</button>
                <button className={`filter-opt ${sortBy === 'price-desc' ? 'active' : ''}`} onClick={() => setSortBy('price-desc')}>Price: High to Low</button>
              </div>

              <div className="filter-group">
                <h4>Availability</h4>
                <label className="availability-toggle">
                  <input
                    type="checkbox"
                    checked={inStockOnly}
                    onChange={() => setInStockOnly(!inStockOnly)}
                  />
                  <span className="toggle-switch"></span>
                  <span>In Stock Only</span>
                </label>
              </div>

              {hasActiveFilters && (
                <button className="sidebar-clear-btn" onClick={resetAllFilters}>Reset All Filters</button>
              )}
            </div>
            <div className="mobile-filter-footer">
              <button className="btn btn-primary" style={{ width: '100%' }} onClick={() => setFiltersOpen(false)}>
                {isFetching ? 'Updating Results...' : `Show ${totalItems} Results`}
              </button>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
