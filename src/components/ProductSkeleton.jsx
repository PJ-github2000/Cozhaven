import { motion } from 'framer-motion';
import './ProductSkeleton.css';

export default function ProductSkeleton({ index = 0 }) {
  return (
    <motion.div 
      className="product-skeleton"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: index * 0.05 }}
    >
      <div className="skeleton-image-wrap">
        <div className="skeleton skeleton-pulse" />
      </div>
      <div className="skeleton-info">
        <div className="skeleton skeleton-text skeleton-title skeleton-pulse" />
        <div className="skeleton-row">
          <div className="skeleton skeleton-text skeleton-small skeleton-pulse" />
          <div className="skeleton skeleton-text skeleton-medium skeleton-pulse" />
        </div>
      </div>
    </motion.div>
  );
}
