import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { useProductsQuery } from '../../context/ProductsContext';
import ProductSkeleton from '../ProductSkeleton';

export default function DesignerShowcase() {
  const { data, isLoading } = useProductsQuery({ badge: 'designer', limit: 4 });
  const featured = data?.items || [];

  return (
    <section className="designer-showcase section-padding">
      <div className="container">
        <div className="section-header section-header--split">
          <div>
            <span className="section-subtitle designer-showcase__subtitle">International Style</span>
            <h2 className="section-title designer-showcase__title">Designer Series</h2>
            <p className="designer-showcase__description">Discover premium, modular furniture inspired by global architectural designs and luxury comfort.</p>
          </div>
          <Link to="/designer-series" className="btn btn-ghost designer-showcase__link">
            View Full Series <ArrowRight size={16} />
          </Link>
        </div>

        <div className="featured__grid">
          {isLoading && featured.length === 0 && Array.from({ length: 4 }).map((_, i) => (
            <ProductSkeleton key={i} index={i} />
          ))}
          {featured.map((product, i) => (
            <motion.div
              key={product.id || i}
              className="product-card"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
            >
              <Link to="/designer-series">
                <div className="product-card__image">
                  <img src={product.image} alt={product.product_name} loading="lazy" />
                  <div className="product-card__badge">Designer</div>
                </div>
                <div className="product-card__content">
                  <h3 className="product-card__title">{product.product_name}</h3>
                  <div className="product-card__price-wrapper">
                    <p className="product-card__price">
                      {product.price && product.price !== "0" ? `CAD $${Number(product.price).toLocaleString()}` : 'Inquire for Price'}
                    </p>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
      <div className="designer-showcase__glow" />
    </section>
  );
}
