import { useState, createContext, useContext, useEffect } from 'react';
import { API_BASE } from '../services/apiConfig.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Validate current session against the server on page load
    const userData = localStorage.getItem('user');
    
    if (userData) {
      // Verify session via HttpOnly cookie by calling /api/auth/me
      fetch(`${API_BASE}/auth/me`, {
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' }
      })
        .then(res => {
          if (!res.ok) throw new Error('Session invalid');
          return res.json();
        })
        .then(serverUser => {
          const updatedUser = {
            id: serverUser.id,
            email: serverUser.email,
            first_name: serverUser.first_name,
            role: serverUser.role
          };
          localStorage.setItem('user', JSON.stringify(updatedUser));
          setUser(updatedUser);
          setLoading(false);
        })
        .catch(() => {
          // Session invalid — clear local cache
          localStorage.removeItem('user');
          setUser(null);
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, []);

  const register = async (email, password, firstName, lastName) => {
    const response = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, first_name: firstName, last_name: lastName }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Registration failed');
    }

    const data = await response.json();
    const newUser = { 
      id: data.user_id, 
      email, 
      first_name: firstName,
      role: data.role
    };
    localStorage.setItem('user', JSON.stringify(newUser));
    setUser(newUser);
    
    return data;
  };

  const login = async (email, password) => {
    const response = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Login failed');
    }

    const data = await response.json();
    const loggedUser = { 
      id: data.user_id, 
      email: data.email, 
      first_name: data.first_name,
      role: data.role
    };
    localStorage.setItem('user', JSON.stringify(loggedUser));
    setUser(loggedUser);
    
    return data;
  };

  const logout = async () => {
    try {
      await fetch(`${API_BASE}/auth/logout`, { 
        method: 'POST',
        credentials: 'include'
      });
    } finally {
      localStorage.removeItem('user');
      setUser(null);
    }
  };

  const value = {
    user,
    loading,
    register,
    login,
    logout,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin' || user?.role === 'manager' || user?.role === 'viewer',
    role: user?.role
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
