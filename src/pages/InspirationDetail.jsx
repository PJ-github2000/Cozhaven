import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Plus } from 'lucide-react';
import { useProducts } from '../context/ProductsContext';
import ProductCard from '../components/ProductCard';
import './Inspiration.css';

export default function InspirationDetail() {
  const { slug } = useParams();
  const { products } = useProducts();
  
  // Mock data for "Shop the Look"
  const lookProducts = products.slice(0, 3);

  return (
    <main className="inspiration-page">
      <div className="container" style={{ paddingTop: '50px' }}>
        <div className="look-header">
           <h1>{slug.replace('-', ' ').toUpperCase()} Concept</h1>
           <p>A masterclass in modern minimalist design, balancing warmth and structure.</p>
        </div>

        <section className="look-hero">
           <img 
             src="https://atunus.com/wp-content/uploads/2025/06/Finding-Beauty-in-Simplicity-Wabi-Sabi-Design-for-Reflective-Business-Settings-01-1749607323.webp" 
             alt="Custom Design" 
           />
           <div className="dot dot-1" style={{ top: '40%', left: '30%' }}><Plus size={14} /></div>
           <div className="dot dot-2" style={{ top: '60%', left: '70%' }}><Plus size={14} /></div>
        </section>

        <section className="shop-the-look">
          <h2>Shop the Look</h2>
          <div className="pdp__related-grid">
            {lookProducts.map((p, i) => (
              <ProductCard key={p.id} product={p} index={i} />
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
