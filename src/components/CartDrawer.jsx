import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Minus, Plus, ShoppingBag, Trash2, Tag, Truck, Check } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import { Link } from 'react-router-dom';
import './CartDrawer.css';

export default function CartDrawer({ isOpen, onClose }) {
  const { items, removeItem, updateQuantity, subtotal, itemCount } = useCart();
  const { addToast } = useToast();
  const [promoCode, setPromoCode] = useState('');
  const [appliedDiscount, setAppliedDiscount] = useState(null);
  const [shippingEstimate, setShippingEstimate] = useState(null);

  // Promo code handler
  const handleApplyPromo = () => {
    if (!promoCode.trim()) return;
    
    // Mock promo codes
    const validCodes = {
      'WELCOME10': { type: 'percent', value: 10, label: '10% Off' },
      'SAVE20': { type: 'percent', value: 20, label: '20% Off' },
      'FREESHIP': { type: 'shipping', value: 0, label: 'Free Shipping' },
      'COZY50': { type: 'fixed', value: 50, label: '$50 Off' },
    };

    const discount = validCodes[promoCode.toUpperCase()];
    if (discount) {
      setAppliedDiscount(discount);
      addToast(`Promo code applied! ${discount.label}`, 'success');
    } else {
      addToast('Invalid promo code', 'error');
    }
  };

  // Calculate final total
  const calculateDiscount = () => {
    if (!appliedDiscount) return 0;
    if (appliedDiscount.type === 'percent') {
      return subtotal * (appliedDiscount.value / 100);
    } else if (appliedDiscount.type === 'fixed') {
      return appliedDiscount.value;
    }
    return 0;
  };

  const discountAmount = calculateDiscount();
  const finalTotal = subtotal - discountAmount;

  // Shipping calculator
  const calculateShipping = () => {
    if (subtotal >= 999) {
      setShippingEstimate({ method: 'Standard', cost: 0, days: '5-7 days' });
    } else if (subtotal >= 500) {
      setShippingEstimate({ method: 'Standard', cost: 49, days: '5-7 days' });
    } else {
      setShippingEstimate({ method: 'Standard', cost: 99, days: '5-7 days' });
    }
  };

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
                  {/* Promo Code */}
                  <div className="cart-promo">
                    <div className="cart-promo-input">
                      <Tag size={16} />
                      <input
                        type="text"
                        placeholder="Promo code"
                        aria-label="Enter promo code"
                        value={promoCode}
                        onChange={e => setPromoCode(e.target.value.toUpperCase())}
                        onKeyPress={e => e.key === 'Enter' && handleApplyPromo()}
                      />
                    </div>
                    <button className="btn-apply" onClick={handleApplyPromo}>Apply</button>
                  </div>
                  
                  {appliedDiscount && (
                    <div className="cart-discount-applied" role="status">
                      <span className="cart-discount-applied__label">
                        <Check size={14} aria-hidden="true" />
                        {appliedDiscount.label} applied!
                      </span>
                      <button onClick={() => { setAppliedDiscount(null); setPromoCode(''); }}>Remove</button>
                    </div>
                  )}

                  {/* Shipping Calculator */}
                  <button className="cart-shipping-calc" onClick={calculateShipping}>
                    <Truck size={16} />
                    Calculate Shipping
                  </button>

                  {shippingEstimate && (
                    <div className="cart-shipping-estimate">
                      <div className="shipping-row">
                        <span>{shippingEstimate.method}</span>
                        <span>{shippingEstimate.days}</span>
                      </div>
                      <div className="shipping-row">
                        <span>Cost</span>
                        <span className="price">${shippingEstimate.cost}</span>
                      </div>
                    </div>
                  )}

                  <div className="cart-drawer__subtotal">
                    <span>Subtotal</span>
                    <span>${subtotal.toLocaleString()}</span>
                  </div>

                  {discountAmount > 0 && (
                    <div className="cart-drawer__discount">
                      <span>Discount</span>
                      <span>-${discountAmount.toLocaleString()}</span>
                    </div>
                  )}

                  <p className="cart-drawer__note">Shipping & taxes calculated at checkout</p>
                  <Link 
                    to="/checkout" 
                    className="btn btn-primary btn-large" 
                    data-testid="cart-checkout-link"
                    style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    onClick={onClose}
                  >
                    Checkout — ${finalTotal.toLocaleString()}
                  </Link>
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
