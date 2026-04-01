import { useState, useEffect } from 'react';
import { 
  ExternalLink,
  ChevronDown,
  Calendar,
  Search,
  RefreshCw,
  ShoppingBag,
  Clock,
  DollarSign,
  X,
  Package,
  MapPin,
  CreditCard,
  Users,
  Download
} from 'lucide-react';
import { adminApi } from '../../services/adminApi.js';
import ProductFormModal from '../../components/admin/ProductFormModal';
import OrderInvoice from '../../components/OrderInvoice';
import './OrderManager.css';

export default function OrderManager() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const data = await adminApi.getOrders();
      setOrders(data);
    } catch (error) {
      console.error('Error fetching admin orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const totals = {
    revenue: orders.reduce((acc, o) => o.status !== 'cancelled' ? acc + o.total_amount : acc, 0),
    count: orders.length,
    pending: orders.filter(o => o.status === 'pending').length
  };

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await adminApi.updateOrderStatus(orderId, newStatus);
      setOrders(orders.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder({ ...selectedOrder, status: newStatus });
      }
    } catch (error) {
      console.error('Error updating order status:', error);
    }
  };

  const handleViewDetails = async (orderId) => {
    setModalLoading(true);
    try {
      const details = await adminApi.getOrder(orderId);
      setSelectedOrder(details);
    } catch (error) {
      console.error('Error fetching order details:', error);
    } finally {
      setModalLoading(false);
    }
  };

  const filteredOrders = orders.filter(o => {
    const matchesStatus = filterStatus === 'all' || o.status === filterStatus;
    const orderIdStr = (1000 + o.id).toString();
    const matchesSearch = o.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          o.user_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          orderIdStr.includes(searchTerm);
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="admin-page-container order-manager">
      <div className="order-stats-bar">
        <div className="order-stat-mini">
          <div className="mini-icon green"><DollarSign size={18} /></div>
          <div className="mini-info">
            <span className="label">Total Revenue</span>
            <span className="value">${totals.revenue.toLocaleString()}</span>
          </div>
        </div>
        <div className="order-stat-mini">
          <div className="mini-icon blue"><ShoppingBag size={18} /></div>
          <div className="mini-info">
            <span className="label">Total Orders</span>
            <span className="value">{totals.count}</span>
          </div>
        </div>
        <div className="order-stat-mini">
          <div className="mini-icon orange"><Clock size={18} /></div>
          <div className="mini-info">
            <span className="label">Orders Pending</span>
            <span className="value">{totals.pending}</span>
          </div>
        </div>
      </div>

      <div className="admin-actions-bar">
        <div className="status-tabs">
          {['all', 'pending', 'processing', 'shipped', 'delivered', 'cancelled'].map(status => (
            <button 
              key={status}
              className={`status-tab ${filterStatus === status ? 'active' : ''}`}
              onClick={() => setFilterStatus(status)}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>
        
        <div className="admin-actions-right">
          <div className="admin-search-wrap">
            <Search size={18} className="search-icon" />
            <input 
              type="text" 
              placeholder="Search by ID or customer..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="admin-search-input"
            />
          </div>
          <button 
            className="btn btn-secondary btn-icon" 
            onClick={() => { setLoading(true); fetchOrders(); }}
            title="Refresh Orders"
          >
            <RefreshCw size={18} className={loading ? 'spinning' : ''} />
          </button>
        </div>
      </div>

      <div className="admin-table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Customer</th>
              <th>Date</th>
              <th>Total</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="6" className="table-loading">Loading orders...</td></tr>
            ) : filteredOrders.length === 0 ? (
              <tr><td colSpan="6" className="table-empty">No orders found.</td></tr>
            ) : filteredOrders.map(order => (
              <tr key={order.id}>
                <td>
                  <div className="order-id">
                    <strong>#{1000 + order.id}</strong>
                  </div>
                </td>
                <td>
                  <div className="customer-cell">
                    <span className="name">{order.customer_name}</span>
                    <span className="email">{order.user_email}</span>
                  </div>
                </td>
                <td>
                  <div className="date-cell">
                    <Calendar size={14} />
                    <span>{new Date(order.created_at).toLocaleDateString()}</span>
                  </div>
                </td>
                <td>
                  <div className="total-cell">
                    <span className="amount">${order.total_amount.toLocaleString()}</span>
                    <span className="method">{order.payment_method}</span>
                  </div>
                </td>
                <td>
                  <div className="status-select-wrap">
                    <select 
                      className={`status-selector ${order.status}`}
                      value={order.status}
                      onChange={(e) => handleStatusChange(order.id, e.target.value)}
                    >
                      <option value="pending">Pending</option>
                      <option value="processing">Processing</option>
                      <option value="shipped">Shipped</option>
                      <option value="delivered">Delivered</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                    <ChevronDown size={14} className="select-arrow" />
                  </div>
                </td>
                <td>
                  <div className="table-actions">
                    <button 
                      className="admin-icon-btn" 
                      aria-label="View order details"
                      onClick={() => handleViewDetails(order.id)}
                    >
                      <ExternalLink size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="admin-modal-overlay">
          <div className="admin-modal details-modal">
            <div className="modal-header">
              <div className="header-info">
                <h2>Order Details <span>#{1000 + selectedOrder.id}</span></h2>
                <div className={`status-badge ${selectedOrder.status}`}>{selectedOrder.status}</div>
              </div>
              <div className="header-actions">
                <button 
                  className="btn btn-secondary btn-sm" 
                  onClick={() => window.print()}
                  title="Print Invoice"
                >
                  <Download size={16} /> Invoice
                </button>
                <button className="close-btn" onClick={() => setSelectedOrder(null)}><X size={24} /></button>
              </div>
            </div>

            <div className="modal-body-scroll">
              <div className="invoice-print-only">
                <OrderInvoice order={selectedOrder} />
              </div>
              <div className="details-grid no-print">
              <div className="details-main">
                <section className="details-section">
                  <h3><Package size={18} /> Order Items</h3>
                  <div className="items-list">
                    {selectedOrder.items.map(item => (
                      <div key={item.id} className="detail-item">
                        <div className="item-img">
                          <img src={item.image} alt={item.product_name} />
                        </div>
                        <div className="item-info">
                          <h4>{item.product_name}</h4>
                          <div className="item-meta">
                            {item.color && <span>Color: {item.color}</span>}
                            {item.size && <span>Size: {item.size}</span>}
                          </div>
                        </div>
                        <div className="item-price-qty">
                          <div className="qty">× {item.quantity}</div>
                          <div className="price">${item.price.toLocaleString()}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="order-summary-mini">
                    <div className="summary-row">
                      <span>Subtotal</span>
                      <span>${selectedOrder.total_amount.toLocaleString()}</span>
                    </div>
                    <div className="summary-row">
                      <span>Shipping</span>
                      <span className="free">FREE</span>
                    </div>
                    <div className="summary-row total">
                      <span>Total</span>
                      <span>${selectedOrder.total_amount.toLocaleString()}</span>
                    </div>
                  </div>
                </section>
              </div>

              <aside className="details-sidebar">
                <section className="details-section">
                  <h3><Users size={18} /> Customer Info</h3>
                  <div className="sidebar-info">
                    <strong>{selectedOrder.customer_name}</strong>
                    <p>{selectedOrder.user_email}</p>
                    <span className="meta">Internal ID: USR-{selectedOrder.user_id}</span>
                  </div>
                </section>

                <section className="details-section">
                  <h3><MapPin size={18} /> Shipping Address</h3>
                  <div className="sidebar-info">
                    <p>{selectedOrder.shipping_address}</p>
                  </div>
                </section>

                <section className="details-section">
                  <h3><CreditCard size={18} /> Payment</h3>
                  <div className="sidebar-info">
                    <p>{selectedOrder.payment_method}</p>
                    <div className="payment-status">Paid Via Secured Gateway</div>
                  </div>
                </section>

                <section className="details-section actions">
                  <h3>Update Status</h3>
                  <select 
                    className={`status-selector wide ${selectedOrder.status}`}
                    value={selectedOrder.status}
                    onChange={(e) => handleStatusChange(selectedOrder.id, e.target.value)}
                  >
                    <option value="pending">Pending</option>
                    <option value="processing">Processing</option>
                    <option value="shipped">Shipped</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </section>
              </aside>
            </div>
          </div>
        </div>
      </div>
    )}
    </div>
  );
}
