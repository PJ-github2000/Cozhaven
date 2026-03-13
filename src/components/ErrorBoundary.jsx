import { Component } from 'react';

/**
 * Error Boundary Component
 * Catches JavaScript errors anywhere in the component tree
 * 
 * Usage:
 * Wrap your app or specific components with <ErrorBoundary>
 */
export class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render shows the fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // Log error to console (in production, send to error tracking service)
    console.error('🔴 Error caught by boundary:', error, errorInfo);
    
    // You can send to error tracking services here
    // Example: Sentry.captureException(error, { extra: errorInfo });
    
    this.setState({ errorInfo });
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary-fallback" style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 'var(--space-6)',
          background: 'var(--soft-cream)',
          textAlign: 'center'
        }}>
          <div style={{ maxWidth: '500px' }}>
            <h1 style={{ 
              fontSize: '2rem', 
              color: 'var(--deep-charcoal)',
              marginBottom: 'var(--space-3)'
            }}>
              Oops! Something went wrong
            </h1>
            
            <p style={{ 
              color: 'var(--charcoal-muted)',
              marginBottom: 'var(--space-4)',
              lineHeight: 1.6
            }}>
              We're sorry for the inconvenience. Our team has been notified and we're working on fixing it.
            </p>

            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details style={{
                background: 'var(--warm-white)',
                padding: 'var(--space-3)',
                borderRadius: 'var(--radius-lg)',
                textAlign: 'left',
                marginBottom: 'var(--space-4)',
                fontSize: '0.85rem'
              }}>
                <summary style={{ 
                  cursor: 'pointer', 
                  color: 'var(--error)',
                  fontWeight: 600,
                  marginBottom: 'var(--space-2)'
                }}>
                  Error Details (Development Only)
                </summary>
                <pre style={{ 
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word',
                  color: 'var(--charcoal-muted)',
                  marginTop: 'var(--space-2)'
                }}>
                  {this.state.error.toString()}
                  {this.state.errorInfo?.componentStack}
                </pre>
              </details>
            )}

            <div style={{ display: 'flex', gap: 'var(--space-2)', justifyContent: 'center' }}>
              <button
                onClick={this.handleReset}
                className="btn btn-primary"
                style={{
                  padding: '0 var(--space-4)',
                  height: '48px'
                }}
              >
                Reload Page
              </button>
              
              <button
                onClick={() => window.history.back()}
                className="btn btn-secondary"
                style={{
                  padding: '0 var(--space-4)',
                  height: '48px'
                }}
              >
                Go Back
              </button>
            </div>

            <div style={{
              marginTop: 'var(--space-5)',
              paddingTop: 'var(--space-4)',
              borderTop: '1px solid var(--taupe-light)'
            }}>
              <p style={{ fontSize: '0.85rem', color: 'var(--charcoal-muted)' }}>
                Need immediate help?{' '}
                <a 
                  href="mailto:hello@cozhaven.ca" 
                  style={{ color: 'var(--rich-bronze)', textDecoration: 'underline' }}
                >
                  Contact Support
                </a>
              </p>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
