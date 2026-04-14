import { createContext, useContext, useReducer, useEffect } from 'react';

const CartContext = createContext();

const STORAGE_KEY = 'cozhaven_cart';

function loadCart() {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch { return []; }
}

function saveCart(items) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

function cartReducer(state, action) {
  switch (action.type) {
    case 'ADD_ITEM': {
      const { id, color, size, material } = action.payload;
      const key = `${id}-${color || ''}-${size || ''}-${material || ''}`;
      const existing = state.find(item => item.key === key);
      if (existing) {
        return state.map(item =>
          item.key === key ? { ...item, quantity: item.quantity + (action.payload.quantity || 1) } : item
        );
      } else {
        return [...state, { ...action.payload, key, quantity: action.payload.quantity || 1 }];
      }
    }
    case 'REMOVE_ITEM':
      return state.filter(item => item.key !== action.payload);
    case 'UPDATE_QUANTITY':
      if (action.payload.quantity <= 0) {
        return state.filter(item => item.key !== action.payload.key);
      } else {
        return state.map(item =>
          item.key === action.payload.key ? { ...item, quantity: action.payload.quantity } : item
        );
      }
    case 'CLEAR_CART':
      return [];
    default:
      return state;
  }
}

export function CartProvider({ children }) {
  const [items, dispatch] = useReducer(cartReducer, [], loadCart);

  useEffect(() => {
    saveCart(items);
  }, [items]);

  const addItem = (product, color, size, quantity = 1, material) => {
    dispatch({ type: 'ADD_ITEM', payload: { ...product, color, size, quantity, material } });
  };

  const removeItem = (key) => dispatch({ type: 'REMOVE_ITEM', payload: key });

  const updateQuantity = (key, quantity) =>
    dispatch({ type: 'UPDATE_QUANTITY', payload: { key, quantity } });

  const clearCart = () => dispatch({ type: 'CLEAR_CART' });

  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, updateQuantity, clearCart, itemCount, subtotal }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
