import { useDeferredValue, useEffect, useState } from 'react';
import { AlertTriangle, Boxes, RefreshCw, Search } from 'lucide-react';
import { adminApi } from '../../services/adminApi.js';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import './InventoryWorkbench.css';
import '../../styles/AdminPolish.css';

const categories = ['all', 'sofas', 'sectionals', 'chairs', 'living-room', 'tables', 'dining', 'bedroom', 'lighting', 'storage', 'decor', 'vanity'];

const defaultAdjustment = {
  adjustment_type: 'increase',
  quantity: '',
  reason: 'restock',
  reference_id: '',
  reorder_threshold: ''
};

function stockState(item) {
  if ((item.available_quantity || 0) <= 0) return 'out';
  if ((item.available_quantity || 0) <= (item.reorder_threshold || 0)) return 'low';
  return 'healthy';
}

export default function InventoryWorkbench() {
  const [items, setItems] = useState([]);
  const [summary, setSummary] = useState({ tracked_items: 0, total_on_hand: 0, low_stock_count: 0, out_of_stock_count: 0 });
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [stockFilter, setStockFilter] = useState('all');
  const [trackedFilter, setTrackedFilter] = useState('tracked');
  const [category, setCategory] = useState('all');
  const [sort, setSort] = useState('stock-asc');
  const [page, setPage] = useState(1);
  const [pageInfo, setPageInfo] = useState({ total: 0, pages: 0, limit: 50 });
  const [selectedItem, setSelectedItem] = useState(null);
  const [selectedHistory, setSelectedHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [adjustmentDraft, setAdjustmentDraft] = useState(defaultAdjustment);
  const [submittingAdjustment, setSubmittingAdjustment] = useState(false);
  const deferredSearch = useDeferredValue(searchTerm);
  const { user } = useAuth();
  const { addToast } = useToast();
  const canEdit = user?.role === 'admin' || user?.role === 'manager';

  useEffect(() => {
    fetchInventory();
  }, [deferredSearch, stockFilter, trackedFilter, category, sort, page]);

  useEffect(() => {
    if (!selectedItem) return;
    setAdjustmentDraft({
      ...defaultAdjustment,
      reorder_threshold: `${selectedItem.reorder_threshold ?? 10}`
    });
    fetchSelectedHistory(selectedItem);
  }, [selectedItem]);

  const fetchInventory = async (overridePage = page) => {
    try {
      setLoading(true);
      const data = await adminApi.getInventoryItems({
        page: overridePage,
        limit: pageInfo.limit,
        q: deferredSearch,
        stock: stockFilter,
        tracked: trackedFilter,
        category,
        sort
      });
      setItems(data.items || []);
      setSummary(data.summary || summary);
      setPageInfo({
        total: data.total || 0,
        pages: data.pages || 0,
        limit: data.limit || pageInfo.limit
      });
      if (selectedItem) {
        const refreshed = (data.items || []).find(item => item.variant_id === selectedItem.variant_id);
        if (refreshed) setSelectedItem(refreshed);
      }
    } catch (error) {
      addToast(error.message || 'Failed to load inventory', 'error');
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  const fetchSelectedHistory = async (item) => {
    try {
      setHistoryLoading(true);
      const data = await adminApi.getProductInventoryHistory(item.product_id, 20);
      setSelectedHistory((data.items || []).filter(entry => entry.variant_id === item.variant_id));
    } catch (error) {
      addToast(error.message || 'Failed to load inventory history', 'error');
    } finally {
      setHistoryLoading(false);
    }
  };

  const handleSelectItem = (item) => {
    setSelectedItem(item);
    setSelectedHistory([]);
  };

  const handleApplyAdjustment = async () => {
    if (!selectedItem) return;

    const quantity = parseInt(adjustmentDraft.quantity || '0', 10);
    const reorderThreshold = parseInt(adjustmentDraft.reorder_threshold || `${selectedItem.reorder_threshold ?? 10}`, 10);

    if (!adjustmentDraft.reason.trim()) {
      addToast('Adjustment reason is required', 'error');
      return;
    }
    if (Number.isNaN(quantity) || quantity < 0) {
      addToast('Quantity must be zero or greater', 'error');
      return;
    }
    if (Number.isNaN(reorderThreshold) || reorderThreshold < 0) {
      addToast('Reorder threshold must be zero or greater', 'error');
      return;
    }

    try {
      setSubmittingAdjustment(true);
      const result = await adminApi.adjustProductInventory(selectedItem.product_id, {
        variant_id: selectedItem.variant_id,
        adjustment_type: adjustmentDraft.adjustment_type,
        quantity,
        reason: adjustmentDraft.reason,
        reference_type: 'admin_inventory_workbench',
        reference_id: adjustmentDraft.reference_id.trim() || null,
        reorder_threshold: reorderThreshold,
        track_inventory: selectedItem.track_inventory
      });

      const nextSelected = {
        ...selectedItem,
        available_quantity: result.variant.available_quantity,
        reserved_quantity: result.variant.reserved_quantity,
        reorder_threshold: result.variant.reorder_threshold,
        track_inventory: result.variant.track_inventory,
        updated_at: new Date().toISOString()
      };
      setSelectedItem(nextSelected);
      setSelectedHistory(prev => result.adjustment ? [result.adjustment, ...prev].slice(0, 20) : prev);
      setAdjustmentDraft({
        ...defaultAdjustment,
        reorder_threshold: `${result.variant.reorder_threshold}`
      });
      await fetchInventory(page);
      addToast('Inventory adjusted', 'success');
    } catch (error) {
      addToast(error.message || 'Failed to adjust inventory', 'error');
    } finally {
      setSubmittingAdjustment(false);
    }
  };

  return (
    <div className="admin-page-container inventory-workbench">
      <div className="inv-stats">
        <div className="order-stat-mini">
          <div className="mini-icon blue"><Boxes size={20} /></div>
          <div className="mini-info">
            <span className="label">Tracked SKUs</span>
            <span className="value">{summary.tracked_items}</span>
          </div>
        </div>
        <div className="order-stat-mini">
          <div className="mini-icon green"><Boxes size={20} /></div>
          <div className="mini-info">
            <span className="label">On Hand</span>
            <span className="value">{summary.total_on_hand}</span>
          </div>
        </div>
        <div className="order-stat-mini">
          <div className="mini-icon orange"><AlertTriangle size={20} /></div>
          <div className="mini-info">
            <span className="label">Low Stock</span>
            <span className="value">{summary.low_stock_count}</span>
          </div>
        </div>
        <div className="order-stat-mini">
          <div className="mini-icon red"><AlertTriangle size={20} /></div>
          <div className="mini-info">
            <span className="label">Out Of Stock</span>
            <span className="value">{summary.out_of_stock_count}</span>
          </div>
        </div>
      </div>

      <div className="admin-actions-bar">
        <div className="admin-actions-right inventory-toolbar">
          <div className="admin-search-wrap">
            <Search size={18} className="search-icon" />
            <input
              type="text"
              placeholder="Search product, SKU, variant..."
              value={searchTerm}
              onChange={(event) => { setSearchTerm(event.target.value); setPage(1); }}
              className="admin-search-input"
            />
          </div>
          <select className="admin-input inventory-toolbar__select" value={stockFilter} onChange={(event) => { setStockFilter(event.target.value); setPage(1); }}>
            <option value="all">All Stock States</option>
            <option value="healthy">Healthy</option>
            <option value="low">Low Stock</option>
            <option value="out">Out Of Stock</option>
          </select>
          <select className="admin-input inventory-toolbar__select" value={trackedFilter} onChange={(event) => { setTrackedFilter(event.target.value); setPage(1); }}>
            <option value="tracked">Tracked Only</option>
            <option value="all">Tracked + Untracked</option>
            <option value="untracked">Untracked Only</option>
          </select>
          <select className="admin-input inventory-toolbar__select" value={category} onChange={(event) => { setCategory(event.target.value); setPage(1); }}>
            {categories.map(item => <option key={item} value={item}>{item === 'all' ? 'All Categories' : item}</option>)}
          </select>
          <select className="admin-input inventory-toolbar__select" value={sort} onChange={(event) => { setSort(event.target.value); setPage(1); }}>
            <option value="stock-asc">Lowest Stock First</option>
            <option value="stock-desc">Highest Stock First</option>
            <option value="updated-desc">Recently Updated</option>
            <option value="name-asc">Product Name</option>
          </select>
          <button className="btn btn-secondary btn-icon" onClick={() => { setIsRefreshing(true); fetchInventory(); }} title="Refresh Inventory">
            <RefreshCw size={18} className={isRefreshing ? 'spinning' : ''} />
          </button>
        </div>
      </div>

      <div className="admin-table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Product</th>
              <th>Variant</th>
              <th>SKU</th>
              <th>On Hand</th>
              <th>Reserved</th>
              <th>Threshold</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="8" className="table-loading">Loading inventory…</td></tr>
            ) : items.length === 0 ? (
              <tr><td colSpan="8" className="table-empty">No inventory rows matched the current filters.</td></tr>
            ) : items.map(item => (
              <tr key={item.variant_id} className={selectedItem?.variant_id === item.variant_id ? 'selected' : ''}>
                <td>
                  <div className="inventory-product-cell">
                    <span className="name">{item.product_name}</span>
                    <span className="meta">{item.category}</span>
                  </div>
                </td>
                <td>{item.variant_title}</td>
                <td><span className="inventory-sku">{item.sku}</span></td>
                <td>{item.available_quantity}</td>
                <td>{item.reserved_quantity}</td>
                <td>{item.reorder_threshold}</td>
                <td>
                  <span className={`stock-status-pill ${stockState(item)}`}>
                    <span className="dot"></span>
                    {stockState(item) === 'out' ? 'Out' : stockState(item) === 'low' ? 'Low' : 'Healthy'}
                  </span>
                </td>
                <td>
                  <div className="table-actions">
                    <button className="btn-admin btn-admin-secondary" onClick={() => handleSelectItem(item)}>
                      {selectedItem?.variant_id === item.variant_id ? 'Selected' : 'Review'}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="admin-actions-bar" style={{ justifyContent: 'space-between' }}>
        <div className="admin-actions-left">
          <span className="label">Showing page {page} of {Math.max(pageInfo.pages, 1)} · {pageInfo.total} inventory rows</span>
        </div>
        <div className="admin-actions-right">
          <button className="btn btn-secondary" onClick={() => setPage(prev => Math.max(1, prev - 1))} disabled={page <= 1}>Previous</button>
          <button className="btn btn-secondary" onClick={() => setPage(prev => Math.min(pageInfo.pages || 1, prev + 1))} disabled={page >= (pageInfo.pages || 1)}>Next</button>
        </div>
      </div>

      {selectedItem && (
        <div className="inventory-workbench__detail">
          <section className="admin-section-card inventory-adjustment-panel">
            <div className="section-head">
              <h2>{selectedItem.product_name} · {selectedItem.variant_title}</h2>
              <button className="text-btn" onClick={() => setSelectedItem(null)}>Close</button>
            </div>
            <div className="inventory-adjustment-summary">
              <div><span className="label">SKU</span><strong>{selectedItem.sku}</strong></div>
              <div><span className="label">On Hand</span><strong>{selectedItem.available_quantity}</strong></div>
              <div><span className="label">Reserved</span><strong>{selectedItem.reserved_quantity}</strong></div>
              <div><span className="label">Threshold</span><strong>{selectedItem.reorder_threshold}</strong></div>
            </div>
            <div className="inventory-adjustment-form">
              <div className="form-group">
                <label className="admin-label">Action</label>
                <select className="admin-input" value={adjustmentDraft.adjustment_type} onChange={(event) => setAdjustmentDraft(prev => ({ ...prev, adjustment_type: event.target.value }))}>
                  <option value="increase">Increase</option>
                  <option value="decrease">Decrease</option>
                  <option value="set">Set Exact Stock</option>
                </select>
              </div>
              <div className="form-group">
                <label className="admin-label">Quantity</label>
                <input className="admin-input" type="number" value={adjustmentDraft.quantity} onChange={(event) => setAdjustmentDraft(prev => ({ ...prev, quantity: event.target.value }))} />
              </div>
              <div className="form-group">
                <label className="admin-label">Reason</label>
                <select className="admin-input" value={adjustmentDraft.reason} onChange={(event) => setAdjustmentDraft(prev => ({ ...prev, reason: event.target.value }))}>
                  <option value="restock">Restock</option>
                  <option value="sale">Sale</option>
                  <option value="damage">Damage</option>
                  <option value="return">Return</option>
                  <option value="correction">Correction</option>
                </select>
              </div>
              <div className="form-group">
                <label className="admin-label">Threshold</label>
                <input className="admin-input" type="number" value={adjustmentDraft.reorder_threshold} onChange={(event) => setAdjustmentDraft(prev => ({ ...prev, reorder_threshold: event.target.value }))} />
              </div>
              <div className="form-group inventory-adjustment-form__reference">
                <label className="admin-label">Reference</label>
                <input className="admin-input" type="text" value={adjustmentDraft.reference_id} onChange={(event) => setAdjustmentDraft(prev => ({ ...prev, reference_id: event.target.value }))} placeholder="PO, cycle count, return ticket..." />
              </div>
              <div className="inventory-adjustment-form__actions">
                <button className="btn-admin btn-admin-primary" onClick={handleApplyAdjustment} disabled={!canEdit || submittingAdjustment}>
                  {submittingAdjustment ? 'Applying...' : 'Apply Adjustment'}
                </button>
              </div>
            </div>
          </section>

          <section className="admin-section-card inventory-history-card">
            <div className="section-head">
              <h2>Recent History</h2>
            </div>
            {historyLoading ? (
              <div className="table-loading">Loading history…</div>
            ) : selectedHistory.length === 0 ? (
              <div className="table-empty">No adjustments logged for this SKU yet.</div>
            ) : (
              <div className="inventory-history-list">
                {selectedHistory.map(entry => (
                  <div key={entry.id} className="inventory-history-list__item">
                    <div>
                      <strong>{entry.reason}</strong>
                      <div className="inventory-history-list__meta">{entry.reference_id || 'Manual adjustment'}</div>
                    </div>
                    <div className={entry.delta >= 0 ? 'inventory-delta inventory-delta--positive' : 'inventory-delta inventory-delta--negative'}>
                      {entry.delta >= 0 ? `+${entry.delta}` : entry.delta}
                    </div>
                    <div className="inventory-history-list__meta">{entry.created_at ? new Date(entry.created_at).toLocaleString() : 'Just now'}</div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      )}
    </div>
  );
}
