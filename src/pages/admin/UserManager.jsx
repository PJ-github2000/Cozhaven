import { useState, useEffect } from 'react';
import { 
  Users, 
  Shield, 
  Mail, 
  Calendar, 
  RefreshCw, 
  Edit,
  Check,
  ChevronDown
} from 'lucide-react';
import { adminApi } from '../../services/adminApi.js';
import { useAuth } from '../../context/AuthContext';
import './UserManager.css';

const ROLES = ['admin', 'manager', 'viewer', 'customer'];

export default function UserManager() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [updatingUserId, setUpdatingUserId] = useState(null);
  const { user: currentUser } = useAuth();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const data = await adminApi.getUsers();
      setUsers(data);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchUsers();
  };

  const handleRoleChange = async (userId, newRole) => {
    setUpdatingUserId(userId);
    try {
      await adminApi.updateUserRole(userId, newRole);
      setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u));
    } catch (error) {
      alert(error.message);
    } finally {
      setUpdatingUserId(null);
    }
  };

  const roleColors = {
    admin: 'role-admin',
    manager: 'role-manager',
    viewer: 'role-viewer',
    customer: 'role-customer'
  };

  return (
    <div className="admin-page-container user-manager">
      {/* Header Stats */}
      <div className="order-stats-bar">
        <div className="order-stat-mini">
          <div className="mini-icon blue"><Users size={18} /></div>
          <div className="mini-info">
            <span className="label">Total Users</span>
            <span className="value">{users.length}</span>
          </div>
        </div>
        <div className="order-stat-mini">
          <div className="mini-icon gold"><Shield size={18} /></div>
          <div className="mini-info">
            <span className="label">Admins</span>
            <span className="value">{users.filter(u => u.role === 'admin').length}</span>
          </div>
        </div>
      </div>

      <div className="admin-actions-bar">
        <div className="admin-actions-left">
          <h2>Team Management</h2>
          <p>Assign roles and manage administrative access levels</p>
        </div>
        <div className="admin-actions-right">
          <button className="btn btn-secondary btn-icon" onClick={handleRefresh} title="Refresh Users">
            <RefreshCw size={18} className={isRefreshing ? 'spinning' : ''} />
          </button>
        </div>
      </div>

      <div className="admin-table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Member</th>
              <th>Email</th>
              <th>Current Role</th>
              <th>Access Level</th>
              <th>Joined Date</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="5" className="table-loading">Loading team directory...</td></tr>
            ) : users.map(u => (
              <tr key={u.id}>
                <td>
                  <div className="user-profile-cell">
                    <div className="user-avatar">{u.first_name.charAt(0)}</div>
                    <div className="user-info">
                      <span className="name">{u.first_name} {u.last_name}</span>
                      {u.id === currentUser.id && <span className="self-tag">(You)</span>}
                    </div>
                  </div>
                </td>
                <td>
                  <div className="email-link">
                    <Mail size={14} />
                    <span>{u.email}</span>
                  </div>
                </td>
                <td>
                  <span className={`role-pill ${roleColors[u.role]}`}>
                    {u.role.toUpperCase()}
                  </span>
                </td>
                <td>
                  <div className="role-selector-wrap">
                    <select 
                      className="role-selector"
                      value={u.role}
                      disabled={updatingUserId === u.id || u.id === currentUser.id}
                      onChange={(e) => handleRoleChange(u.id, e.target.value)}
                    >
                      {ROLES.map(r => (
                        <option key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</option>
                      ))}
                    </select>
                    <ChevronDown size={14} className="selector-icon" />
                    {updatingUserId === u.id && <div className="spinner-mini" />}
                  </div>
                </td>
                <td>
                  <div className="date-cell">
                    <Calendar size={14} />
                    <span>{new Date(u.created_at).toLocaleDateString()}</span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="role-definitions-footer">
        <div className="def-item"><strong>Admin:</strong> Full access to analytics, users, and all settings.</div>
        <div className="def-item"><strong>Manager:</strong> Can manage orders and inventory. No analytics or team management.</div>
        <div className="def-item"><strong>Viewer:</strong> Read-only access to operations. Cannot modify any data.</div>
      </div>
    </div>
  );
}
