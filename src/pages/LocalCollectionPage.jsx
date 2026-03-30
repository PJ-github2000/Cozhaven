import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { Search, Filter, ShoppingBag, ExternalLink, Box, Ruler, Palette } from 'lucide-react';
import localData from '../../local_collection.json';
import './LocalCollectionPage.css';

export default function LocalCollectionPage() {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [loading, setLoading] = useState(true);

  const [visibleLimit, setVisibleLimit] = useState(100);

  useEffect(() => {
    // Basic sorting by name
    const sorted = [...localData].sort((a, b) => a.name.localeCompare(b.name));
    setProducts(sorted);
    setFilteredProducts(sorted);
    setLoading(false);
  }, []);

  useEffect(() => {
    let result = products;
    if (search) {
      result = result.filter(p => 
        p.name.toLowerCase().includes(search.toLowerCase()) || 
        p.sku.toLowerCase().includes(search.toLowerCase())
      );
    }
    if (category !== 'All') {
      result = result.filter(p => p.category === category);
    }
    setFilteredProducts(result);
    setVisibleLimit(100); // Reset limit on filter
  }, [search, category, products]);

  const loadMore = () => setVisibleLimit(prev => prev + 100);

  const categories = ['All', ...new Set(products.map(p => p.category))];

  return (
    <div className="local-collection">
      <Helmet>
        <title>Local Warehouse Collection | Cozhaven</title>
        <meta name="description" content="Direct warehouse pricing on premium furniture. Save on local stock with 40% value margin." />
      </Helmet>

      <div className="local-header">
        <div className="container">
          <div className="local-header__badge">Toronto Warehouse 2025</div>
          <h1>Local Value Collection</h1>
          <p>Unbeatable value on curated furniture from our local Toronto warehouse.</p>
        </div>
      </div>

      <div className="container">
        <div className="local-toolbar">
          <div className="search-box">
            <Search size={18} />
            <input 
              type="text" 
              placeholder="Search by Model or Item..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="filter-box">
            <Filter size={18} />
            <select value={category} onChange={(e) => setCategory(e.target.value)}>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
          <div className="results-count">
            {filteredProducts.length} Items Available
          </div>
        </div>

        {loading ? (
          <div className="local-loading">
            <div className="spinner"></div>
            <p>Accessing Inventory...</p>
          </div>
        ) : (
          <>
            <div className="local-grid">
              {filteredProducts.slice(0, visibleLimit).map((product, idx) => (
                <div key={idx} className="local-card">
                  <div className="local-card__image">
                    <img src={product.image} alt={product.name} loading="lazy" />
                    <div className="local-card__badge">Local Stock</div>
                  </div>
                  
                  <div className="local-card__content">
                    <div className="local-card__header">
                      <h3>{product.name}</h3>
                      <span className="local-card__sku">{product.sku}</span>
                    </div>

                    <div className="local-card__price">
                      <span className="label">CAD $</span>
                      <span className="amount">{Number(product.sale_price).toLocaleString()}</span>
                      <span className="cost-tag">Value Price</span>
                    </div>

                    <p className="local-card__desc">{product.description}</p>
                    
                    <div className="local-card__meta">
                      <div className="meta-item">
                        <Box size={14} />
                        <span>Ready to Ship</span>
                      </div>
                      <div className="meta-item">
                        <Palette size={14} />
                        <span>Standard Finish</span>
                      </div>
                    </div>

                    <div className="local-card__actions">
                      <button className="btn-add">
                        <ShoppingBag size={16} />
                        Inquire / Buy
                      </button>
                      {product.url && (
                        <a href={product.url} target="_blank" rel="noopener noreferrer" className="btn-link">
                          <ExternalLink size={16} />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {visibleLimit < filteredProducts.length && (
              <div className="local-load-more">
                <button className="btn btn-secondary" onClick={loadMore}>
                  Load More Products ({filteredProducts.length - visibleLimit} remaining)
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
