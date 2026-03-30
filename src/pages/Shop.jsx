import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { SlidersHorizontal, Grid3X3, List, X, ChevronDown, Star, Search } from 'lucide-react';
import { CATEGORIES } from '../data/products';
import { useProductsQuery } from '../context/ProductsContext';
import ProductCard from '../components/ProductCard';
import ProductSkeleton from '../components/ProductSkeleton';
import { Helmet } from 'react-helmet-async';
import './Shop.css';

export default function Shop() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialCat = searchParams.get('cat') || 'all';
  const initialSearch = searchParams.get('q') || '';

  const [category, setCategory] = useState(initialCat);
  const [sortBy, setSortBy] = useState('featured');
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [priceRange, setPriceRange] = useState([0, 5000]);
  const [search, setSearch] = useState(initialSearch);

  const [minRating, setMinRating] = useState(0);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  // NEW: Server-side query replacing full-catalog load
  const { data, isLoading: loading, error } = useProductsQuery({
    category,
    min_price: priceRange[0],
    max_price: priceRange[1],
    sort: sortBy,
    search: search,
    min_rating: minRating,
    in_stock: inStockOnly,
    page: currentPage,
    limit: itemsPerPage
  });

  const products = data?.items || [];
  const totalItems = data?.total || 0;
  const totalPages = data?.pages || 1;

  // Static filters for now (H04)
  const allColors = ["#C9B8A8", "#2A2622", "#E5E5E5", "#3D3D3D"];
  const allSizes = ["Standard", "Queen", "King", "Large"];

  // Sync category from URL
  useEffect(() => {
    const cat = searchParams.get('cat') || 'all';
    if (cat !== category) {
      setCategory(cat);
      setCurrentPage(1);
    }
  }, [searchParams]);

  // Reset pagination on filter change
  useEffect(() => {
    setCurrentPage(1);
  }, [category, sortBy, priceRange, minRating, inStockOnly, search]);

  const handleSearch = (e) => {
    e.preventDefault();
    const query = e.target.search.value;
    setSearch(query);
    setSearchParams({ cat: category, q: query });
  };

  // if (loading) is handled inside the render now for smoother transition

  return (
    <main className="shop-page">
      <Helmet>
        <title>{category === 'all' ? 'All Collections' : `${CATEGORIES.find(c => c.id === category)?.name} Collection`} | Cozhaven — Modern Furniture</title>
        <meta name="description" content={`Explore our curated collection of ${category === 'all' ? 'handcrafted premium furniture' : CATEGORIES.find(c => c.id === category)?.name.toLowerCase()}. Hand-finished quality for the modern home.`} />
        <link rel="canonical" href={`https://cozhaven.com/shop${category !== 'all' ? `?cat=${category}` : ''}`} />
      </Helmet>

      {/* Hero Banner */}
      <section className="shop-header">
        <div className="shop-header__content">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="shop-header__count"
          >
            {totalItems} Curated Pieces
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          >
            {category === 'all' ? 'The Collection' : CATEGORIES.find(c => c.id === category)?.name}
          </motion.h1>

          <div className="shop-search-form">
            <form onSubmit={handleSearch}>
              <input
                type="text"
                name="search"
                placeholder="Search pieces..."
                defaultValue={search}
                className="shop-search-input"
              />
              <button type="submit" className="shop-search-btn">
                <Search size={20} />
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* Visual Categories Strip */}
      <section className="shop-visual-categories">
        <div className="visual-categories-track">
          <button
            className={`visual-category-card ${category === 'all' ? 'active' : ''}`}
            onClick={() => { setCategory('all'); setSearchParams({}); }}
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
              onClick={() => { setCategory(cat.id); setSearchParams({ cat: cat.id }); }}
            >
              <div className="visual-category-img">
                <img src={cat.image} alt={cat.name} loading="lazy" />
              </div>
              <span className="category-label">{cat.name}</span>
            </button>
          ))}
        </div>
      </section>

      <div className="shop-layout">
        <aside className="shop-sidebar">
          <div className="sidebar-inner">
            <div className="filter-group">
              <h4>Price Range</h4>
              <div className="price-slider-container">
                <input
                  type="range"
                  min="0"
                  max="10000"
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
            </div>

            <div className="filter-group">
              <h4>Categories</h4>
              <button
                className={`filter-opt ${category === 'all' ? 'active' : ''}`}
                onClick={() => setCategory('all')}
              >
                All Collections
              </button>
              {CATEGORIES.map(cat => (
                <button
                  key={cat.id}
                  className={`filter-opt ${category === cat.id ? 'active' : ''}`}
                  onClick={() => setCategory(cat.id)}
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

            {/* Availability Toggle */}
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

            {(category !== 'all' || search || priceRange[1] < 10000 || inStockOnly) && (
              <button className="sidebar-clear-btn" onClick={() => {
                setCategory('all');
                setPriceRange([0, 10000]);
                setSearch('');
                setMinRating(0);
                setInStockOnly(false);
                setSearchParams({});
              }}>Reset All Filters</button>
            )}
          </div>
        </aside>

        {/* Product Grid */}
        <div className="shop-main">
          <div className="shop-toolbar">
            <div className="toolbar-left">
              <button className="filter-toggle" onClick={() => setFiltersOpen(true)}>
                <SlidersHorizontal size={14} />
                <span>Filters</span>
              </button>
              <div className="results-count">
                {totalItems} Items Found
              </div>
            </div>

            <div className="toolbar-right">
              <div className="sort-wrapper">
                <span className="sort-label hide-mobile">Sort:</span>
                <select value={sortBy} onChange={e => setSortBy(e.target.value)}>
                  <option value="featured">Featured First</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                  <option value="rating">Top Rated</option>
                  <option value="newest">Newest Arrival</option>
                </select>
                <ChevronDown size={14} className="sort-chevron" />
              </div>
            </div>
          </div>

          <div className="shop-grid">
            <AnimatePresence mode="popLayout">
              {loading ? (
                Array.from({ length: 8 }).map((_, i) => (
                  <ProductSkeleton key={`skeleton-${i}`} index={i} />
                ))
              ) : products.length > 0 ? (
                products.map((product, i) => (
                  <ProductCard key={product.id} product={product} index={i} />
                ))
              ) : null}
            </AnimatePresence>
          </div>

          {totalItems > itemsPerPage * currentPage && !loading && (
            <div className="shop-pagination">
              <button
                className="btn btn-primary"
                onClick={() => setCurrentPage(prev => prev + 1)}
                style={{ margin: '3rem auto', display: 'block', minWidth: '200px' }}
              >
                Load More Pieces
              </button>
            </div>
          )}

          {totalItems === 0 && !loading && (
            <div className="shop-empty">
              <p>No products match your filters.</p>
              <button className="btn btn-secondary" onClick={() => { setCategory('all'); setPriceRange([0, 5000]); setSearch(''); setSearchParams({}); }}>
                Clear Filters
              </button>
            </div>
          )}

          {/* Buying Guide / SEO Content */}
          <section className="shop-seo-content">
            <div className="seo-grid">
              <div className="seo-text">
                <h3>How to Choose the Right Furniture for Your Space</h3>
                <p>Selecting furniture is more than just picking a style; it's about understanding material quality, scale, and longevity. Whether you are furnishing a new condo or refreshing your family home, our collection is curated to provide the perfect balance of aesthetic and durability.</p>
                <h4>Material Matters</h4>
                <p>From solid oak frames to performance velvet fabrics, every Cozhaven piece is built to withstand the rigors of daily life. We prioritize sustainably sourced woods and toxin-free finishes to ensure a healthy home environment.</p>
              </div>
              <div className="seo-tips">
                <div className="tip-card">
                  <h5>Measure Twice</h5>
                  <p>Always check doorway, elevator, and hallway clearances before ordering large pieces like sofas and dining tables.</p>
                </div>
                <div className="tip-card">
                  <h5>Light & Color</h5>
                  <p>Fabric colors can shift under different lighting. Consider how your room’s natural light will interact with your chosen upholstery.</p>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
