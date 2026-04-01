import { useEffect, useState } from 'react';
import { Check, RefreshCw, ShieldCheck, X } from 'lucide-react';
import { adminApi } from '../../services/adminApi.js';
import { useToast } from '../../context/ToastContext';
import '../../styles/AdminPolish.css';
import './ApprovalsManager.css';

export default function ApprovalsManager() {
  const [approvals, setApprovals] = useState([]);
  const [summary, setSummary] = useState({ pending_count: 0, stale_count: 0 });
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [statusFilter, setStatusFilter] = useState('pending');
  const [staleOnly, setStaleOnly] = useState(false);
  const [selectedApproval, setSelectedApproval] = useState(null);
  const [reviewNotes, setReviewNotes] = useState('');
  const [processingAction, setProcessingAction] = useState(null);
  const { addToast } = useToast();

  useEffect(() => {
    fetchApprovals();
  }, [statusFilter, staleOnly]);

  const fetchApprovals = async () => {
    try {
      setLoading(true);
      const [data, notificationSummary] = await Promise.all([
        adminApi.getApprovalRequests({ status: statusFilter, stale_only: staleOnly, limit: 50 }),
        adminApi.getNotificationSummary()
      ]);
      const nextItems = data.items || [];
      setApprovals(nextItems);
      setSummary(notificationSummary || { pending_count: 0, stale_count: 0 });
      setSelectedApproval(prev => {
        if (!prev) return nextItems[0] || null;
        return nextItems.find(item => item.id === prev.id) || nextItems[0] || null;
      });
    } catch (error) {
      addToast(error.message || 'Failed to load approval requests', 'error');
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  const handleDecision = async (approvalId, action) => {
    try {
      setProcessingAction(`${action}:${approvalId}`);
      const result = action === 'approve'
        ? await adminApi.approveApprovalRequest(approvalId, { review_notes: reviewNotes.trim() || null })
        : await adminApi.rejectApprovalRequest(approvalId, { review_notes: reviewNotes.trim() || null });
      setApprovals(prev => prev.map(item => (item.id === approvalId ? result : item)));
      setSelectedApproval(result);
      setReviewNotes('');
      window.dispatchEvent(new CustomEvent('admin-notifications-refresh'));
      addToast(action === 'approve' ? 'Request approved' : 'Request rejected', 'success');
      if (statusFilter === 'pending') {
        await fetchApprovals();
      }
    } catch (error) {
      addToast(error.message || `Failed to ${action} request`, 'error');
    } finally {
      setProcessingAction(null);
    }
  };

  return (
    <div className="admin-page-container approvals-manager">
      <div className="inv-stats">
        <div className="order-stat-mini">
          <div className="mini-icon blue"><ShieldCheck size={20} /></div>
          <div className="mini-info">
            <span className="label">Visible Requests</span>
            <span className="value">{approvals.length}</span>
          </div>
        </div>
        <div className="order-stat-mini">
          <div className="mini-icon orange"><ShieldCheck size={20} /></div>
          <div className="mini-info">
            <span className="label">Pending</span>
            <span className="value">{summary.pending_count}</span>
          </div>
        </div>
        <div className="order-stat-mini">
          <div className="mini-icon red"><ShieldCheck size={20} /></div>
          <div className="mini-info">
            <span className="label">Stale</span>
            <span className="value">{summary.stale_count}</span>
          </div>
        </div>
      </div>

      <div className="admin-actions-bar">
        <div className="admin-actions-left approvals-filters">
          <select className="admin-input approvals-filter-select" value={statusFilter} onChange={event => setStatusFilter(event.target.value)}>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
            <option value="all">All Requests</option>
          </select>
          <label className="approvals-stale-toggle">
            <input type="checkbox" checked={staleOnly} onChange={event => setStaleOnly(event.target.checked)} />
            <span>Stale Only</span>
          </label>
        </div>
        <div className="admin-actions-right">
          <button className="btn btn-secondary btn-icon" onClick={() => { setIsRefreshing(true); fetchApprovals(); }}>
            <RefreshCw size={18} className={isRefreshing ? 'spinning' : ''} />
          </button>
        </div>
      </div>

      <div className="approvals-layout">
        <section className="admin-section-card">
          <div className="section-head">
            <h2>Approval Queue</h2>
            <span className="section-meta">{statusFilter}</span>
          </div>
          <div className="admin-table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Summary</th>
                  <th>Action</th>
                  <th>Requested By</th>
                  <th>Status</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan="5" className="table-loading">Loading approval requests...</td></tr>
                ) : approvals.length === 0 ? (
                  <tr><td colSpan="5" className="table-empty">No approval requests matched this filter.</td></tr>
                ) : approvals.map(item => (
                  <tr key={item.id} className={selectedApproval?.id === item.id ? 'selected' : ''}>
                    <td>
                      <div className="approvals-summary-cell">
                        <strong>{item.summary}</strong>
                        <span className="meta">{item.created_at ? new Date(item.created_at).toLocaleString() : 'Just now'}</span>
                      </div>
                    </td>
                    <td>{item.action}</td>
                    <td>{item.requested_by_name || item.requested_by}</td>
                    <td><span className={`status-pill ${item.is_stale ? 'archived' : item.status === 'approved' ? 'active' : item.status === 'pending' ? 'draft' : 'archived'}`}>{item.is_stale ? 'stale' : item.status}</span></td>
                    <td>
                      <button className="btn btn-secondary btn-small" onClick={() => { setSelectedApproval(item); setReviewNotes(item.review_notes || ''); }}>
                        Review
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="admin-section-card approvals-detail-card">
          <div className="section-head">
            <h2>Request Detail</h2>
            {selectedApproval && <span className="section-meta">#{selectedApproval.id}</span>}
          </div>
          {selectedApproval ? (
            <div className="approvals-detail">
              <div className="approvals-detail-grid">
                <div><span className="label">Entity</span><strong>{selectedApproval.entity_type}</strong></div>
                <div><span className="label">Action</span><strong>{selectedApproval.action}</strong></div>
                <div><span className="label">Requested By</span><strong>{selectedApproval.requested_by_name || selectedApproval.requested_by}</strong></div>
                <div><span className="label">Status</span><strong>{selectedApproval.status}</strong></div>
                <div><span className="label">Age</span><strong>{selectedApproval.age_hours?.toFixed?.(1) ?? selectedApproval.age_hours}h</strong></div>
                <div><span className="label">SLA</span><strong>{selectedApproval.is_stale ? 'Breached' : 'Within SLA'}</strong></div>
              </div>

              <div className="form-group">
                <label className="admin-label">Summary</label>
                <div className="approvals-summary-box">{selectedApproval.summary}</div>
              </div>

              <div className="form-group">
                <label className="admin-label">Requested Payload</label>
                <pre className="approvals-payload">{JSON.stringify(selectedApproval.payload || {}, null, 2)}</pre>
              </div>

              <div className="form-group">
                <label className="admin-label">Review Notes</label>
                <textarea
                  className="admin-input"
                  rows="4"
                  value={reviewNotes}
                  onChange={event => setReviewNotes(event.target.value)}
                  placeholder="Optional rationale for approval or rejection"
                  disabled={selectedApproval.status !== 'pending'}
                />
              </div>

              {selectedApproval.status === 'pending' ? (
                <div className="approvals-actions">
                  <button
                    className="btn-admin btn-admin-secondary"
                    onClick={() => handleDecision(selectedApproval.id, 'reject')}
                    disabled={processingAction === `approve:${selectedApproval.id}` || processingAction === `reject:${selectedApproval.id}`}
                  >
                    <X size={16} />
                    {processingAction === `reject:${selectedApproval.id}` ? 'Rejecting...' : 'Reject'}
                  </button>
                  <button
                    className="btn-admin btn-admin-primary"
                    onClick={() => handleDecision(selectedApproval.id, 'approve')}
                    disabled={processingAction === `approve:${selectedApproval.id}` || processingAction === `reject:${selectedApproval.id}`}
                  >
                    <Check size={16} />
                    {processingAction === `approve:${selectedApproval.id}` ? 'Approving...' : 'Approve'}
                  </button>
                </div>
              ) : (
                <div className="approvals-reviewed-meta">
                  <span>Reviewed by {selectedApproval.reviewed_by_name || selectedApproval.reviewed_by || 'Unknown'}</span>
                  <span>{selectedApproval.reviewed_at ? new Date(selectedApproval.reviewed_at).toLocaleString() : 'No timestamp'}</span>
                </div>
              )}
            </div>
          ) : (
            <div className="table-empty">Select a request to review its details.</div>
          )}
        </section>
      </div>
    </div>
  );
}
