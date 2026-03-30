import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <main style={{ 
      minHeight: '80vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      padding: '2rem',
      textAlign: 'center',
    }}>
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 style={{ 
          fontSize: 'clamp(5rem, 15vw, 10rem)', 
          fontWeight: 200, 
          lineHeight: 1, 
          color: 'var(--deep-charcoal)',
          letterSpacing: '-0.04em',
          marginBottom: '0.5rem',
        }}>
          404
        </h1>
        <p style={{ 
          fontSize: '1.25rem', 
          color: 'var(--charcoal-muted)', 
          marginBottom: '2rem',
          maxWidth: '400px',
        }}>
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link to="/" className="btn btn-primary">
            <Home size={18} style={{ marginRight: '8px' }} /> Back to Home
          </Link>
          <Link to="/shop" className="btn btn-secondary">
            Browse Shop
          </Link>
        </div>
      </motion.div>
    </main>
  );
}
