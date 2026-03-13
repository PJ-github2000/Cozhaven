import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

export default function Breadcrumbs() {
  const location = useLocation();
  const pathnames = location.pathname.split('/').filter(x => x);

  // Don't show on homepage
  if (pathnames.length === 0) return null;

  const formatName = (name) => {
    // Handle URL parameters
    if (name.includes('?')) {
      name = name.split('?')[0];
    }
    
    // Capitalize and replace hyphens with spaces
    return name
      .replace(/-/g, ' ')
      .replace(/\b\w/g, l => l.toUpperCase());
  };

  return (
    <nav className="breadcrumbs-nav" aria-label="Breadcrumb">
      <div className="container">
        <ol className="breadcrumbs-list">
          {/* Home */}
          <li className="breadcrumb-item">
            <Link to="/" className="breadcrumb-link">
              <Home size={14} />
              <span>Home</span>
            </Link>
          </li>

          {pathnames.map((name, index) => {
            const routeTo = `/${pathnames.slice(0, index + 1).join('/')}`;
            const isLast = index === pathnames.length - 1;
            const displayName = formatName(name);

            return (
              <li key={routeTo} className="breadcrumb-item">
                <span className="breadcrumb-separator">
                  <ChevronRight size={14} />
                </span>
                
                {isLast ? (
                  <span className="breadcrumb-current" aria-current="page">
                    {displayName}
                  </span>
                ) : (
                  <Link to={routeTo} className="breadcrumb-link">
                    {displayName}
                  </Link>
                )}
              </li>
            );
          })}
        </ol>
      </div>
    </nav>
  );
}
