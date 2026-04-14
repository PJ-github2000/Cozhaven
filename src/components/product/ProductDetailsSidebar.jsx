import { motion, AnimatePresence } from 'framer-motion';
import { X, Package, Sparkles } from 'lucide-react';
import { titleize, asObject } from './utils';

export default function ProductDetailsSidebar({ product, showDetailsSidebar, setShowDetailsSidebar }) {
  const specsEntries = asObject(product?.specs)
    ? Object.entries(product.specs).filter(([, value]) => value !== null && value !== undefined && value !== '')
    : [];

  return (
    <AnimatePresence>
      {showDetailsSidebar && (
        <>
          <motion.div 
            className="pdp__sidebar-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowDetailsSidebar(false)}
          />
          <motion.aside 
            className="pdp__details-sidebar"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          >
            <div className="sidebar-header">
              <h3>Product Details</h3>
              <button className="close-btn" onClick={() => setShowDetailsSidebar(false)}>
                <X size={20} />
              </button>
            </div>
            <div className="sidebar-content">
              <section className="sidebar-section">
                <h4>Dimensions</h4>
                <div className="sidebar-specs">
                  {specsEntries.map(([label, value]) => (
                    <div key={label} className="sidebar-spec-row">
                      <span>{titleize(label)}</span>
                      <strong>{value}</strong>
                    </div>
                  ))}
                </div>
                {product.dimensionalImageUrl && (
                  <img src={product.dimensionalImageUrl} alt="Diagram" className="sidebar-diagram" />
                )}
              </section>

              <section className="sidebar-section">
                <h4>What's in the Box</h4>
                <div className="box-contents">
                   <div className="box-item">
                      <Package size={16} />
                      <div>
                        <strong>Modular Modules</strong>
                        <span>Each seat and armrest comes in its own easy-to-move box.</span>
                      </div>
                   </div>
                   <div className="box-item">
                      <Sparkles size={16} />
                      <div>
                        <strong>Hardware Kit</strong>
                        <span>No tools required. Includes all connectors and legs.</span>
                      </div>
                   </div>
                </div>
              </section>

              <section className="sidebar-section">
                <h4>Materials</h4>
                <p>{product.materials?.join(', ')}</p>
                <ul>
                  <li>Martindale Rating: 50,000+ rubs</li>
                  <li>Frame: Kiln-dried solid wood</li>
                  <li>Foam: High-resiliency multi-density poly-foam</li>
                </ul>
              </section>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
