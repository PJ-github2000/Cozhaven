import { motion } from 'framer-motion';
import { Heart } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useWishlist } from '../context/WishlistContext';
import ProductCard from '../components/ProductCard';
import './Wishlist.css';

export default function Wishlist() {
  const { items } = useWishlist();

  return (
    <main className="wishlist-page">
      <section className="wishlist-hero">
        <div className="container">
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>Your Wishlist</motion.h1>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>{items.length} {items.length === 1 ? 'item' : 'items'} saved</motion.p>
        </div>
      </section>
      <section className="container section-padding">
        {items.length === 0 ? (
          <div className="wishlist-empty">
            <Heart size={48} strokeWidth={1} />
            <h3>Your wishlist is empty</h3>
            <p>Save your favorite pieces for later</p>
            <Link to="/shop" className="btn btn-primary">Browse Collection</Link>
          </div>
        ) : (
          <div className="wishlist-grid">
            {items.map((product, i) => (
              <ProductCard key={product.id} product={product} index={i} />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
