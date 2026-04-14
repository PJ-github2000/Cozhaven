import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { useProductsQuery } from '../../context/ProductsContext';
import ProductSkeleton from '../ProductSkeleton';
import AnimatedText from '../AnimatedText';

export default function LocalCollection() {
  const { data, isLoading } = useProductsQuery({ collection_tag: 'local', limit: 4 });
  const products = data?.items || [];

  return (
    <section className="featured section-padding featured--local">
      <div className="container">
        <div className="section-header section-header--split">
          <div>
            <span className="section-subtitle">Local Value</span>
            <AnimatedText el="h2" text="Local Warehouse Deals" className="section-title" />
          </div>
          <Link to="/shop?collection=local" className="btn btn-ghost">Shop Local Deals <ArrowRight size={16} /></Link>
        </div>
        <div className="featured__grid">
          {isLoading ? (
            Array.from({ length: 4 }).map((_, i) => <ProductSkeleton key={i} />)
          ) : (
            products.map((product, i) => (
              <div key={i} className="product-card">
                <Link to={`/products/${product.slug || product.id}`}>
                  <div className="product-card__image">
                    <img src={product.image} alt={product.name} loading="lazy" />
                    <div className="product-card__badge product-card__badge--warehouse">Warehouse</div>
                  </div>
                  <div className="product-card__content">
                    <h3 className="product-card__title">{product.name}</h3>
                    <div className="product-card__price-wrapper">
                      <p className="product-card__price">CAD ${Number(product.price).toLocaleString()}</p>
                      <span className="value-label">Direct Value</span>
                    </div>
                  </div>
                </Link>
              </div>
            ))
          )}
        </div>
      </div>
    </section>
  );
}
