import { createContext, useContext, useReducer } from 'react';

const WishlistContext = createContext();
const STORAGE_KEY = 'cozhaven_wishlist';

function load() {
  try { const d = localStorage.getItem(STORAGE_KEY); return d ? JSON.parse(d) : []; }
  catch { return []; }
}

function save(items) { localStorage.setItem(STORAGE_KEY, JSON.stringify(items)); }

function reducer(state, action) {
  let n;
  switch (action.type) {
    case 'TOGGLE': {
      const exists = state.find(i => i.id === action.payload.id);
      n = exists ? state.filter(i => i.id !== action.payload.id) : [...state, action.payload];
      break;
    }
    case 'REMOVE':
      n = state.filter(i => i.id !== action.payload);
      break;
    default: return state;
  }
  save(n);
  return n;
}

export function WishlistProvider({ children }) {
  const [items, dispatch] = useReducer(reducer, [], load);
  const toggle = (product) => dispatch({ type: 'TOGGLE', payload: product });
  const remove = (id) => dispatch({ type: 'REMOVE', payload: id });
  const isWished = (id) => items.some(i => i.id === id);
  return (
    <WishlistContext.Provider value={{ items, toggle, remove, isWished }}>
      {children}
    </WishlistContext.Provider>
  );
}

export const useWishlist = () => useContext(WishlistContext);
