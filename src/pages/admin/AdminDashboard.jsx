import { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  ShoppingBag, 
  Users, 
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
  Clock
} from 'lucide-react';
import { adminApi } from '../../services/adminApi.js';
import './AdminDashboard.css';
import '../../styles/AdminPolish.css';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    revenue: 0,
    orders_count: 0,
    customers_count: 0,
    low_stock_count: 0
  });
  const [loading, setLoading] = useState(true);
  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
    fetchStats();
    fetchAlerts();
  }, []);

  const fetchStats = async () => {
    try {
      const data = await adminApi.getStats();
      setStats(data);
    } catch (error) {
      console.error('Error fetching admin stats:', error);
    } finally {
      // stats loading handled by global loading if needed,
      // but here we just toggle local loading when both are done
    }
  };

  const fetchAlerts = async () => {
    try {
      const data = await adminApi.getInventoryAlerts();
      setAlerts(data.items || []);
    } catch (error) {
      console.error('Error fetching alerts:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="table-loading">Loading Dashboard Statistics...</div>;

  return (
    <div className="admin-page-container admin-overview">
      {/* KPI Cards */}
      <div className="admin-stats-grid">
        <div className="admin-stat-card">
          <div className="admin-stat-card__head">
            <div className="stat-icon revenue"><TrendingUp size={24} /></div>
            <span className="stat-trend up"><ArrowUpRight size={16} /> 12%</span>
          </div>
          <div className="admin-stat-card__body">
            <h3>Total Revenue</h3>
            <p>${stats.revenue?.toLocaleString() || '0'}</p>
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="admin-stat-card__head">
            <div className="stat-icon orders"><ShoppingBag size={24} /></div>
            <span className="stat-trend up"><ArrowUpRight size={16} /> 8%</span>
          </div>
          <div className="admin-stat-card__body">
            <h3>Total Orders</h3>
            <p>{stats.orders_count}</p>
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="admin-stat-card__head">
            <div className="stat-icon customers"><Users size={24} /></div>
            <span className="stat-trend down"><ArrowDownRight size={16} /> 2%</span>
          </div>
          <div className="admin-stat-card__body">
            <h3>Customers</h3>
            <p>{stats.customers_count}</p>
          </div>
        </div>

        <div className="admin-stat-card warning">
          <div className="admin-stat-card__head">
            <div className="stat-icon stock"><AlertTriangle size={24} /></div>
          </div>
          <div className="admin-stat-card__body">
            <h3>Low Stock Items</h3>
            <p>{stats.low_stock_count}</p>
          </div>
          <div className="stat-footer">Requires Attention</div>
        </div>
      </div>

      <div className="admin-dashboard-layout">
        <section className="admin-section-card recent-activity">
          <div className="section-head">
            <h2>Recent Activity</h2>
            <button className="text-btn">View All</button>
          </div>
          <div className="activity-list">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="activity-item">
                <div className="activity-icon"><Clock size={16} /></div>
                <div className="activity-details">
                  <p><strong>Order #102{i}</strong> was placed by John Doe</p>
                  <span>{i * 15} minutes ago</span>
                </div>
                <div className="activity-amount">$1,240.00</div>
              </div>
            ))}
          </div>
        </section>

        <section className="admin-section-card inventory-preview">
          <div className="section-head">
            <h2>Stock Highlights</h2>
          </div>
          <div className="stock-highlights">
            {alerts.length > 0 ? (
              alerts.slice(0, 5).map(item => (
                <div key={item.id} className={`stock-item ${item.stock <= 2 ? 'critical' : item.stock < 10 ? 'warning' : ''}`}>
                  <div className="stock-item-info">
                    <span>{item.name}</span>
                    <span>{item.stock} in stock</span>
                  </div>
                  <div className="progress-bar-v2">
                    <div 
                      className="progress-v2" 
                      style={{ width: `${Math.min(100, (item.stock / 10) * 100)}%` }}
                    ></div>
                  </div>
                </div>
              ))
            ) : (
              <div className="stock-empty-state">
                <p>All inventory levels are healthy.</p>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
