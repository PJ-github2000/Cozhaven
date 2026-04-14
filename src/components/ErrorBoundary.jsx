import React from 'react';
import { Link } from 'react-router-dom';
import { RefreshCw, Home, AlertCircle } from 'lucide-react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.group('Cozhaven Application Error');
    console.error('Error:', error);
    console.error('ErrorInfo:', errorInfo);
    console.groupEnd();
    this.setState({ errorInfo });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={styles.container}>
          <div style={styles.card}>
            <div style={styles.iconWrapper}>
              <AlertCircle size={48} color="var(--charcoal-muted)" />
            </div>
            <h1 style={styles.title}>Something went wrong.</h1>
            <p style={styles.text}>
              We apologize for the inconvenience. A technical error occurred while rendering this page.
              Our team has been notified.
            </p>
            
            <div style={styles.actions}>
              <button 
                onClick={() => window.location.reload()} 
                style={styles.btnPrimary}
                className="btn-primary"
              >
                <RefreshCw size={18} />
                Refresh Page
              </button>
              <Link 
                to="/" 
                onClick={() => this.setState({ hasError: false })}
                style={styles.btnSecondary}
                className="btn-secondary"
              >
                <Home size={18} />
                Return Home
              </Link>
            </div>
            
            {import.meta.env.DEV && (
              <details style={styles.details} open>
                <summary style={styles.summary}>Error Details (Dev Only)</summary>
                <pre style={styles.pre}>{this.state.error?.toString()}</pre>
                <pre style={{...styles.pre, marginTop: 8}}>{this.state.errorInfo?.componentStack}</pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

const styles = {
  container: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '80vh',
    padding: '2rem',
    background: 'var(--soft-cream)',
    fontFamily: 'inherit'
  },
  card: {
    maxWidth: '500px',
    width: '100%',
    padding: '3rem',
    background: 'white',
    borderRadius: '1.5rem',
    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.05), 0 10px 10px -5px rgba(0, 0, 0, 0.01)',
    textAlign: 'center'
  },
  iconWrapper: {
    marginBottom: '1.5rem',
    display: 'inline-flex',
    padding: '1rem',
    borderRadius: '50%',
    background: 'rgba(201, 184, 168, 0.1)'
  },
  title: {
    fontSize: '2rem',
    fontWeight: '600',
    color: 'var(--charcoal)',
    marginBottom: '1rem'
  },
  text: {
    fontSize: '1rem',
    lineHeight: '1.6',
    color: 'var(--charcoal-muted)',
    marginBottom: '2.5rem'
  },
  actions: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem'
  },
  btnPrimary: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem',
    width: '100%',
    padding: '1rem',
    border: 'none',
    cursor: 'pointer',
    fontSize: '0.9rem',
    fontWeight: '500'
  },
  btnSecondary: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem',
    width: '100%',
    padding: '1rem',
    cursor: 'pointer',
    fontSize: '0.9rem',
    fontWeight: '500',
    textDecoration: 'none'
  },
  details: {
    marginTop: '2rem',
    textAlign: 'left'
  },
  summary: {
    fontSize: '0.8rem',
    color: 'var(--charcoal-muted)',
    cursor: 'pointer',
    padding: '0.5rem 0'
  },
  pre: {
    fontSize: '0.75rem',
    background: '#f8f9fa',
    padding: '1rem',
    borderRadius: '0.5rem',
    overflowX: 'auto',
    color: '#e03131',
    marginTop: '0.5rem'
  }
};

export default ErrorBoundary;
