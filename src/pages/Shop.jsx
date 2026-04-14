import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { SlidersHorizontal, ChevronDown } from 'lucide-react';
import { CATEGORIES } from '../data/products';
import { useProductsQuery } from '../context/ProductsContext';
import ProductCard from '../components/ProductCard';
import ProductSkeleton from '../components/ProductSkeleton';
import { Helmet } from 'react-helmet-async';

// Modular Components
import ShopHeader from '../components/shop/ShopHeader';
import VisualCategories from '../components/shop/VisualCategories';
import ShopSidebar from '../components/shop/ShopSidebar';
import MobileFilterDrawer from '../components/shop/MobileFilterDrawer';

import './Shop.css';

export default function Shop() {
  const MAX_PRICE = 10000;
  const DEFAULT_PRICE = [0, MAX_PRICE];
  const [searchParams, setSearchParams] = useSearchParams();
  const initialCat = searchParams.get('cat') || 'all';
  const initialSearch = searchParams.get('q') || '';

  const [category, setCategory] = useState(initialCat);
  const [sortBy, setSortBy] = useState('featured');
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [priceRange, setPriceRange] = useState(DEFAULT_PRICE);
  const [search, setSearch] = useState(initialSearch);
  const [searchInput, setSearchInput] = useState(initialSearch);
  const [visibleProducts, setVisibleProducts] = useState([]);

  const [inStockOnly, setInStockOnly] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  const updateUrlParams = (nextCategory, nextSearch) => {
    const params = {};
    if (nextCategory && nextCategory !== 'all') params.cat = nextCategory;
    if (nextSearch && nextSearch.trim()) params.q = nextSearch.trim();
    setSearchParams(params);
  };

  const resetAllFilters = () => {
    setCategory('all');
    setPriceRange(DEFAULT_PRICE);
    setSearch('');
    setSearchInput('');
    setInStockOnly(false);
    updateUrlParams('all', '');
  };

  const { data, isLoading: loading, isFetching } = useProductsQuery({
    category,
    min_price: priceRange[0],
    max_price: priceRange[1],
    sort: sortBy,
    search: search,
    in_stock: inStockOnly,
    page: currentPage,
    limit: itemsPerPage
  });

  const totalItems = data?.total || 0;
  const hasActiveFilters = category !== 'all' || search || priceRange[1] < MAX_PRICE || priceRange[0] > 0 || inStockOnly;
  const activeFiltersCount =
    Number(category !== 'all') +
    Number(Boolean(search)) +
    Number(priceRange[1] < MAX_PRICE || priceRange[0] > 0) +
    Number(inStockOnly);

  useEffect(() => {
    const cat = searchParams.get('cat') || 'all';
    const q = searchParams.get('q') || '';
    if (cat !== category) {
      setCategory(cat);
      setCurrentPage(1);
    }
    if (q !== search) {
      setSearch(q);
      setSearchInput(q);
      setCurrentPage(1);
    }
  }, [searchParams]);

  useEffect(() => {
    setCurrentPage(1);
  }, [category, sortBy, priceRange, inStockOnly, search]);

  useEffect(() => {
    if (!isFetching && data) {
      const nextItems = data.items || [];
      if (currentPage === 1) {
        setVisibleProducts(nextItems);
      } else {
        setVisibleProducts((prev) => {
          const seen = new Set(prev.map((item) => item.id));
          const merged = [...prev];
          nextItems.forEach((item) => {
            if (!seen.has(item.id)) merged.push(item);
          });
          return merged;
        });
      }
    }
  }, [data, currentPage, isFetching]);

  const handleSearch = (e) => {
    e.preventDefault();
    const query = searchInput.trim();
    setSearch(query);
    updateUrlParams(category, query);
  };

  return (
    <main className="shop-page">
      <Helmet>
        <title>{category === 'all' ? 'All Collections' : `${CATEGORIES.find(c => c.id === category)?.name} Collection`} | Cozhaven - Modern Furniture</title>
        <meta name="description" content={`Explore our curated collection of ${category === 'all' ? 'handcrafted premium furniture' : CATEGORIES.find(c => c.id === category)?.name.toLowerCase()}. Hand-finished quality for the modern home.`} />
        <link rel="canonical" href={`https://cozhaven.com/shop${category !== 'all' ? `?cat=${category}` : ''}`} />
      </Helmet>

      <ShopHeader 
        category={category} 
        totalItems={totalItems} 
        searchInput={searchInput} 
        setSearchInput={setSearchInput} 
        handleSearch={handleSearch} 
      />

      <VisualCategories 
        category={category} 
        setCategory={setCategory} 
        updateUrlParams={updateUrlParams} 
        search={search} 
      />

      <div className="shop-layout">
        <ShopSidebar 
          category={category}
          setCategory={setCategory}
          priceRange={priceRange}
          setPriceRange={setPriceRange}
          inStockOnly={inStockOnly}
          setInStockOnly={setInStockOnly}
          resetAllFilters={resetAllFilters}
          hasActiveFilters={hasActiveFilters}
          updateUrlParams={updateUrlParams}
          search={search}
          MAX_PRICE={MAX_PRICE}
        />

        <div className="shop-main">
          <div className="shop-toolbar">
            <div className="toolbar-left">
              <button className="filter-toggle" onClick={() => setFiltersOpen(true)}>
                <SlidersHorizontal size={14} />
                <span>Filters</span>
              </button>
              <div className="results-count">
                {totalItems} Items Found
                {activeFiltersCount > 0 && <span className="results-active-badge">{activeFiltersCount} Active</span>}
              </div>
              {hasActiveFilters && (
                <button className="toolbar-clear-btn" onClick={resetAllFilters}>
                  Clear All
                </button>
              )}
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
              {loading || (isFetching && currentPage === 1 && visibleProducts.length === 0) ? (
                Array.from({ length: 8 }).map((_, i) => (
                  <ProductSkeleton key={`skeleton-${i}`} index={i} />
                ))
              ) : visibleProducts.length > 0 ? (
                visibleProducts.map((product, i) => (
                  <ProductCard key={product.id} product={product} index={i} />
                ))
              ) : null}
            </AnimatePresence>
          </div>

          {totalItems > visibleProducts.length && !loading && (
            <div className="shop-pagination">
              <button
                onClick={() => setCurrentPage(prev => prev + 1)}
                className="btn btn-primary shop-load-more-btn"
                disabled={isFetching}
              >
                {isFetching ? 'Loading...' : `Load ${Math.min(itemsPerPage, totalItems - visibleProducts.length)} More Pieces`}
              </button>
            </div>
          )}

          {totalItems === 0 && !loading && (
            <div className="shop-empty">
              <p>No products match your filters.</p>
              <button className="btn btn-secondary" onClick={resetAllFilters}>
                Clear Filters
              </button>
            </div>
          )}
        </div>
      </div>

      <MobileFilterDrawer 
        filtersOpen={filtersOpen}
        setFiltersOpen={setFiltersOpen}
        category={category}
        setCategory={setCategory}
        priceRange={priceRange}
        setPriceRange={setPriceRange}
        sortBy={sortBy}
        setSortBy={setSortBy}
        inStockOnly={inStockOnly}
        setInStockOnly={setInStockOnly}
        resetAllFilters={resetAllFilters}
        hasActiveFilters={hasActiveFilters}
        updateUrlParams={updateUrlParams}
        search={search}
        totalItems={totalItems}
        isFetching={isFetching}
        MAX_PRICE={MAX_PRICE}
      />
    </main>
  );
}
