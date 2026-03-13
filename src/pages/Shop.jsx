import { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { SlidersHorizontal, Grid3X3, List, X, ChevronDown, Star } from 'lucide-react';
import { CATEGORIES } from '../data/products';
import { useProducts } from '../context/ProductsContext';
import ProductCard from '../components/ProductCard';
import './Shop.css';

export default function Shop() {
  const [searchParams] = useSearchParams();
  const initialCat = searchParams.get('cat') || 'all';
  const [category, setCategory] = useState(initialCat);
  const [sortBy, setSortBy] = useState('featured');
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [priceRange, setPriceRange] = useState([0, 5000]);
  
  // Enhanced filters
  const [selectedColors, setSelectedColors] = useState([]);
  const [selectedSizes, setSelectedSizes] = useState([]);
  const [minRating, setMinRating] = useState(0);
  const [inStockOnly, setInStockOnly] = useState(false);

  // Extract unique colors and sizes from products
  const { products, loading } = useProducts();

  // Extract unique colors and sizes from products
  const allColors = [...new Set(products.flatMap(p => p.colors || []))];
  const allSizes = [...new Set(products.flatMap(p => p.sizes || []))];

  const filtered = useMemo(() => {
    let items = [...products];
    if (category !== 'all') items = items.filter(p => p.category === category);
    if (priceRange) items = items.filter(p => p.price >= priceRange[0] && p.price <= priceRange[1]);
    if (selectedColors.length > 0) {
      items = items.filter(p => selectedColors.some(color => p.colors.includes(color)));
    }
    if (selectedSizes.length > 0) {
      items = items.filter(p => selectedSizes.some(size => p.sizes.includes(size)));
    }
    if (minRating > 0) items = items.filter(p => p.rating >= minRating);
    if (inStockOnly) items = items.filter(p => p.badge !== 'last');
    
    switch (sortBy) {
      case 'price-asc': items.sort((a, b) => a.price - b.price); break;
      case 'price-desc': items.sort((a, b) => b.price - a.price); break;
      case 'rating': items.sort((a, b) => b.rating - a.rating); break;
      case 'newest': items.sort((a, b) => (b.badge === 'new' ? 1 : 0) - (a.badge === 'new' ? 1 : 0)); break;
      default: break;
    }
    return items;
  }, [category, sortBy, priceRange, selectedColors, selectedSizes, minRating, inStockOnly, products]);

  if (loading) return null;

  return (
    <main className="shop-page">
      {/* Hero Banner */}
      <section className="shop-hero">
        <div className="container">
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            {category === 'all' ? 'All Furniture' : CATEGORIES.find(c => c.id === category)?.name || 'Shop'}
          </motion.h1>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
            Showing {filtered.length} pieces
          </motion.p>
        </div>
      </section>

      <div className="container shop-layout">
        {/* Sidebar Filters */}
        <aside className={`shop-filters ${filtersOpen ? 'open' : ''}`}>
          <div className="shop-filters__header">
            <h3>Filters</h3>
            <button className="hide-desktop" onClick={() => setFiltersOpen(false)}><X size={20} /></button>
          </div>

          <div className="filter-group">
            <h4>Category</h4>
            <button className={`filter-opt ${category === 'all' ? 'active' : ''}`} onClick={() => setCategory('all')}>All</button>
            {CATEGORIES.map(cat => (
              <button key={cat.id} className={`filter-opt ${category === cat.id ? 'active' : ''}`} onClick={() => setCategory(cat.id)}>
                {cat.name} <span>({cat.count})</span>
              </button>
            ))}
          </div>

          <div className="filter-group">
            <h4>Price Range</h4>
            <input
              type="range"
              min="0"
              max="5000"
              step="100"
              value={priceRange[1]}
              onChange={e => setPriceRange([0, Number(e.target.value)])}
              className="price-slider"
            />
            <div className="price-labels">
              <span>$0</span>
              <span>${priceRange[1].toLocaleString()}</span>
            </div>
          </div>

          {/* Color Filter */}
          <div className="filter-group">
            <h4>Color</h4>
            <div className="color-swatches">
              {allColors.map(color => (
                <button
                  key={color}
                  className={`color-swatch ${selectedColors.includes(color) ? 'active' : ''}`}
                  style={{ backgroundColor: color }}
                  onClick={() => setSelectedColors(prev => 
                    prev.includes(color) ? prev.filter(c => c !== color) : [...prev, color]
                  )}
                  aria-label={`Filter by color ${color}`}
                />
              ))}
            </div>
            {selectedColors.length > 0 && (
              <button className="clear-filters" onClick={() => setSelectedColors([])}>Clear Colors</button>
            )}
          </div>

          {/* Size Filter */}
          <div className="filter-group">
            <h4>Size</h4>
            <div className="size-options">
              {allSizes.map(size => (
                <label key={size} className="size-checkbox">
                  <input
                    type="checkbox"
                    checked={selectedSizes.includes(size)}
                    onChange={() => setSelectedSizes(prev => 
                      prev.includes(size) ? prev.filter(s => s !== size) : [...prev, size]
                    )}
                  />
                  <span className="checkmark"></span>
                  <span className="size-label">{size}</span>
                </label>
              ))}
            </div>
            {selectedSizes.length > 0 && (
              <button className="clear-filters" onClick={() => setSelectedSizes([])}>Clear Sizes</button>
            )}
          </div>

          {/* Rating Filter */}
          <div className="filter-group">
            <h4>Minimum Rating</h4>
            <div className="rating-options">
              {[4, 3, 2, 1].map(stars => (
                <button
                  key={stars}
                  className={`rating-option ${minRating === stars ? 'active' : ''}`}
                  onClick={() => setMinRating(minRating === stars ? 0 : stars)}
                >
                  {[...Array(5)].map((_, i) => (
                    <Star 
                      key={i} 
                      size={16} 
                      fill={i < stars ? '#FFD700' : 'none'} 
                      stroke={i < stars ? '#FFD700' : 'currentColor'}
                    />
                  ))}
                  <span>& Up</span>
                </button>
              ))}
            </div>
            {minRating > 0 && (
              <button className="clear-filters" onClick={() => setMinRating(0)}>Clear Rating</button>
            )}
          </div>

          {/* Availability */}
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
        </aside>

        {/* Product Grid */}
        <div className="shop-main">
          <div className="shop-toolbar">
            <button className="shop-filter-toggle hide-desktop" onClick={() => setFiltersOpen(true)}>
              <SlidersHorizontal size={18} /> Filters
            </button>
            <div className="shop-sort">
              <select value={sortBy} onChange={e => setSortBy(e.target.value)} aria-label="Sort products">
                <option value="featured">Featured</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="rating">Top Rated</option>
                <option value="newest">Newest</option>
              </select>
              <ChevronDown size={16} className="sort-icon" />
            </div>
          </div>

          <div className="shop-grid">
            <AnimatePresence mode="wait">
              {filtered.map((product, i) => (
                <ProductCard key={product.id} product={product} index={i} />
              ))}
            </AnimatePresence>
          </div>

          {filtered.length === 0 && (
            <div className="shop-empty">
              <p>No products match your filters.</p>
              <button className="btn btn-secondary" onClick={() => { setCategory('all'); setPriceRange([0, 5000]); }}>
                Clear Filters
              </button>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
