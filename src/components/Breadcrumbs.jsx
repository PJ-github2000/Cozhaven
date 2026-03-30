import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import './Breadcrumbs.css';

export default function Breadcrumbs({ items }) {
  if (!items || items.length === 0) return null;

  return (
    <nav className="breadcrumbs" aria-label="Breadcrumb">
      <div className="container">
        <ol className="breadcrumbs__list">
          <li className="breadcrumbs__item">
            <Link to="/">Home</Link>
          </li>
          {items.map((item, index) => (
            <li key={index} className="breadcrumbs__item">
              <ChevronRight size={14} className="breadcrumbs__icon" />
              {item.link ? (
                <Link to={item.link}>{item.label}</Link>
              ) : (
                <span className="breadcrumbs__current" aria-current="page">
                  {item.label}
                </span>
              )}
            </li>
          ))}
        </ol>
      </div>
    </nav>
  );
}
