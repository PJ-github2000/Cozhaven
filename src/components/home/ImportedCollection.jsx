import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { useProductsQuery } from '../../context/ProductsContext';
import ProductSkeleton from '../ProductSkeleton';
import AnimatedText from '../AnimatedText';

export default function ImportedCollection() {
  const { data, isLoading } = useProductsQuery({ collection_tag: 'imported', limit: 4 });
  const products = data?.items || [];

  const getDisplayName = (product) => {
    if (/^[A-Z]{2}-[A-Z]{2,}\d+/.test(product.name)) {
      const cat = product.subcategory || product.category || 'Furniture';
      const color = product.colorNames?.[0] || '';
      return `${color ? color.charAt(0).toUpperCase() + color.slice(1) + ' ' : ''}${cat.replace('Sofas & Sectionals', 'Modular Sofa')}`;
    }
    return product.name;
  };

  return (
    <section className="featured section-padding featured--imported">
      <div className="container">
        <div className="section-header section-header--split">
          <div>
            <span className="section-subtitle">Global Designs</span>
            <AnimatedText el="h2" text="Imported Collection" className="section-title" />
          </div>
          <Link to="/shop?collection=imported" className="btn btn-ghost">Shop Imported <ArrowRight size={16} /></Link>
        </div>
        <div className="featured__grid">
          {isLoading ? (
            Array.from({ length: 4 }).map((_, i) => <ProductSkeleton key={i} />)
          ) : (
            products.map((product, i) => (
              <div key={i} className="product-card">
                <Link to={`/products/${product.slug || product.id}`}>
                  <div className="product-card__image">
                    <img src={product.image} alt={getDisplayName(product)} loading="lazy" />
                    <div className="product-card__badge">Imported</div>
                  </div>
                  <div className="product-card__content">
                    <h3 className="product-card__title">{getDisplayName(product)}</h3>
                    <p className="product-card__price">CAD ${Number(product.price).toLocaleString()}</p>
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
