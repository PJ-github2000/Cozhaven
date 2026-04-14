import { CATEGORIES } from '../../data/products';

export default function ShopSidebar({ 
  category, 
  setCategory, 
  priceRange, 
  setPriceRange, 
  inStockOnly, 
  setInStockOnly, 
  resetAllFilters, 
  hasActiveFilters, 
  updateUrlParams, 
  search,
  MAX_PRICE
}) {
  return (
    <aside className="shop-sidebar">
      <div className="sidebar-inner">
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
    </aside>
  );
}
