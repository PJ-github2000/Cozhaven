import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ShoppingBag, ChevronRight, Home as HomeIcon } from 'lucide-react';
import './CollectionDetail.css';

const CollectionDetail = () => {
  const { slug } = useParams();
  const [collection, setCollection] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCollection = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/collections/${slug}`);
        if (!response.ok) {
          throw new Error('Collection not found');
        }
        const data = await response.json();
        setCollection(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCollection();
  }, [slug]);

  if (loading) {
    return (
      <div className="collection-loading">
        <div className="spinner"></div>
        <p>Elevating your space...</p>
      </div>
    );
  }

  if (error || !collection) {
    return (
      <div className="collection-error">
        <h2>Collection Not Found</h2>
        <p>The series you are looking for has been moved or retired.</p>
        <Link to="/shop" className="btn-primary">Browse All Products</Link>
      </div>
    );
  }

  return (
    <div className="collection-page">
      {/* Collection Hero */}
      <div className="collection-hero">
        {collection.image_url && (
          <div className="hero-image-wrapper">
            <img src={collection.image_url} alt={collection.name} className="hero-image" />
            <div className="hero-overlay"></div>
          </div>
        )}
        <div className="hero-content">
          <div className="hero-breadcrumbs">
            <Link to="/"><HomeIcon size={14} /> Home</Link>
            <ChevronRight size={12} />
            <Link to="/shop">Shop</Link>
            <ChevronRight size={12} />
            <span className="current">{collection.name}</span>
          </div>
          <span className="hero-subtitle">Your couch, your way</span>
          <h1 className="collection-title">{collection.name}</h1>
          <p className="collection-description">{collection.description}</p>
          <div className="hero-actions">
             <a href="#series-items" className="btn-hero-primary">Explore The Series</a>
             <Link to="/contact" className="btn-hero-outline">Custom Design Request</Link>
          </div>
        </div>
      </div>

      {/* Customization Section */}
      <section className="customization-section">
        <div className="container">
            <div className="customization-grid">
                <div className="customization-text">
                    <h2>Feeling Creative?</h2>
                    <p>Submit your own design for your custom project. If you can dream it, chances are we can make it!</p>
                    <Link to="/contact" className="btn-primary">Get a Quote</Link>
                </div>
                <div className="customization-image">
                    <img src="https://atunus.com/wp-content/uploads/2025/04/Pixel-Classic-Modular-Sofa-Adaptable-Comfort-Linen-Sofa-Sets-4-Seaters-Atunus-1.webp" alt="Custom Design" />
                </div>
            </div>
        </div>
      </section>

      {/* Products Grid */}
      <div className="container" id="series-items">
        <div className="collection-header">
            <h2>The Series Items</h2>
            <p>{collection.products.length} distinctive pieces</p>
        </div>
        
        <div className="product-grid">
          {collection.products.map((product) => (
            <div key={product.id} className="product-card">
              <Link to={`/products/${product.slug || product.id}`} className="product-image-link">
                <div className="product-image-wrapper">
                  {product.badge && <span className="product-badge">{product.badge}</span>}
                  <img src={product.images[0] || '/placeholder.jpg'} alt={product.name} className="product-image" />
                </div>
              </Link>
              <div className="product-info">
                <span className="product-category">{product.category}</span>
                <Link to={`/products/${product.slug || product.id}`}>
                  <h3 className="product-name">{product.name}</h3>
                </Link>
                <div className="product-price-row">
                  <span className="product-price">${product.price.toLocaleString()}</span>
                  {product.originalPrice && (
                    <span className="product-original-price">${product.originalPrice.toLocaleString()}</span>
                  )}
                </div>
                <Link to={`/products/${product.slug || product.id}`} className="btn-outline">
                  View Details <ChevronRight size={14} />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CollectionDetail;
