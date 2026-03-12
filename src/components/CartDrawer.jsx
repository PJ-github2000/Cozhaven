import { motion, AnimatePresence } from 'framer-motion';
import { X, Minus, Plus, ShoppingBag, Trash2 } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { Link } from 'react-router-dom';
import './CartDrawer.css';

export default function CartDrawer({ isOpen, onClose }) {
  const { items, removeItem, updateQuantity, subtotal, itemCount } = useCart();

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div className="overlay" onClick={onClose} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} />
          <motion.aside
            className="cart-drawer"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
          >
            <div className="cart-drawer__header">
              <h3>Your Cart <span className="cart-drawer__count">({itemCount})</span></h3>
              <button onClick={onClose} className="cart-drawer__close" aria-label="Close cart"><X size={22} /></button>
            </div>

            {items.length === 0 ? (
              <div className="cart-drawer__empty">
                <ShoppingBag size={48} strokeWidth={1} />
                <p>Your cart is empty</p>
                <Link to="/shop" className="btn btn-primary" onClick={onClose}>Browse Collection</Link>
              </div>
            ) : (
              <>
                <div className="cart-drawer__items">
                  {items.map(item => (
                    <motion.div key={item.key} className="cart-item" layout initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: 100 }}>
                      <div className="cart-item__image">
                        <img src={item.image} alt={item.name} loading="lazy" />
                      </div>
                      <div className="cart-item__info">
                        <h4>{item.name}</h4>
                        <p className="cart-item__variant">{item.size} · <span className="cart-item__color-dot" style={{ background: item.color }} /></p>
                        <div className="cart-item__bottom">
                          <div className="cart-item__qty">
                            <button onClick={() => updateQuantity(item.key, item.quantity - 1)} aria-label="Decrease quantity"><Minus size={14} /></button>
                            <span>{item.quantity}</span>
                            <button onClick={() => updateQuantity(item.key, item.quantity + 1)} aria-label="Increase quantity"><Plus size={14} /></button>
                          </div>
                          <span className="cart-item__price">${(item.price * item.quantity).toLocaleString()}</span>
                        </div>
                      </div>
                      <button className="cart-item__remove" onClick={() => removeItem(item.key)} aria-label="Remove item"><Trash2 size={16} /></button>
                    </motion.div>
                  ))}
                </div>
                <div className="cart-drawer__footer">
                  <div className="cart-drawer__subtotal">
                    <span>Subtotal</span>
                    <span>${subtotal.toLocaleString()}</span>
                  </div>
                  <p className="cart-drawer__note">Shipping & taxes calculated at checkout</p>
                  <button className="btn btn-primary btn-large" style={{ width: '100%' }}>Checkout — ${subtotal.toLocaleString()}</button>
                  <button className="btn btn-ghost" style={{ width: '100%', marginTop: '8px', justifyContent: 'center' }} onClick={onClose}>Continue Shopping</button>
                </div>
              </>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
