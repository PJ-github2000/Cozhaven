import { MessageCircle, Calendar, X } from 'lucide-react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './FloatingActions.css';

export default function FloatingActions() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="floating-actions">
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            className="floating-actions__menu"
            initial={{ opacity: 0, y: 20, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.8 }}
          >
            <button className="floating-actions__item" onClick={() => window.open('https://calendly.com', '_blank')}>
              <Calendar size={20} />
              <span>Book Appointment</span>
            </button>
            <button className="floating-actions__item chat" onClick={() => window.open('https://wa.me/16475552699', '_blank')}>
              <MessageCircle size={20} />
              <span>WhatsApp Chat</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <button 
        className={`floating-actions__trigger ${isOpen ? 'active' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Contact and Support"
      >
        {isOpen ? <X size={24} /> : <MessageCircle size={24} />}
      </button>
    </div>
  );
}
