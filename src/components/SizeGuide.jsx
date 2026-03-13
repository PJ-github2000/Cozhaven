import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Ruler, Info, CheckCircle } from 'lucide-react';
import './SizeGuide.css';

const SIZE_DATA = {
  sofas: {
    title: 'Sofas & Sectionals',
    sizes: [
      { name: 'Loveseat', width: '48-64"', depth: '32-38"', height: '30-36"', seating: '2 people' },
      { name: '2 Seater', width: '64-78"', depth: '32-40"', height: '30-36"', seating: '2 people' },
      { name: '3 Seater', width: '78-96"', depth: '32-40"', height: '30-36"', seating: '3 people' },
      { name: '4 Seater', width: '96-120"', depth: '32-40"', height: '30-36"', seating: '4 people' },
    ],
    tips: [
      'Allow 36" of walking space in front of sofa',
      'Leave 6-12" between sofa arm and wall',
      'Coffee table should be 14-18" from sofa seat'
    ]
  },
  beds: {
    title: 'Beds & Mattresses',
    sizes: [
      { name: 'Twin', width: '38"', length: '75"', room: '7\' x 10\'', best: 'Kids, teens' },
      { name: 'Full', width: '54"', length: '75"', room: '9\' x 12\'', best: 'Single adults' },
      { name: 'Queen', width: '60"', length: '80"', room: '10\' x 12\'', best: 'Couples' },
      { name: 'King', width: '76"', length: '80"', room: '12\' x 12\'', best: 'Couples + space' },
    ],
    tips: [
      'Leave 2-3 feet on each side for nightstands',
      'Allow 30" walking space around bed',
      'Headboard should be 6-12" wider than mattress'
    ]
  },
  tables: {
    title: 'Dining Tables',
    sizes: [
      { name: '4-Seater', width: '48-60"', depth: '36-42"', height: '30"', shape: 'Square/Rectangle' },
      { name: '6-Seater', width: '60-78"', depth: '36-42"', height: '30"', shape: 'Rectangle' },
      { name: '8-Seater', width: '78-96"', depth: '36-42"', height: '30"', shape: 'Rectangle/Oval' },
      { name: 'Round 4-Seater', diameter: '36-48"', height: '30"', shape: 'Round' },
    ],
    tips: [
      'Allow 36" between table edge and wall',
      'Chairs need 24" width per person',
      'Table height standard is 28-30"'
    ]
  }
};

export default function SizeGuide({ onClose }) {
  const [activeCategory, setActiveCategory] = useState('sofas');

  return (
    <div className="size-guide-overlay" onClick={onClose}>
      <motion.div 
        className="size-guide-modal"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        onClick={e => e.stopPropagation()}
      >
        <div className="size-guide-header">
          <h2><Ruler size={24} /> Size Guide</h2>
          <button className="close-btn" onClick={onClose}><X size={24} /></button>
        </div>

        {/* Category Tabs */}
        <div className="size-guide-tabs">
          <button 
            className={`tab ${activeCategory === 'sofas' ? 'active' : ''}`}
            onClick={() => setActiveCategory('sofas')}
          >
            Sofas
          </button>
          <button 
            className={`tab ${activeCategory === 'beds' ? 'active' : ''}`}
            onClick={() => setActiveCategory('beds')}
          >
            Beds
          </button>
          <button 
            className={`tab ${activeCategory === 'tables' ? 'active' : ''}`}
            onClick={() => setActiveCategory('tables')}
          >
            Tables
          </button>
        </div>

        {/* Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeCategory}
            className="size-guide-content"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            <h3>{SIZE_DATA[activeCategory].title}</h3>
            
            {/* Size Table */}
            <div className="size-table-wrapper">
              <table className="size-table">
                <thead>
                  <tr>
                    <th>Size</th>
                    <th>Width</th>
                    <th>Depth</th>
                    <th>Height</th>
                    {activeCategory === 'sofas' && <th>Seating</th>}
                    {activeCategory === 'beds' && <th>Length</th>}
                    {activeCategory === 'beds' && <th>Room Size</th>}
                    {activeCategory === 'beds' && <th>Best For</th>}
                    {activeCategory === 'tables' && <th>Shape</th>}
                  </tr>
                </thead>
                <tbody>
                  {SIZE_DATA[activeCategory].sizes.map((size, index) => (
                    <tr key={index}>
                      <td><strong>{size.name}</strong></td>
                      <td>{size.width || '—'}</td>
                      <td>{size.depth || '—'}</td>
                      <td>{size.height || '—'}</td>
                      {activeCategory === 'sofas' && <td>{size.seating}</td>}
                      {activeCategory === 'beds' && <td>{size.length}</td>}
                      {activeCategory === 'beds' && <td>{size.room}</td>}
                      {activeCategory === 'beds' && <td>{size.best}</td>}
                      {activeCategory === 'tables' && <td>{size.shape}</td>}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Tips */}
            <div className="size-tips">
              <h4><Info size={18} /> Measuring Tips</h4>
              <ul>
                {SIZE_DATA[activeCategory].tips.map((tip, index) => (
                  <li key={index}>
                    <CheckCircle size={16} />
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* How to Measure */}
            <div className="how-to-measure">
              <h4>How to Measure Your Space</h4>
              <ol>
                <li>
                  <strong>Measure the space</strong>
                  <p>Use a tape measure to determine the length, width, and height of your room</p>
                </li>
                <li>
                  <strong>Mark doorways & hallways</strong>
                  <p>Measure all entry points to ensure furniture will fit through</p>
                </li>
                <li>
                  <strong>Account for clearance</strong>
                  <p>Add 2-3 feet for walking space around furniture</p>
                </li>
                <li>
                  <strong>Visualize with painter's tape</strong>
                  <p>Use tape on floor to outline furniture footprint</p>
                </li>
              </ol>
            </div>
          </motion.div>
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
