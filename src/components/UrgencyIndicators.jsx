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
      {/* Real-time Inventory Countdown Bar */}
      {lowStock && (
        <motion.div 
          className="urgency-inventory-bar-wrapper"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div className="urgency-inventory-label">
            <span className="selling-fast">
              <span className="pulse-dot"></span>
              Selling Fast!
            </span>
            <span>Only <strong>{product.stock || 3} left</strong> in stock</span>
          </div>
          <div className="urgency-progress-bg">
            <motion.div 
              className="urgency-progress-fill"
              initial={{ width: '100%' }}
              animate={{ width: `${Math.max(10, ((product.stock || 3) / 20) * 100)}%` }}
              transition={{ duration: 1, ease: 'easeOut' }}
            />
          </div>
        </motion.div>
      )}

      <div className="urgency-badges-row">
        {/* Live Viewers */}
        {viewers >= 5 && (
          <motion.div 
            className="urgency-badge urgency-viewers"
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Eye size={14} />
            <span>{viewers} people are viewing this right now</span>
          </motion.div>
        )}

        {/* Time Sensitivity */}
        {product.badge === 'sale' && (
          <motion.div 
            className="urgency-badge urgency-time"
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Clock size={14} />
            <span>Offer expires soon</span>
          </motion.div>
        )}
      </div>
    </div>
  );
}
