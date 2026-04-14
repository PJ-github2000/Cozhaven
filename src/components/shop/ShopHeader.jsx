import { motion } from 'framer-motion';
import { Search } from 'lucide-react';
import { CATEGORIES } from '../../data/products';

export default function ShopHeader({ category, totalItems, searchInput, setSearchInput, handleSearch }) {
  return (
    <section className="shop-header">
      <div className="shop-header__content">
        <div className="shop-header__surface">
          <div className="shop-header__main">
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

            <p className="shop-header__subtext">
              Discover handcrafted furniture designed for modern living. Filter by style, budget, and availability to find your next signature piece.
            </p>

            <div className="shop-header__meta">
              <span>Free shipping over $999</span>
              <span>30-day easy returns</span>
              <span>Premium materials</span>
            </div>

            <div className="shop-search-form">
              <form onSubmit={handleSearch}>
                <input
                  type="text"
                  name="search"
                  placeholder="Search pieces..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  className="shop-search-input"
                />
                <button type="submit" className="shop-search-btn">
                  <Search size={20} />
                  <span>Search</span>
                </button>
              </form>
            </div>
          </div>

          <aside className="shop-header__rail">
            <div className="shop-rail-card">
              <h3>Design Concierge</h3>
              <p>Need help choosing layout, scale, or material? Our team can help you build room-ready combinations.</p>
              <div className="shop-rail-points">
                <span>Room planning support</span>
                <span>Material guidance</span>
                <span>White glove coordination</span>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}
