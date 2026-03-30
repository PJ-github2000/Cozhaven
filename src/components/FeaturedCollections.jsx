import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles } from 'lucide-react';
import './FeaturedCollections.css';

const FeaturedCollections = () => {
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCollections = async () => {
      try {
        const response = await fetch('/api/collections?featured_only=true');
        if (!response.ok) {
          console.warn('Collections API returned error:', response.status);
          setCollections([]);
          return;
        }
        const data = await response.json();
        if (Array.isArray(data)) {
          setCollections(data);
        } else {
          console.warn('Collections API did not return an array:', data);
          setCollections([]);
        }
      } catch (error) {
        console.error('Error fetching collections:', error);
        setCollections([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCollections();
  }, []);

  if (loading || collections.length === 0) return null;

  return (
    <section className="featured-collections section-padding">
      <div className="container">
        <div className="section-header">
          <span className="section-subtitle">The Series</span>
          <h2 className="section-title">Explore Our Collections</h2>
          <p className="section-desc">Handcrafted series designed for cohesive living spaces.</p>
        </div>

        <div className="collections-grid">
          {collections.map((collection, index) => (
            <motion.div 
              key={collection.id}
              className="collection-card-v2"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.6 }}
            >
              <Link to={`/collections/${collection.slug}`} className="collection-card-link">
                <div className="collection-image-wrapper">
                  <img src={collection.image_url || '/placeholder-collection.jpg'} alt={collection.name} loading="lazy" />
                  <div className="collection-overlay">
                    <div className="collection-info">
                      <div className="collection-badge">
                        <Sparkles size={14} />
                        <span>Featured Series</span>
                      </div>
                      <h3>{collection.name}</h3>
                      <p>{collection.description?.substring(0, 100)}...</p>
                      <span className="explore-link">
                        Explore Collection <ArrowRight size={16} />
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedCollections;
