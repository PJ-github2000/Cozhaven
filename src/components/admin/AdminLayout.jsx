import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Package, 
  Boxes,
  ShoppingBag, 
  Users, 
  Settings, 
  LogOut, 
  ChevronLeft,
  Bell,
  TrendingUp,
  UserCheck,
  Tag,
  ShieldCheck,
  FileText,
  BookOpen,
  Trophy,
  CreditCard,
  Users as CustomersIcon
} from 'lucide-react';
import { useEffect, useState } from 'react';
import '../../styles/admin-common.css';
import '../../styles/AdminPolish.css';
import './AdminLayout.css';
import { useAuth } from '../../context/AuthContext';
import { adminApi } from '../../services/adminApi.js';

export default function AdminLayout() {
  const { user, logout: authLogout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const role = user?.role || 'viewer';
  const [notificationSummary, setNotificationSummary] = useState({ pending_count: 0, stale_count: 0, recent_items: [], scope: role });
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const loadSummary = async () => {
      try {
        const summary = await adminApi.getNotificationSummary();
        if (isMounted) {
          setNotificationSummary(summary);
        }
      } catch {
        if (isMounted) {
          setNotificationSummary({ pending_count: 0, stale_count: 0, recent_items: [], scope: user?.role || 'viewer' });
        }
      }
    };

    loadSummary();

    const refreshHandler = () => {
      loadSummary();
    };
    window.addEventListener('admin-notifications-refresh', refreshHandler);

    return () => {
      isMounted = false;
      window.removeEventListener('admin-notifications-refresh', refreshHandler);
    };
  }, [location.pathname, user?.role]);

  const getPageTitle = () => {
    const path = location.pathname;
    if (path === '/admin') return 'Overview';
    if (path.includes('products')) return 'Product Manager';
    if (path.includes('inventory')) return 'Inventory Workbench';
    if (path.includes('promotions')) return 'Promotions';
    if (path.includes('approvals')) return 'Approvals';
    if (path.includes('orders')) return 'Order Management';
    if (path.includes('customers')) return 'Customer Directory';
    if (path.includes('analytics')) return 'Sales Analytics';
    if (path.includes('users')) return 'Team Management';
    if (path.includes('cms/pages')) return 'Page Management';
    if (path.includes('cms/blog')) return 'Blog Posts';
    if (path.includes('merchandising/campaigns')) return 'Marketing Campaigns';
    if (path.includes('merchandising/price-lists')) return 'Global Price Lists';
    return 'Dashboard';
  };

  const handleLogout = () => {
    authLogout();
    navigate('/'); 
  };

  const isAdmin = role === 'admin';
  const isManager = role === 'manager';
  const isViewer = role === 'viewer';
  const hasFullAccess = isAdmin;
  const hasEditAccess = isAdmin || isManager;

  return (
    <div className="admin-layout">
      {/* Sidebar */}
      <aside className="admin-sidebar">
        <div className="admin-sidebar__logo">
          <span>COZHAVEN</span>
          <span className="admin-tag">ADMIN</span>
        </div>

        <nav className="admin-nav">
          <NavLink to="/admin" end className={({ isActive }) => isActive ? 'admin-nav__link active' : 'admin-nav__link'}>
            <LayoutDashboard size={20} />
            <span>Overview</span>
          </NavLink>
          {hasFullAccess && (
            <NavLink to="/admin/analytics" className={({ isActive }) => isActive ? 'admin-nav__link active' : 'admin-nav__link'}>
              <TrendingUp size={20} />
              <span>Analytics</span>
            </NavLink>
          )}
          <NavLink to="/admin/products" className={({ isActive }) => isActive ? 'admin-nav__link active' : 'admin-nav__link'}>
            <Package size={20} />
            <span>Products</span>
          </NavLink>
          <NavLink to="/admin/inventory" className={({ isActive }) => isActive ? 'admin-nav__link active' : 'admin-nav__link'}>
            <Boxes size={20} />
            <span>Inventory</span>
          </NavLink>
          <NavLink to="/admin/promotions" className={({ isActive }) => isActive ? 'admin-nav__link active' : 'admin-nav__link'}>
            <Tag size={20} />
            <span>Promotions</span>
          </NavLink>
          {hasFullAccess && (
            <NavLink to="/admin/approvals" className={({ isActive }) => isActive ? 'admin-nav__link active' : 'admin-nav__link'}>
              <ShieldCheck size={20} />
              <span>Approvals</span>
            </NavLink>
          )}
          <NavLink to="/admin/orders" className={({ isActive }) => isActive ? 'admin-nav__link active' : 'admin-nav__link'}>
            <ShoppingBag size={20} />
            <span>Orders</span>
          </NavLink>
          {hasFullAccess && (
            <NavLink to="/admin/customers" className={({ isActive }) => isActive ? 'admin-nav__link active' : 'admin-nav__link'}>
              <UserCheck size={20} />
              <span>Customers</span>
            </NavLink>
          )}
          {hasFullAccess && (
            <NavLink to="/admin/users" className={({ isActive }) => isActive ? 'admin-nav__link active' : 'admin-nav__link'}>
              <Users size={20} />
              <span>Team</span>
            </NavLink>
          )}

          <div className="admin-nav__divider">Merchandising</div>
          
          <NavLink to="/admin/merchandising/campaigns" className={({ isActive }) => isActive ? 'admin-nav__link active' : 'admin-nav__link'}>
            <Trophy size={18} />
            <span>Campaigns</span>
          </NavLink>
          <NavLink to="/admin/merchandising/price-lists" className={({ isActive }) => isActive ? 'admin-nav__link active' : 'admin-nav__link'}>
            <CreditCard size={18} />
            <span>Price Lists</span>
          </NavLink>

          <div className="admin-nav__divider">Content</div>

          <NavLink to="/admin/cms/pages" className={({ isActive }) => isActive ? 'admin-nav__link active' : 'admin-nav__link'}>
            <FileText size={20} />
            <span>Pages</span>
          </NavLink>
          <NavLink to="/admin/cms/blog" className={({ isActive }) => isActive ? 'admin-nav__link active' : 'admin-nav__link'}>
            <BookOpen size={20} />
            <span>Blog</span>
          </NavLink>
        </nav>

        <div className="admin-sidebar__footer">
          {hasFullAccess && (
            <NavLink to="/admin/settings" className="admin-nav__link">
              <Settings size={20} />
              <span>Settings</span>
            </NavLink>
          )}
          <button onClick={handleLogout} className="admin-nav__link logout">
            <LogOut size={20} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="admin-main">
        <header className="admin-header">
          <div className="admin-header__left">
            <button onClick={() => navigate(-1)} className="admin-back-btn">
              <ChevronLeft size={20} />
            </button>
            <h1>{getPageTitle()}</h1>
          </div>
          <div className="admin-header__right">
            <button className="admin-icon-btn" onClick={() => setNotificationsOpen(prev => !prev)}>
              <Bell size={20} />
              {(notificationSummary.pending_count || notificationSummary.stale_count) > 0 && (
                <span className={`notification-badge ${notificationSummary.stale_count > 0 ? 'stale' : ''}`}>
                  {notificationSummary.pending_count}
                </span>
              )}
            </button>
            {notificationsOpen && (
              <div className="admin-notifications-popover">
                <div className="admin-notifications-popover__head">
                  <div>
                    <strong>{notificationSummary.pending_count} pending</strong>
                    <span>{notificationSummary.stale_count} stale</span>
                  </div>
                  {isAdmin && (
                    <button className="text-btn" onClick={() => { setNotificationsOpen(false); navigate('/admin/approvals'); }}>
                      Review Queue
                    </button>
                  )}
                </div>
                <div className="admin-notifications-popover__list">
                  {(notificationSummary.recent_items || []).length > 0 ? (
                    notificationSummary.recent_items.map(item => (
                      <button
                        key={item.id}
                        className="admin-notification-item"
                        onClick={() => {
                          setNotificationsOpen(false);
                          if (isAdmin) navigate('/admin/approvals');
                        }}
                      >
                        <div className="admin-notification-item__top">
                          <strong>{item.summary}</strong>
                          <span className={`status-pill ${item.is_stale ? 'archived' : item.status === 'pending' ? 'draft' : 'active'}`}>
                            {item.is_stale ? 'Stale' : item.status}
                          </span>
                        </div>
                        <div className="admin-notification-item__meta">
                          <span>{item.requested_by_name || 'Unknown'}</span>
                          <span>{item.created_at ? new Date(item.created_at).toLocaleString() : 'Just now'}</span>
                        </div>
                      </button>
                    ))
                  ) : (
                    <div className="admin-notifications-empty">No approval notifications.</div>
                  )}
                </div>
              </div>
            )}
            <div className="admin-profile">
              <div className="admin-avatar">{user?.first_name?.charAt(0) || 'A'}</div>
              <div className="admin-info">
                <span className="admin-name">{user?.first_name} {user?.last_name}</span>
                <span className="admin-role" style={{ textTransform: 'capitalize' }}>{role}</span>
              </div>
            </div>
          </div>
        </header>

        <section className="admin-content">
          <Outlet />
        </section>
      </main>
    </div>
  );
}
