import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, Play } from 'lucide-react';
import './Inspiration.css';

const ROOMS = [
  { id: 'living-room', name: 'Living Room', count: 12, img: 'https://atunus.com/wp-content/uploads/2025/04/Bubble-Sectional-Sofa-Comfort-3D-Knitted-Loveseats-2-3-Seater-Atunus-1.webp' },
  { id: 'bedroom', name: 'Bedroom', count: 8, img: 'https://atunus.com/wp-content/uploads/2025/06/Upholstered-Bed-Frame-with-Button-Tufted-Headboard-1-1750241729.webp' },
  { id: 'workspace', name: 'Workspace', count: 6, img: 'https://atunus.com/wp-content/uploads/2025/06/Ergonomic-Mesh-Office-Chair-with-Lumbar-Support-1-1750297845.webp' },
  { id: 'outdoor', name: 'Outdoor', count: 4, img: 'https://atunus.com/wp-content/uploads/2025/06/Breenda-Outdoor-Acacia-Wood-Sofa-with-Cushions-1-1750299066.webp' },
];

export default function Inspiration() {
  return (
    <main className="inspiration-page">
      <section className="inspiration-hero">
        <div className="container">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }}
          >
            Design Inspiration
          </motion.h1>
          <p>Explore curated room designs and shop the looks you love.</p>
        </div>
      </section>

      <div className="container">
        <div className="inspiration-grid">
          {ROOMS.map((room, i) => (
            <motion.div 
              key={room.id}
              className="inspiration-card"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.1 }}
            >
              <div className="inspiration-card__img">
                <img src={room.img} alt={room.name} />
                <div className="inspiration-card__overlay">
                  <Link to={`/inspiration/${room.id}`} className="btn btn-white">
                    Explore Looks <ArrowRight size={16} />
                  </Link>
                </div>
              </div>
              <div className="inspiration-card__info">
                <h3>{room.name}</h3>
                <span>{room.count} curated looks</span>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Brand Narrative / Video Section */}
        <section className="inspiration-narrative">
          <div className="narrative-content">
            <span className="section-subtitle">The Art of Living</span>
            <h2>Furniture designed for life's meaningful moments.</h2>
            <p>We believe your home should be as unique as your story. Our designers travel globally to find the perfect balance between timeless Canadian craftsmanship and modern international aesthetics.</p>
            <button className="btn btn-primary btn-large">
              <Play size={18} fill="white" /> Watch Our Process
            </button>
          </div>
          <div className="narrative-video-thumb">
             <img src="https://atunus.com/wp-content/uploads/2025/06/Crafting-Serene-and-Mindful-Workspaces-in-the-Modern-Business-World-01-1749606998.webp" alt="Craftsmanship" />
          </div>
        </section>
      </div>
    </main>
  );
}
