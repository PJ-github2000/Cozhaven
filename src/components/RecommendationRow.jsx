import React, { useState, useEffect } from 'react';
import { discoveryApi } from '../services/discoveryApi';
import ProductCard from './ProductCard';
import './RecommendationRow.css';
import { Sparkles, TrendingUp } from 'lucide-react';

/**
 * A horizontal row of recommended products.
 * @param {string} type - 'related', 'trending', or 'recent'
 * @param {number} productId - Source product ID for 'related' type
 * @param {string} title - Custom section title
 */
export default function RecommendationRow({ type = 'trending', productId, title }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts();
  }, [type, productId]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      let data = [];
      if (type === 'related' && productId) {
        data = await discoveryApi.getRecommendations(productId);
      } else if (type === 'recent') {
        data = await discoveryApi.getRecentViews();
      } else {
        data = await discoveryApi.getTrending();
      }
      setProducts(data);
    } catch (error) {
      console.error('Discovery load failed:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!loading && products.length === 0) return null;

  return (
    <section className="discovery-section">
      <div className="discovery-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
             {type === 'trending' ? <TrendingUp size={20} className="glow-icon" /> : <Sparkles size={20} className="glow-icon" />}
             <h2>{title || (type === 'trending' ? 'Trending Now' : type === 'recent' ? 'Recently Viewed' : 'You Might Also Like')}</h2>
        </div>
      </div>

      <div className="discovery-grid">
        {loading ? (
            Array(4).fill(0).map((_, i) => (
                <div key={i} className="skeleton-card" style={{ height: '350px', borderRadius: '8px', background: '#f5f5f5' }}></div>
            ))
        ) : (
            products.map(product => (
                <ProductCard key={product.id} product={product} />
            ))
        )}
      </div>
    </section>
  );
}
