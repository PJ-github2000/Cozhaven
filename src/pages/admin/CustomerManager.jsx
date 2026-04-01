import { useState, useEffect } from 'react';
import { 
  MoreVertical,
  ChevronRight,
  Download,
  RefreshCw,
  Users,
  Mail,
  UserCheck,
  X,
  ExternalLink,
  ShoppingBag,
  TrendingUp,
  Clock,
  Calendar,
  Search
} from 'lucide-react';
import { adminApi } from '../../services/adminApi.js';
import './CustomerManager.css';

export default function CustomerManager() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      if (isRefreshing) setIsRefreshing(true);
      const data = await adminApi.getCustomers();
      setCustomers(data);
    } catch (error) {
      console.error('Error fetching customers:', error);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  const handleViewCustomer = async (customerId) => {
    setModalLoading(true);
    try {
      const details = await adminApi.getCustomer(customerId);
      setSelectedCustomer(details);
    } catch (error) {
      console.error('Error fetching customer details:', error);
    } finally {
      setModalLoading(false);
    }
  };

  const stats = {
    total: customers.length,
    vips: customers.filter(c => c.ltv > 1000).length,
    newThisMonth: customers.filter(c => {
      const date = new Date(c.joined_at);
      const now = new Date();
      return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
    }).length,
    avgLTV: customers.length ? customers.reduce((acc, c) => acc + (c.ltv || 0), 0) / customers.length : 0
  };

  const filteredCustomers = customers.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredCustomers.length && filteredCustomers.length > 0) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredCustomers.map(c => c.id));
    }
  };

  const toggleSelectOne = (id) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleExport = () => {
    const headers = ['ID', 'Name', 'Email', 'Joined Date', 'Order Count', 'LTV'];
    const rows = filteredCustomers.map(c => [
      c.id,
      `"${c.name}"`,
      c.email,
      c.joined_at,
      c.order_count,
      c.ltv
    ]);

    const csvContent = [headers, ...rows].map(r => r.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cozhaven_customers_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleBulkEmail = () => {
    const emails = customers.filter(c => selectedIds.includes(c.id)).map(c => c.email).join(',');
    window.location.href = `mailto:${emails}`;
    setSelectedIds([]);
  };

  return (
    <div className="admin-page-container customer-manager">
      <div className="order-stats-bar cust-stats">
        <div className="order-stat-mini">
          <div className="mini-icon blue"><Users size={18} /></div>
          <div className="mini-info">
            <span className="label">Total Customers</span>
            <span className="value">{stats.total}</span>
          </div>
        </div>
        <div className="order-stat-mini">
          <div className="mini-icon green"><TrendingUp size={18} /></div>
          <div className="mini-info">
            <span className="label">Average LTV</span>
            <span className="value">${stats.avgLTV.toFixed(0)}</span>
          </div>
        </div>
        <div className="order-stat-mini">
          <div className="mini-icon orange"><UserCheck size={18} /></div>
          <div className="mini-info">
            <span className="label">VIP Segments</span>
            <span className="value">{stats.vips}</span>
          </div>
        </div>
        <div className="order-stat-mini">
          <div className="mini-icon purple"><Clock size={18} /></div>
          <div className="mini-info">
            <span className="label">New (Month)</span>
            <span className="value">{stats.newThisMonth}</span>
          </div>
        </div>
      </div>

      <div className="admin-actions-bar">
        <div className="admin-actions-right" style={{ flex: 1 }}>
          <div className="admin-search-wrap" style={{ maxWidth: '400px', width: '100%' }}>
            <Search size={18} className="search-icon" />
            <input 
              type="text" 
              placeholder="Search by name or email..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="admin-search-input"
            />
          </div>
        </div>
        <div className="admin-actions-right">
          <button 
            className="btn btn-secondary btn-icon" 
            onClick={() => { setIsRefreshing(true); fetchCustomers(); }}
            title="Refresh Customers"
          >
            <RefreshCw size={18} className={isRefreshing ? 'spinning' : ''} />
          </button>
          <button className="admin-btn admin-btn-secondary" onClick={handleExport}>
            <Download size={18} />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Bulk Action Bar */}
      {selectedIds.length > 0 && (
        <div className="selection-bar">
          <div className="selection-info">
            <span className="count">{selectedIds.length} customers selected</span>
            <button className="text-btn" onClick={() => setSelectedIds([])}>Clear selection</button>
          </div>
          <div className="selection-actions">
            <button className="selection-btn secondary" onClick={handleBulkEmail}>
              <Mail size={16} />
              <span>Bulk Email</span>
            </button>
          </div>
        </div>
      )}

      <div className="admin-table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th className="checkbox-cell">
                <input 
                  type="checkbox" 
                  checked={selectedIds.length === filteredCustomers.length && filteredCustomers.length > 0}
                  onChange={toggleSelectAll}
                />
              </th>
              <th>Customer</th>
              <th>Joined Date</th>
              <th>Orders</th>
              <th>Total Spent (LTV)</th>
              <th>Segment</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="6" className="table-loading">Loading customer profiles...</td></tr>
            ) : filteredCustomers.length === 0 ? (
              <tr><td colSpan="6" className="table-empty">No customers found.</td></tr>
            ) : filteredCustomers.map(customer => (
              <tr key={customer.id} className={selectedIds.includes(customer.id) ? 'selected' : ''}>
                <td className="checkbox-cell">
                  <input 
                    type="checkbox" 
                    checked={selectedIds.includes(customer.id)}
                    onChange={() => toggleSelectOne(customer.id)}
                  />
                </td>
                <td>
                  <div className="customer-cell">
                    <div className="customer-avatar">
                      {customer.name.charAt(0)}
                    </div>
                    <div className="customer-info">
                      <span className="name">{customer.name}</span>
                      <span className="email">{customer.email}</span>
                    </div>
                  </div>
                </td>
                <td>
                  <div className="date-cell">
                    <Calendar size={14} />
                    <span>{customer.joined_at ? new Date(customer.joined_at).toLocaleDateString() : 'New'}</span>
                  </div>
                </td>
                <td>
                  <div className="orders-count">
                    <strong>{customer.order_count}</strong>
                    <span>orders</span>
                  </div>
                </td>
                <td>
                  <div className="ltv-cell">
                    <TrendingUp size={14} className="ltv-icon" />
                    <span className="amount">${(customer.ltv || 0).toLocaleString()}</span>
                  </div>
                </td>
                <td>
                  <span className={`segment-pill ${customer.ltv > 1000 ? 'vip' : 'standard'}`}>
                    {customer.ltv > 1000 ? 'VIP' : 'Standard'}
                  </span>
                </td>
                <td>
                  <div className="table-actions">
                    <button 
                      className="admin-icon-btn" 
                      aria-label="View customer profile"
                      onClick={() => handleViewCustomer(customer.id)}
                    >
                      <ChevronRight size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Customer Profile Modal */}
      {selectedCustomer && (
        <div className="admin-modal-overlay">
          <div className="admin-modal details-modal">
            <div className="modal-header">
              <div className="header-info">
                <h2>Customer Profile <span>#{selectedCustomer.id}</span></h2>
                <div className={`segment-pill ${selectedCustomer.ltv > 1000 ? 'vip' : 'standard'}`}>
                  {selectedCustomer.ltv > 1000 ? 'VIP Member' : 'Standard Member'}
                </div>
              </div>
              <button className="close-btn" onClick={() => setSelectedCustomer(null)}><X size={24} /></button>
            </div>

            <div className="details-grid">
              <div className="details-main">
                <section className="details-section">
                  <h3><ShoppingBag size={18} /> Order History</h3>
                  <div className="customer-orders-list">
                    {selectedCustomer.orders.length === 0 ? (
                      <p className="empty-msg">No orders placed yet.</p>
                    ) : (
                      <table className="mini-order-table">
                        <thead>
                          <tr>
                            <th>Order ID</th>
                            <th>Date</th>
                            <th>Amount</th>
                            <th>Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {selectedCustomer.orders.map(order => (
                            <tr key={order.id}>
                              <td>#{1000 + order.id}</td>
                              <td>{new Date(order.created_at).toLocaleDateString()}</td>
                              <td className="bold">${order.total_amount.toLocaleString()}</td>
                              <td><span className={`mini-status ${order.status}`}>{order.status}</span></td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                </section>
              </div>

              <aside className="details-sidebar">
                <section className="details-section">
                  <h3><Users size={18} /> Basic Info</h3>
                  <div className="sidebar-info">
                    <div className="sidebar-avatar">
                      {selectedCustomer.name.charAt(0)}
                    </div>
                    <strong>{selectedCustomer.name}</strong>
                    <p>{selectedCustomer.email}</p>
                    <span className="meta">Customer since {new Date(selectedCustomer.joined_at).toLocaleDateString()}</span>
                  </div>
                </section>

                <section className="details-section">
                  <h3><TrendingUp size={18} /> Lifetime Statistics</h3>
                  <div className="stat-cards-mini">
                    <div className="stat-card">
                      <span className="label">Total Spent</span>
                      <span className="value">${selectedCustomer.ltv.toLocaleString()}</span>
                    </div>
                    <div className="stat-card">
                      <span className="label">Total Orders</span>
                      <span className="value">{selectedCustomer.order_count}</span>
                    </div>
                  </div>
                </section>

                <section className="details-section contact-actions">
                  <h3>Communication</h3>
                  <button className="admin-btn admin-btn-secondary wide" onClick={() => window.location.href=`mailto:${selectedCustomer.email}`}>
                    <Mail size={16} />
                    <span>Send Email</span>
                  </button>
                </section>
              </aside>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
