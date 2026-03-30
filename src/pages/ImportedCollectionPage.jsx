import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { Search, Filter, ShoppingBag, ExternalLink, Box, Ruler, Palette } from 'lucide-react';
import importedData from '../../imported_collection.json';
import './ImportedCollectionPage.css';

export default function ImportedCollectionPage() {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setProducts(importedData);
    setFilteredProducts(importedData);
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
  }, [search, category, products]);

  const categories = ['All', ...new Set(products.map(p => p.category))];

  return (
    <div className="imported-collection">
      <Helmet>
        <title>Imported Collection | Cozhaven</title>
        <meta name="description" content="Browse our exclusive imported furniture collection featuring global designs and luxury comfort." />
      </Helmet>

      <div className="imported-header">
        <div className="container">
          <h1>Exclusive Imported Collection</h1>
          <p>Global architectural designs curated for your modern home.</p>
        </div>
      </div>

      <div className="container">
        <div className="imported-toolbar">
          <div className="search-box">
            <Search size={18} />
            <input 
              type="text" 
              placeholder="Search by SKU or Name..." 
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
            {filteredProducts.length} Products Found
          </div>
        </div>

        {loading ? (
          <div className="imported-loading">Loading Collection...</div>
        ) : (
          <div className="imported-grid">
            {filteredProducts.map((product, idx) => (
              <div key={idx} className="imported-card">
                <div className="imported-card__image">
                  <img src={product.image} alt={product.name} loading="lazy" />
                  <div className="imported-card__badge">{product.category}</div>
                </div>
                
                <div className="imported-card__content">
                  <div className="imported-card__header">
                    <h3>{product.name}</h3>
                    <span className="imported-card__sku">{product.sku}</span>
                  </div>

                  <div className="imported-card__price">
                    <span className="label">CAD $</span>
                    <span className="amount">{Number(product.sale_price).toLocaleString()}</span>
                  </div>

                  <div className="imported-card__details">
                    {product.size && (
                      <div className="detail-item">
                        <Ruler size={14} />
                        <span>{product.size}</span>
                      </div>
                    )}
                    {product.color && (
                      <div className="detail-item">
                        <Palette size={14} />
                        <span>{product.color}</span>
                      </div>
                    )}
                    {product.stock && (
                      <div className="detail-item">
                        <Box size={14} />
                        <span>In Stock: {product.stock}</span>
                      </div>
                    )}
                  </div>

                  <p className="imported-card__desc">{product.detail}</p>

                  {product.variations.length > 0 && (
                    <div className="imported-card__variations">
                      <h4>Available Options:</h4>
                      <div className="variation-tags">
                        {product.variations.map((v, i) => (
                          <span key={i} className="variation-tag">
                            {v.type}: {v.price}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="imported-card__actions">
                    <button className="btn-add">
                      <ShoppingBag size={16} />
                      Order Now
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
        )}
      </div>
    </div>
  );
}
