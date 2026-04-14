import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, User, ArrowLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './AuthPages.css';

export default function SignupPage() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await register(formData.email, formData.password, formData.firstName, formData.lastName);
      navigate('/');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="auth-page">
      <motion.div 
        className="auth-page-container"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <Link to="/" className="auth-page-back">
          <ArrowLeft size={18} />
          Back to Home
        </Link>

        <div className="auth-page-card">
          <div className="auth-page-header">
            <h1>Create Account</h1>
            <p>Join us to get started</p>
          </div>

          {error && (
            <div className="auth-page-error">{error}</div>
          )}

          <form onSubmit={handleSubmit} className="auth-page-form">
            <div className="form-row">
              <div className="form-group">
                <label>
                  <User size={18} />
                  First Name
                </label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  required
                  placeholder="John"
                />
              </div>

              <div className="form-group">
                <label>
                  <User size={18} />
                  Last Name
                </label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  required
                  placeholder="Doe"
                />
              </div>
            </div>

            <div className="form-group">
              <label>
                <Mail size={18} />
                Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="you@example.com"
              />
            </div>

            <div className="form-group">
              <label>
                <Lock size={18} />
                Password
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                placeholder="••••••••"
                minLength={6}
              />
            </div>

            <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>

          <div className="auth-page-switch">
            <p>
              Already have an account?{' '}
              <Link to="/login" className="auth-page-link">
                Sign In
              </Link>
            </p>
          </div>

          <div className="auth-page-guest">
            <Link to="/checkout" className="auth-page-link-muted">
              Continue as Guest
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
