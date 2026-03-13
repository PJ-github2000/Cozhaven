import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Clock, Eye, AlertCircle } from 'lucide-react';

export default function UrgencyIndicators({ product }) {
  const [viewers, setViewers] = useState(0);
  const [lowStock, setLowStock] = useState(false);

  useEffect(() => {
    // Simulate live viewers (random between 3-15)
    setViewers(Math.floor(Math.random() * 12) + 3);
    
    // Check if low stock
    if (product.badge === 'last' || product.stock < 5) {
      setLowStock(true);
    }

    // Update viewers every 10 seconds
    const interval = setInterval(() => {
      setViewers(prev => {
        const change = Math.floor(Math.random() * 5) - 2;
        return Math.max(1, Math.min(20, prev + change));
      });
    }, 10000);

    return () => clearInterval(interval);
  }, [product]);

  if (!lowStock && viewers < 5) return null;

  return (
    <div className="urgency-indicators">
      {/* Low Stock Warning */}
      {lowStock && (
        <motion.div 
          className="urgency-badge urgency-low-stock"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <AlertCircle size={16} />
          <span>Only {product.stock || 1} left in stock!</span>
        </motion.div>
      )}

      {/* Live Viewers */}
      {viewers >= 5 && (
        <motion.div 
          className="urgency-badge urgency-viewers"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Eye size={16} />
          <span>{viewers} people viewing this item</span>
        </motion.div>
      )}

      {/* Time Sensitivity */}
      {product.badge === 'sale' && (
        <motion.div 
          className="urgency-badge urgency-time"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Clock size={16} />
          <span>Sale ends soon!</span>
        </motion.div>
      )}
    </div>
  );
}
