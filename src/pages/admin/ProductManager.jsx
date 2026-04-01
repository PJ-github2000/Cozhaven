import React, { useState, useEffect, useMemo } from 'react';
import { 
  Package, Search, Plus, Filter, Download, RefreshCw, 
  Trash2, Edit, MoreVertical, X, Check, AlertTriangle, 
  Tag, ChevronDown, Printer, FileText, LayoutGrid, List as ListIcon,
  ShoppingBag, DollarSign, Edit2
} from 'lucide-react';
import { adminApi } from '../../services/adminApi.js';
import ProductFormModal from '../../components/admin/ProductFormModal';
import BarcodePrint from '../../components/admin/BarcodePrint';
import './ProductManager.css';
import '../../styles/AdminPolish.css';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

export default function ProductManager() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    status: 'all',
    stock: 'all',
    priceRange: 'all'
  });
  const [selectedIds, setSelectedIds] = useState([]);
  const [isPriceModalOpen, setIsPriceModalOpen] = useState(false);
  const [priceAdjustment, setPriceAdjustment] = useState({ type: 'percentage', value: '' });
  const [printingProduct, setPrintingProduct] = useState(null);
  const [page, setPage] = useState(1);
  const [pageInfo, setPageInfo] = useState({ total: 0, pages: 0, limit: 50 });
  const [applyToAll, setApplyToAll] = useState(false);
  const [activeJobs, setActiveJobs] = useState([]);
  const { user } = useAuth();
  const { addToast } = useToast();
  const canEdit = user?.role === 'admin' || user?.role === 'manager';

  useEffect(() => {
    fetchProducts();
  }, [page, searchTerm, activeCategory, filters.status, filters.stock]);

  useEffect(() => {
    const jobInterval = setInterval(async () => {
      if (activeJobs.length > 0) {
        try {
          const data = await adminApi.getJobs({ limit: 5 });
          if (data && data.items) {
            setActiveJobs(data.items.filter(j => j.status === 'processing' || j.status === 'pending'));
            // Check if any job just completed to notify
            data.items.forEach(j => {
              const oldJob = activeJobs.find(oj => oj.id === j.id);
              if (oldJob && j.status === 'completed') {
                addToast(`${j.job_type === 'catalog_export' ? 'Export' : 'Import'} job completed!`, 'success');
              }
            });
          }
        } catch (e) { console.error('Job poll error', e); }
      }
    }, 3000);
    return () => clearInterval(jobInterval);
  }, [activeJobs]);

  const fetchProducts = async (overridePage = page) => {
    try {
      setLoading(true);
      if (isRefreshing) setIsRefreshing(true);
      const data = await adminApi.getProducts({
        page: overridePage,
        limit: pageInfo.limit,
        q: searchTerm,
        category: activeCategory,
        status: filters.status,
        stock: filters.stock
      });

      if (data && Array.isArray(data.items)) {
        setProducts(data.items);
        setPageInfo({
          total: data.total || 0,
          pages: data.pages || 0,
          limit: data.limit || pageInfo.limit
        });
      } else if (Array.isArray(data)) {
        setProducts(data);
      } else if (data && Array.isArray(data.products)) {
        setProducts(data.products);
      }
      setSelectedIds([]);
      setApplyToAll(false);
    } catch (error) {
      console.error('Error fetching admin products:', error);
      addToast('Failed to load products list', 'error');
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  const inventoryStats = {
    total: pageInfo.total || products.length,
    lowStock: products.filter(p => (p.stock || 0) > 0 && (p.stock || 0) < 10).length,
    outOfStock: products.filter(p => (p.stock || 0) === 0).length,
    totalValue: products.reduce((acc, p) => acc + ((parseFloat(p.price) || 0) * (p.stock || 0)), 0)
  };

  const categories = ['all', ...new Set(products.map(p => p.category))];

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    try {
      await adminApi.deleteProduct(id);
      fetchProducts();
      setSelectedIds(prev => prev.filter(i => i !== id));
    } catch (error) {
      console.error('Error deleting product:', error);
    }
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === visibleProducts.length && visibleProducts.length > 0) {
      setSelectedIds([]);
      setApplyToAll(false);
    } else {
      setSelectedIds(visibleProducts.map(p => p.id));
    }
  };

  const toggleSelectOne = (id) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
    if (setApplyToAll) setApplyToAll(false);
  };

  const currentFilters = {
    q: searchTerm,
    category: activeCategory,
    status: filters.status,
    stock: filters.stock
  };

  const handleBulkDelete = async () => {
    const count = applyToAll ? pageInfo.total : selectedIds.length;
    if (!window.confirm(`Are you sure you want to delete ${count} products? This cannot be undone.`)) return;
    try {
      const payload = applyToAll 
        ? { filters: currentFilters, apply_to_all: true }
        : { ids: selectedIds };

      await adminApi.bulkDeleteProducts(payload);
      setSelectedIds([]);
      setApplyToAll(false);
      fetchProducts();
      addToast(`Deleted ${count} products`, 'success');
    } catch (error) {
      addToast(error.message, 'error');
    }
  };

  const handleBulkStatusUpdate = async (newStatus) => {
    try {
      const count = applyToAll ? pageInfo.total : selectedIds.length;
      const payload = applyToAll 
        ? { filters: currentFilters, apply_to_all: true, status: newStatus }
        : { ids: selectedIds, status: newStatus };

      await adminApi.bulkUpdateStatus(payload);
      setSelectedIds([]);
      setApplyToAll(false);
      addToast(`Updated ${count} items to ${newStatus}`, 'success');
      fetchProducts();
    } catch (error) {
      addToast(error.message, 'error');
    }
  };

  const handleBulkPriceUpdate = async () => {
    try {
      const val = parseFloat(priceAdjustment.value);
      if (isNaN(val)) return;

      const params = priceAdjustment.type === 'percentage' 
        ? { percentage: val } 
        : { fixed_adjustment: val };

      const count = applyToAll ? pageInfo.total : selectedIds.length;
      const payload = applyToAll 
        ? { filters: currentFilters, apply_to_all: true, ...params }
        : { ids: selectedIds, ...params };

      await adminApi.bulkUpdatePrice(payload);
      
      setIsPriceModalOpen(false);
      setPriceAdjustment({ type: 'percentage', value: '' });
      setSelectedIds([]);
      setApplyToAll(false);
      addToast(`Prices adjusted for ${count} products.`, 'success');
      fetchProducts();
    } catch (error) {
      addToast(error.message, 'error');
    }
  };

  const handleStockAlert = async () => {
    try {
      const response = await adminApi.dispatchInventoryAlert();
      if (response.status === 'success') {
        addToast(response.message, 'success');
      } else {
        addToast("Inventory is healthy. No alerts dispatched.", 'info');
      }
    } catch (error) {
      addToast("Error dispatching inventory alert: " + error.message, 'error');
    }
  };

  const handleSaveProduct = async (productData) => {
    try {
      if (editingProduct) {
        await adminApi.updateProduct(editingProduct.id, productData);
      } else {
        await adminApi.createProduct(productData);
      }
      setIsModalOpen(false);
      setEditingProduct(null);
      fetchProducts(1);
    } catch (error) {
      console.error('Error saving product:', error);
    }
  };

  const openNewProductModal = () => {
    setEditingProduct(null);
    setIsModalOpen(true);
  };

  const openEditProductModal = async (product) => {
    try {
      const [fullProduct, history] = await Promise.all([
        adminApi.getProduct(product.id),
        adminApi.getProductInventoryHistory(product.id)
      ]);
      setEditingProduct({
        ...fullProduct,
        inventoryHistory: history.items || []
      });
      setIsModalOpen(true);
    } catch (error) {
      addToast('Failed to load product details', 'error');
    }
  };

  const handleAdjustInventory = async (productId, payload) => {
    try {
      const result = await adminApi.adjustProductInventory(productId, payload);
      await fetchProducts(page);
      addToast('Inventory updated', 'success');
      return result;
    } catch (error) {
      addToast(error.message || 'Failed to adjust inventory', 'error');
      throw error;
    }
  };

  const handleUpsertPricingSchedule = async (productId, payload) => {
    try {
      const result = await adminApi.upsertProductPricingSchedule(productId, payload);
      if (result?.status === 'pending_approval') {
        window.dispatchEvent(new CustomEvent('admin-notifications-refresh'));
        addToast(result.message || 'Pricing schedule submitted for approval', 'success');
        return result;
      }
      setEditingProduct(prev => {
        if (!prev || prev.id !== productId) return prev;
        const existing = prev.scheduledPrices || [];
        const nextSchedules = existing.some(schedule => schedule.id === result.id)
          ? existing.map(schedule => (schedule.id === result.id ? result : schedule))
          : [result, ...existing];
        return { ...prev, scheduledPrices: nextSchedules };
      });
      await fetchProducts(page);
      addToast('Pricing schedule saved', 'success');
      return result;
    } catch (error) {
      addToast(error.message || 'Failed to save pricing schedule', 'error');
      throw error;
    }
  };

  const handleDeletePricingSchedule = async (scheduleId) => {
    try {
      const result = await adminApi.deletePricingSchedule(scheduleId);
      if (result?.status === 'pending_approval') {
        window.dispatchEvent(new CustomEvent('admin-notifications-refresh'));
        addToast(result.message || 'Pricing schedule deletion submitted for approval', 'success');
        return result;
      }
      setEditingProduct(prev => (
        prev
          ? { ...prev, scheduledPrices: (prev.scheduledPrices || []).filter(schedule => schedule.id !== scheduleId) }
          : prev
      ));
      await fetchProducts(page);
      addToast('Pricing schedule deleted', 'success');
    } catch (error) {
      addToast(error.message || 'Failed to delete pricing schedule', 'error');
      throw error;
    }
  };

  const visibleProducts = useMemo(() => {
    if (!Array.isArray(products)) return [];

    return products.filter(p => {
      let matchesPrice = true;
      if (filters.priceRange === '0-500') matchesPrice = p.price <= 500;
      else if (filters.priceRange === '500-1500') matchesPrice = p.price > 500 && p.price <= 1500;
      else if (filters.priceRange === '1500+') matchesPrice = p.price > 1500;
      return matchesPrice;
    });
  }, [products, filters.priceRange]);

  const handleExport = async () => {
    try {
      const result = await adminApi.exportCatalog(currentFilters);
      if (result.id) {
        addToast("Catalog export started...", 'info');
        setActiveJobs(prev => [...prev, { id: result.id, status: 'pending', job_type: 'catalog_export', progress: 0 }]);
      }
    } catch (error) {
      addToast("Failed to start export: " + error.message, 'error');
    }
  };

  const clearFilters = () => {
    setFilters({ status: 'all', stock: 'all', priceRange: 'all' });
    setActiveCategory('all');
    setSearchTerm('');
    setPage(1);
  };

  const handlePrint = (product) => {
    setPrintingProduct(product);
  };

  const handlePagePrint = () => {
    window.print();
  };

  const activeFilterCount = (filters.status !== 'all' ? 1 : 0) + 
                           (filters.stock !== 'all' ? 1 : 0) + 
                           (filters.priceRange !== 'all' ? 1 : 0);

  return (
    <div className="admin-page-container product-manager">
      {inventoryStats.lowStock > 0 && (
        <div className="inventory-alert-banner">
          <div className="banner-content">
            <AlertTriangle size={20} className="flash-icon" />
            <span><strong>Inventory Alert:</strong> {inventoryStats.lowStock} products are running low on stock.</span>
          </div>
          <button className="banner-action" onClick={handleStockAlert}>
            Dispatch Procurement Request
          </button>
        </div>
      )}

      <div className="inv-stats">
        <div className="order-stat-mini">
          <div className="mini-icon blue"><Package size={20} /></div>
          <div className="mini-info">
            <span className="label">Total SKUs</span>
            <span className="value">{inventoryStats.total}</span>
          </div>
        </div>
        <div className="order-stat-mini">
          <div className="mini-icon orange"><AlertTriangle size={20} /></div>
          <div className="mini-info">
            <span className="label">Low Stock</span>
            <span className="value">{inventoryStats.lowStock}</span>
          </div>
        </div>
        <div className="order-stat-mini">
          <div className="mini-icon red"><X size={20} /></div>
          <div className="mini-info">
            <span className="label">Out of Stock</span>
            <span className="value">{inventoryStats.outOfStock}</span>
          </div>
        </div>
        <div className="order-stat-mini">
          <div className="mini-icon green"><DollarSign size={20} /></div>
          <div className="mini-info">
            <span className="label">Inventory Value</span>
            <span className="value">${inventoryStats.totalValue.toLocaleString()}</span>
          </div>
        </div>
      </div>

      <div className="admin-actions-bar">
        <div className="status-tabs category-filters">
          {categories.map(cat => (
            <button 
              key={cat}
              className={`status-tab ${activeCategory === cat ? 'active' : ''}`}
              onClick={() => { setActiveCategory(cat); setPage(1); }}
            >
              {cat.charAt(0).toUpperCase() + cat.slice(1)}
            </button>
          ))}
        </div>
        
        <div className="admin-actions-right">
          <div className="admin-search-wrap">
            <Search size={18} className="search-icon" />
            <input 
              type="text" 
              placeholder="Search by name or category..." 
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
              className="admin-search-input"
            />
          </div>
          
          <div className="filter-system-wrap">
            <button 
              className={`btn btn-secondary btn-icon filter-toggle ${activeFilterCount > 0 ? 'active' : ''}`}
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter size={18} />
              {activeFilterCount > 0 && <span className="filter-badge">{activeFilterCount}</span>}
            </button>

            {showFilters && (
              <div className="filter-popover">
                <div className="filter-group">
                  <label>Status</label>
                  <select value={filters.status} onChange={e => { setFilters({...filters, status: e.target.value}); setPage(1); }}>
                    <option value="all">Any Status</option>
                    <option value="active">Active</option>
                    <option value="draft">Draft</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>
                <div className="filter-group">
                  <label>Availability</label>
                  <select value={filters.stock} onChange={e => { setFilters({...filters, stock: e.target.value}); setPage(1); }}>
                    <option value="all">Any Inventory</option>
                    <option value="healthy">In Stock (10+)</option>
                    <option value="low">Low Stock (&lt;10)</option>
                    <option value="out">Out of Stock (0)</option>
                  </select>
                </div>
                <div className="filter-group">
                  <label>Price Range</label>
                  <select value={filters.priceRange} onChange={e => setFilters({...filters, priceRange: e.target.value})}>
                    <option value="all">Any Price</option>
                    <option value="0-500">Under $500</option>
                    <option value="500-1500">$500 - $1,500</option>
                    <option value="1500+">Over $1,500</option>
                  </select>
                </div>
                <div className="filter-popover-footer">
                  <button className="text-btn" onClick={clearFilters}>Reset All</button>
                  <button className="btn btn-primary btn-small" onClick={() => setShowFilters(false)}>Done</button>
                </div>
              </div>
            )}
          </div>

          <button 
            className="btn btn-secondary btn-icon" 
            onClick={() => document.getElementById('catalog-import-input').click()}
            title="Import from CSV"
          >
            <Download size={18} style={{ transform: 'rotate(180deg)' }} />
            <input 
              id="catalog-import-input" 
              type="file" 
              accept=".csv" 
              style={{ display: 'none' }} 
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                try {
                  const result = await adminApi.importCatalog(file);
                  if (result.id) {
                    addToast("Catalog import started...", 'info');
                    setActiveJobs(prev => [...prev, { id: result.id, status: 'pending', job_type: 'catalog_import', progress: 0 }]);
                  }
                } catch (err) {
                  addToast("Import failed: " + err.message, 'error');
                }
                e.target.value = ''; // Reset input
              }}
            />
          </button>
          <button 
            className="btn btn-secondary btn-icon" 
            onClick={handleExport}
            title="Export to CSV"
          >
            <Download size={18} />
          </button>
          <button 
            className="btn btn-secondary btn-icon" 
            onClick={() => { setIsRefreshing(true); fetchProducts(); }}
            title="Refresh Inventory"
          >
            <RefreshCw size={18} className={isRefreshing ? 'spinning' : ''} />
          </button>
          {canEdit && (
            <>
              <button className="btn btn-secondary btn-icon" onClick={handleStockAlert} title="Trigger Inventory Alert">
                <AlertTriangle size={18} />
              </button>
              <button className="admin-btn admin-btn-primary" onClick={openNewProductModal}>
                <Plus size={18} />
                <span>Add Product</span>
              </button>
            </>
          )}
        </div>
      </div>

      {activeJobs.length > 0 && (
        <div className="active-jobs-indicator">
          {activeJobs.map(job => (
            <div key={job.id} className="job-status-pill">
              <RefreshCw size={14} className="spinning" />
              <span>{job.job_type === 'catalog_export' ? 'Exporting' : 'Importing'} Catalog... {job.progress}%</span>
              {job.status === 'completed' && job.file_path && (
                <a href={adminApi.API_BASE + job.file_path} className="download-btn" download>Download</a>
              )}
            </div>
          ))}
        </div>
      )}

      {selectedIds.length === visibleProducts.length && visibleProducts.length > 0 && pageInfo.total > visibleProducts.length && (
        <div className="selection-all-banner">
          {!applyToAll ? (
            <span>All <strong>{selectedIds.length}</strong> products on this page are selected. <button className="select-all-btn" onClick={() => setApplyToAll(true)}>Select all <strong>{pageInfo.total}</strong> products matching filters</button></span>
          ) : (
            <span>All <strong>{pageInfo.total}</strong> products matching current filters are selected. <button className="select-all-btn" onClick={() => { setApplyToAll(false); setSelectedIds([]); }}>Clear selection</button></span>
          )}
        </div>
      )}

      <ProductFormModal 
        isOpen={isModalOpen} 
        onClose={() => { setIsModalOpen(false); setEditingProduct(null); }} 
        onSave={handleSaveProduct} 
        initialData={editingProduct}
        onAdjustInventory={handleAdjustInventory}
        onUpsertPricingSchedule={handleUpsertPricingSchedule}
        onDeletePricingSchedule={handleDeletePricingSchedule}
        canEdit={canEdit}
      />

      {/* Bulk Action Bar */}
      {selectedIds.length > 0 && (
        <div className="selection-bar">
          <div className="selection-info">
            <span className="count">{selectedIds.length} items selected</span>
            <button className="text-btn" onClick={() => setSelectedIds([])}>Clear selection</button>
          </div>
          <div className="selection-actions">
            {canEdit && (
              <>
                <button className="selection-btn secondary" onClick={() => setIsPriceModalOpen(true)}>
                  <Tag size={14} />
                  <span>Update Prices</span>
                </button>
                <button className="selection-btn secondary" onClick={() => handleBulkStatusUpdate('active')}>
                  Set to Active
                </button>
                <button className="selection-btn secondary" onClick={() => handleBulkStatusUpdate('draft')}>
                  Set to Draft
                </button>
                <button className="selection-btn delete" onClick={handleBulkDelete}>
                  <Trash2 size={16} />
                  <span>Delete Selected</span>
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* Bulk Price Modal */}
      {isPriceModalOpen && (
        <div className="admin-modal-overlay">
          <div className="admin-modal price-update-modal">
            <div className="admin-modal-header">
              <h3>Bulk Price Update</h3>
              <button onClick={() => setIsPriceModalOpen(false)}><X size={20} /></button>
            </div>
            <div className="admin-modal-body">
              <p>Adjust price for {selectedIds.length} selected products.</p>
              
              <div className="price-input-group">
                <select 
                  value={priceAdjustment.type} 
                  onChange={e => setPriceAdjustment({...priceAdjustment, type: e.target.value})}
                  className="admin-input"
                >
                  <option value="percentage">Percentage (%)</option>
                  <option value="fixed">Fixed Amount ($)</option>
                </select>
                <input 
                  type="number" 
                  placeholder={priceAdjustment.type === 'percentage' ? "e.g. 10 or -5" : "e.g. 50 or -20"}
                  value={priceAdjustment.value}
                  onChange={e => setPriceAdjustment({...priceAdjustment, value: e.target.value})}
                  className="admin-input"
                />
              </div>
              <p className="hint">Use negative values for discounts/reductions.</p>
            </div>
            <div className="admin-modal-footer">
              <button className="btn btn-secondary" onClick={() => setIsPriceModalOpen(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleBulkPriceUpdate}>Apply Changes</button>
            </div>
          </div>
        </div>
      )}

      {/* Barcode Print Preview Modal */}
      {printingProduct && (
        <div className="admin-modal-overlay">
          <div className="admin-modal barcode-preview-modal">
            <div className="admin-modal-header">
              <h3>Barcode Label Preview</h3>
              <button onClick={() => setPrintingProduct(null)}><X size={20} /></button>
            </div>
            <div className="admin-modal-body barcode-print-container">
              <BarcodePrint product={printingProduct} />
              <div className="print-instructions no-print">
                <p>Ensure your printer is set to "Portrait" and "100% Scale".</p>
              </div>
            </div>
            <div className="admin-modal-footer no-print">
              <button className="btn btn-secondary" onClick={() => setPrintingProduct(null)}>Cancel</button>
              <button className="btn btn-primary" onClick={handlePagePrint}>
                <Download size={18} /> Print Label
              </button>
            </div>
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
                  checked={selectedIds.length === visibleProducts.length && visibleProducts.length > 0}
                  onChange={toggleSelectAll}
                />
              </th>
              <th>Product</th>
              <th>Category</th>
              <th>Price</th>
              <th>Stock</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="6" className="table-loading">Loading products...</td></tr>
            ) : visibleProducts.length === 0 ? (
              <tr><td colSpan="6" className="table-empty">No products found.</td></tr>
            ) : visibleProducts.map(product => (
              <tr key={product.id} className={selectedIds.includes(product.id) ? 'selected' : ''}>
                <td className="checkbox-cell">
                  <input 
                    type="checkbox" 
                    checked={selectedIds.includes(product.id)}
                    onChange={() => toggleSelectOne(product.id)}
                  />
                </td>
                <td>
                  <div className="product-cell">
                    <div className="product-cell__img">
                      {product.image || product.images?.[0] ? <img src={product.image || product.images?.[0]} alt="" /> : <Package size={20} />}
                    </div>
                    <div className="product-cell__info">
                      <span className="name">{product.name}</span>
                      <span className="sku">{product.sku || `CH-${product.id}`}</span>
                    </div>
                  </div>
                </td>
                <td><span className="category-tag">{product.category}</span></td>
                <td><span className="price">${product.price.toLocaleString()}</span></td>
                <td>
                  <div className={`stock-status-pill ${product.stock <= 0 ? 'out' : product.stock < 10 ? 'low' : 'healthy'}`}>
                    <span className="dot"></span>
                    {product.stock <= 0 ? 'Out of Stock' : product.stock < 10 ? `Low: ${product.stock} left` : `${product.stock} in stock`}
                  </div>
                </td>
                <td>
                  <span className={`status-pill ${product.status || 'active'}`}>
                    {(product.status || 'active').charAt(0).toUpperCase() + (product.status || 'active').slice(1)}
                  </span>
                </td>
                <td>
                  <div className="table-actions">
                    {canEdit ? (
                      <>
                        <button className="admin-icon-btn" aria-label="Print barcode" onClick={() => handlePrint(product)} title="Print Barcode"><Tag size={16} /></button>
                        <button className="admin-icon-btn" aria-label="Edit product" onClick={() => openEditProductModal(product)}><Edit2 size={16} /></button>
                        <button className="admin-icon-btn delete" aria-label="Delete product" onClick={() => handleDelete(product.id)}><Trash2 size={16} /></button>
                      </>
                    ) : (
                      <span className="viewer-hint">Read-only</span>
                    )}
                    <button className="admin-icon-btn" aria-label="More options"><MoreVertical size={16} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="admin-actions-bar" style={{ justifyContent: 'space-between', marginTop: '16px' }}>
        <div className="admin-actions-left">
          <span className="label">Showing page {page} of {Math.max(pageInfo.pages, 1)} · {pageInfo.total} total products</span>
        </div>
        <div className="admin-actions-right">
          <button className="btn btn-secondary" onClick={() => setPage(prev => Math.max(1, prev - 1))} disabled={page <= 1}>
            Previous
          </button>
          <button className="btn btn-secondary" onClick={() => setPage(prev => Math.min(pageInfo.pages || 1, prev + 1))} disabled={page >= (pageInfo.pages || 1)}>
            Next
          </button>
        </div>
      </div>
    </div>
  );

}
