import { useEffect, useState } from 'react';
import { Plus, Trash2, X } from 'lucide-react';
import { API_BASE } from '../../services/apiConfig';
import './ProductFormModal.css';

const createVariant = (position = 1) => ({
  title: '',
  sku: '',
  slug: '',
  price: '',
  compare_at_price: '',
  stock: '',
  status: 'active',
  position
});

const emptyFormState = {
  name: '',
  slug: '',
  sku: '',
  product_type: 'simple',
  price: '',
  original_price: '',
  description: '',
  category: 'sofas',
  subcategory: '',
  stock: '',
  images: [],
  colors: [],
  sizes: [],
  badge: '',
  sale_percent: '',
  specs: [], // Changed from string to array of {key, value} objects
  materials: [],
  configurations: [],
  colorNames: [],
  is_canadian_made: true,
  status: 'active',
  seo: { meta_title: '', meta_description: '', canonical_url: '', robots_directive: '' },
  options: [],
  variants: [createVariant()]
};

const categories = ['sofas', 'sectionals', 'chairs', 'living-room', 'tables', 'dining', 'bedroom', 'lighting', 'storage', 'decor', 'vanity'];

const createInventoryDraft = (variant) => ({
  adjustment_type: 'increase',
  quantity: '',
  reason: 'restock',
  reference_id: '',
  reorder_threshold: variant?.reorderThreshold ?? variant?.reorder_threshold ?? 10
});

const createScheduleDraft = () => ({
  id: null,
  label: '',
  variant_id: '',
  price: '',
  compare_at_price: '',
  starts_at: '',
  ends_at: '',
  is_active: true
});

const createOption = (position = 1) => ({
  name: '',
  position,
  values: [{ value: '', display_value: '', position: 1 }]
});

const optionKey = (selectedOptions = []) => selectedOptions
  .map(option => `${option.option_name}:${option.value}`)
  .sort()
  .join('|');

const buildVariantCombinations = (options = []) => {
  const validOptions = options
    .map(option => ({
      ...option,
      values: (option.values || []).filter(value => value.value?.trim())
    }))
    .filter(option => option.name?.trim() && option.values.length > 0);

  if (validOptions.length === 0) return [];

  return validOptions.reduce((combinations, option) => (
    combinations.flatMap(combination => (
      option.values.map(value => [
        ...combination,
        {
          option_name: option.name.trim(),
          value: value.value.trim(),
          display_value: (value.display_value || value.value || '').trim()
        }
      ])
    ))
  ), [[]]);
};

export default function ProductFormModal({
  isOpen,
  onClose,
  onSave,
  initialData = null,
  onAdjustInventory,
  onUpsertPricingSchedule,
  onDeletePricingSchedule,
  canEdit = false
}) {
  const [activeTab, setActiveTab] = useState('general');
  const [formData, setFormData] = useState(emptyFormState);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const [inventoryVariants, setInventoryVariants] = useState([]);
  const [inventoryHistory, setInventoryHistory] = useState([]);
  const [adjustmentDrafts, setAdjustmentDrafts] = useState({});
  const [inventorySubmittingId, setInventorySubmittingId] = useState(null);
  const [scheduledPrices, setScheduledPrices] = useState([]);
  const [scheduleDraft, setScheduleDraft] = useState(createScheduleDraft());
  const [scheduleSaving, setScheduleSaving] = useState(false);
  const [newColor, setNewColor] = useState('#000000');
  const [newColorName, setNewColorName] = useState('');
  const [newSize, setNewSize] = useState('');
  const [newMaterial, setNewMaterial] = useState('');
  const [newConfig, setNewConfig] = useState('');

  useEffect(() => {
    if (!isOpen) return;
    if (!initialData) {
      setFormData(emptyFormState);
      setInventoryVariants([]);
      setInventoryHistory([]);
      setAdjustmentDrafts({});
      setScheduledPrices([]);
      setScheduleDraft(createScheduleDraft());
      return;
    }

    const mappedVariants = initialData.variants?.length
      ? initialData.variants.map((variant, index) => ({
          id: variant.id,
          title: variant.title || '',
          sku: variant.sku || '',
          slug: variant.slug || '',
          price: variant.basePrice ?? variant.price ?? '',
          compare_at_price: variant.baseCompareAtPrice ?? variant.compareAtPrice ?? variant.compare_at_price ?? '',
          stock: variant.stock ?? variant.availableQuantity ?? variant.available_quantity ?? '',
          availableQuantity: variant.availableQuantity ?? variant.available_quantity ?? variant.stock ?? 0,
          reservedQuantity: variant.reservedQuantity ?? variant.reserved_quantity ?? 0,
          reorderThreshold: variant.reorderThreshold ?? variant.reorder_threshold ?? 10,
          trackInventory: variant.trackInventory ?? variant.track_inventory ?? true,
          selected_options: variant.selectedOptions ?? variant.selected_options ?? [],
          status: variant.status || 'active',
          position: variant.position || index + 1
        }))
      : [createVariant()];

    setFormData({
      ...emptyFormState,
      ...initialData,
      slug: initialData.slug || '',
      sku: initialData.sku || '',
      product_type: initialData.productType || initialData.product_type || 'simple',
      original_price: initialData.baseOriginalPrice ?? initialData.originalPrice ?? '',
      price: initialData.basePrice ?? initialData.price ?? '',
      stock: initialData.stock ?? '',
      sale_percent: initialData.salePercent ?? '',
      specs: initialData.specs && typeof initialData.specs === 'object'
        ? Object.entries(initialData.specs).map(([key, value]) => ({ key, value }))
        : (typeof initialData.specs === 'string' ? initialData.specs.split('|').filter(s => s.includes(':')).map(s => ({ key: s.split(':')[0], value: s.split(':')[1] })) : []),
      images: initialData.images || [],
      colors: initialData.colors || [],
      sizes: initialData.sizes || [],
      materials: initialData.materials || [],
      configurations: initialData.configurations || [],
      colorNames: initialData.colorNames || [],
      options: initialData.options?.length
        ? initialData.options.map((option, optionIndex) => ({
            id: option.id,
            name: option.name || '',
            position: option.position || optionIndex + 1,
            values: option.values?.length
              ? option.values.map((value, valueIndex) => ({
                  id: value.id,
                  value: value.value || '',
                  display_value: value.displayValue || value.display_value || '',
                  position: value.position || valueIndex + 1
                }))
              : [{ value: '', display_value: '', position: 1 }]
          }))
        : [],
      is_canadian_made: initialData.is_canadian_made !== undefined
        ? !!initialData.is_canadian_made
        : (initialData.isCanadianMade !== undefined ? !!initialData.isCanadianMade : true),
      status: initialData.status || 'active',
      seo: {
        meta_title: initialData.seo?.metaTitle || initialData.seo?.meta_title || '',
        meta_description: initialData.seo?.metaDescription || initialData.seo?.meta_description || '',
        canonical_url: initialData.seo?.canonicalUrl || initialData.seo?.canonical_url || '',
        robots_directive: initialData.seo?.robotsDirective || initialData.seo?.robots_directive || ''
      },
      variants: mappedVariants
    });
    setInventoryVariants(mappedVariants);
    setInventoryHistory(initialData.inventoryHistory || []);
    setScheduledPrices(initialData.scheduledPrices || []);
    setAdjustmentDrafts(
      mappedVariants.reduce((acc, variant) => {
        acc[variant.id ?? variant.position] = createInventoryDraft(variant);
        return acc;
      }, {})
    );
    setScheduleDraft(createScheduleDraft());
  }, [initialData, isOpen]);

  const patchForm = (patch) => setFormData(prev => ({ ...prev, ...patch }));
  const patchSeo = (patch) => setFormData(prev => ({ ...prev, seo: { ...prev.seo, ...patch } }));
  const patchVariant = (index, patch) => setFormData(prev => ({
    ...prev,
    variants: prev.variants.map((variant, variantIndex) => (variantIndex === index ? { ...variant, ...patch } : variant))
  }));
  const patchOption = (index, patch) => setFormData(prev => ({
    ...prev,
    options: prev.options.map((option, optionIndex) => (optionIndex === index ? { ...option, ...patch } : option))
  }));
  const patchOptionValue = (optionIndex, valueIndex, patch) => setFormData(prev => ({
    ...prev,
    options: prev.options.map((option, currentOptionIndex) => (
      currentOptionIndex === optionIndex
        ? {
            ...option,
            values: option.values.map((value, currentValueIndex) => (
              currentValueIndex === valueIndex ? { ...value, ...patch } : value
            ))
          }
        : option
    ))
  }));

  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    setUploading(true);
    const data = new FormData();
    data.append('file', file);
    try {
      const response = await fetch(`${API_BASE}/admin/upload`, { method: 'POST', credentials: 'include', body: data });
      const result = await response.json();
      if (response.ok) patchForm({ images: [...formData.images, result.url] });
    } catch (error) {
      console.error('Image upload failed:', error);
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (index) => patchForm({ images: formData.images.filter((_, imageIndex) => imageIndex !== index) });
  const addColor = () => {
    if (!formData.colors.includes(newColor)) {
      patchForm({ colors: [...formData.colors, newColor], colorNames: [...formData.colorNames, newColorName || newColor] });
      setNewColorName('');
    }
  };
  const removeColor = (index) => patchForm({
    colors: formData.colors.filter((_, colorIndex) => colorIndex !== index),
    colorNames: formData.colorNames.filter((_, colorIndex) => colorIndex !== index)
  });
  const addSize = () => { if (newSize && !formData.sizes.includes(newSize)) { patchForm({ sizes: [...formData.sizes, newSize] }); setNewSize(''); } };
  const addMaterial = () => { if (newMaterial && !formData.materials.includes(newMaterial)) { patchForm({ materials: [...formData.materials, newMaterial] }); setNewMaterial(''); } };
  const addConfig = () => { if (newConfig && !formData.configurations.includes(newConfig)) { patchForm({ configurations: [...formData.configurations, newConfig] }); setNewConfig(''); } };
  const removeSize = (value) => patchForm({ sizes: formData.sizes.filter(item => item !== value) });
  const removeMaterial = (value) => patchForm({ materials: formData.materials.filter(item => item !== value) });
  const removeConfig = (value) => patchForm({ configurations: formData.configurations.filter(item => item !== value) });
  const addVariant = () => patchForm({ product_type: 'configurable', variants: [...formData.variants, createVariant(formData.variants.length + 1)] });
  const addOption = () => patchForm({ product_type: 'configurable', options: [...formData.options, createOption(formData.options.length + 1)] });
  const removeOption = (index) => patchForm({
    options: formData.options.filter((_, optionIndex) => optionIndex !== index).map((option, optionIndex) => ({ ...option, position: optionIndex + 1 }))
  });
  const addOptionValue = (optionIndex) => setFormData(prev => ({
    ...prev,
    options: prev.options.map((option, currentOptionIndex) => (
      currentOptionIndex === optionIndex
        ? {
            ...option,
            values: [...option.values, { value: '', display_value: '', position: option.values.length + 1 }]
          }
        : option
    ))
  }));
  const removeOptionValue = (optionIndex, valueIndex) => setFormData(prev => ({
    ...prev,
    options: prev.options.map((option, currentOptionIndex) => (
      currentOptionIndex === optionIndex
        ? {
            ...option,
            values: option.values
              .filter((_, currentValueIndex) => currentValueIndex !== valueIndex)
              .map((value, currentValueIndex) => ({ ...value, position: currentValueIndex + 1 }))
          }
        : option
    ))
  }));
  const removeVariant = (index) => {
    const next = formData.variants.filter((_, variantIndex) => variantIndex !== index);
    patchForm({ variants: next.length ? next : [createVariant()] });
  };

  const addSpec = () => patchForm({ specs: [...formData.specs, { key: '', value: '' }] });
  const updateSpec = (index, patch) => patchForm({
    specs: formData.specs.map((s, i) => (i === index ? { ...s, ...patch } : s))
  });
  const removeSpec = (index) => patchForm({
    specs: formData.specs.filter((_, i) => i !== index)
  });

  const generateVariantsFromOptions = () => {
    const combinations = buildVariantCombinations(formData.options);
    if (combinations.length === 0) {
      setErrors(prev => ({ ...prev, options: 'Add at least one option with values before generating variants.' }));
      return;
    }

    const existingByKey = new Map(
      formData.variants
        .filter(variant => (variant.selected_options || []).length > 0)
        .map(variant => [optionKey(variant.selected_options), variant])
    );

    const nextVariants = combinations.map((selectedOptions, index) => {
      const existing = existingByKey.get(optionKey(selectedOptions));
      const title = selectedOptions.map(option => option.display_value || option.value).join(' / ');
      return existing
        ? {
            ...existing,
            title,
            selected_options: selectedOptions,
            position: index + 1
          }
        : {
            ...createVariant(index + 1),
            title,
            price: formData.price || '',
            compare_at_price: formData.original_price || '',
            selected_options: selectedOptions
          };
    });

    patchForm({
      product_type: 'configurable',
      variants: nextVariants
    });
    setErrors(prev => ({ ...prev, options: null, variants: null }));
  };

  const validate = () => {
    const nextErrors = {};
    if (!formData.name.trim()) nextErrors.name = 'Product name is required.';
    if (!formData.price || isNaN(formData.price)) nextErrors.price = 'Valid price is required.';
    if (!formData.category) nextErrors.category = 'Category is required.';
    if (formData.images.length === 0) nextErrors.images = 'At least one image is required.';
    if (formData.product_type === 'configurable' && formData.options.some(option => !option.name.trim() || option.values.every(value => !value.value.trim()))) {
      nextErrors.options = 'Each option needs a name and at least one value.';
    }
    if (formData.product_type === 'configurable' && formData.variants.some(variant => !variant.title.trim() || !variant.price || isNaN(variant.price))) {
      nextErrors.variants = 'Each variant needs a title and valid price.';
    }
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const parseSpecs = (value) => value.split('|').reduce((acc, current) => {
    const [key, parsedValue] = current.split(':');
    if (key && parsedValue) acc[key.trim()] = parsedValue.trim();
    return acc;
  }, {});

  const patchAdjustmentDraft = (variantKey, patch) => {
    setAdjustmentDrafts(prev => ({
      ...prev,
      [variantKey]: { ...(prev[variantKey] || createInventoryDraft()), ...patch }
    }));
  };

  const applyInventoryAdjustment = async (variant) => {
    if (!initialData?.id || !onAdjustInventory || !variant?.id) return;

    const variantKey = variant.id ?? variant.position;
    const draft = adjustmentDrafts[variantKey] || createInventoryDraft(variant);
    const quantity = parseInt(draft.quantity || '0', 10);
    const reorderThreshold = parseInt(draft.reorder_threshold || `${variant.reorderThreshold ?? 10}`, 10);

    if (!draft.reason.trim()) {
      setErrors(prev => ({ ...prev, inventory: 'Inventory reason is required.' }));
      return;
    }
    if (Number.isNaN(quantity) || quantity < 0) {
      setErrors(prev => ({ ...prev, inventory: 'Inventory quantity must be zero or greater.' }));
      return;
    }
    if (Number.isNaN(reorderThreshold) || reorderThreshold < 0) {
      setErrors(prev => ({ ...prev, inventory: 'Reorder threshold must be zero or greater.' }));
      return;
    }

    setErrors(prev => ({ ...prev, inventory: null }));
    setInventorySubmittingId(variant.id);
    try {
      const result = await onAdjustInventory(initialData.id, {
        variant_id: variant.id,
        adjustment_type: draft.adjustment_type,
        quantity,
        reason: draft.reason.trim(),
        reference_type: 'admin_manual',
        reference_id: draft.reference_id.trim() || null,
        reorder_threshold: reorderThreshold,
        track_inventory: variant.trackInventory ?? true
      });

      const nextVariant = {
        ...variant,
        stock: result.variant.available_quantity,
        availableQuantity: result.variant.available_quantity,
        reservedQuantity: result.variant.reserved_quantity,
        reorderThreshold: result.variant.reorder_threshold,
        trackInventory: result.variant.track_inventory
      };

      setInventoryVariants(prev => prev.map(item => (item.id === variant.id ? nextVariant : item)));
      setInventoryHistory(prev => result.adjustment ? [result.adjustment, ...prev].slice(0, 25) : prev);
      patchForm({ stock: result.product_stock });
      setFormData(prev => ({
        ...prev,
        variants: prev.variants.map(item => (
          item.id === variant.id
            ? { ...item, stock: result.variant.available_quantity, reorderThreshold: result.variant.reorder_threshold }
            : item
        ))
      }));
      patchAdjustmentDraft(variantKey, {
        quantity: '',
        reference_id: '',
        reorder_threshold: result.variant.reorder_threshold
      });
    } catch (error) {
      setErrors(prev => ({ ...prev, inventory: error.message || 'Failed to apply inventory adjustment.' }));
    } finally {
      setInventorySubmittingId(null);
    }
  };

  const startEditingSchedule = (schedule) => {
    setScheduleDraft({
      id: schedule.id,
      label: schedule.label || '',
      variant_id: schedule.variantId ?? schedule.variant_id ?? '',
      price: schedule.price ?? '',
      compare_at_price: schedule.compareAtPrice ?? schedule.compare_at_price ?? '',
      starts_at: (schedule.startsAt ?? schedule.starts_at ?? '').slice(0, 16),
      ends_at: (schedule.endsAt ?? schedule.ends_at ?? '').slice(0, 16),
      is_active: schedule.isActive ?? schedule.is_active ?? true
    });
  };

  const resetScheduleDraft = () => setScheduleDraft(createScheduleDraft());

  const saveSchedule = async () => {
    if (!initialData?.id || !onUpsertPricingSchedule) return;

    if (!scheduleDraft.price || Number.isNaN(parseFloat(scheduleDraft.price))) {
      setErrors(prev => ({ ...prev, pricing: 'Scheduled price is required.' }));
      return;
    }
    if (!scheduleDraft.starts_at) {
      setErrors(prev => ({ ...prev, pricing: 'Start date is required.' }));
      return;
    }
    if (scheduleDraft.ends_at && new Date(scheduleDraft.ends_at) <= new Date(scheduleDraft.starts_at)) {
      setErrors(prev => ({ ...prev, pricing: 'End date must be after start date.' }));
      return;
    }

    setScheduleSaving(true);
    try {
      const result = await onUpsertPricingSchedule(initialData.id, {
        id: scheduleDraft.id || null,
        label: scheduleDraft.label.trim() || null,
        product_id: initialData.id,
        variant_id: scheduleDraft.variant_id ? parseInt(scheduleDraft.variant_id, 10) : null,
        price: parseFloat(scheduleDraft.price),
        compare_at_price: scheduleDraft.compare_at_price ? parseFloat(scheduleDraft.compare_at_price) : null,
        starts_at: new Date(scheduleDraft.starts_at).toISOString(),
        ends_at: scheduleDraft.ends_at ? new Date(scheduleDraft.ends_at).toISOString() : null,
        is_active: scheduleDraft.is_active
      });
      if (result?.status === 'pending_approval') {
        setErrors(prev => ({ ...prev, pricing: null }));
        resetScheduleDraft();
        return;
      }
      setScheduledPrices(prev => {
        const next = prev.some(schedule => schedule.id === result.id)
          ? prev.map(schedule => (schedule.id === result.id ? result : schedule))
          : [result, ...prev];
        return next.sort((left, right) => new Date(right.startsAt || right.starts_at || 0) - new Date(left.startsAt || left.starts_at || 0));
      });
      setErrors(prev => ({ ...prev, pricing: null }));
      resetScheduleDraft();
    } catch (error) {
      setErrors(prev => ({ ...prev, pricing: error.message || 'Failed to save pricing schedule.' }));
    } finally {
      setScheduleSaving(false);
    }
  };

  const removeSchedule = async (scheduleId) => {
    if (!onDeletePricingSchedule) return;
    try {
      const result = await onDeletePricingSchedule(scheduleId);
      if (result?.status === 'pending_approval') {
        if (scheduleDraft.id === scheduleId) {
          resetScheduleDraft();
        }
        return;
      }
      setScheduledPrices(prev => prev.filter(schedule => schedule.id !== scheduleId));
      if (scheduleDraft.id === scheduleId) {
        resetScheduleDraft();
      }
    } catch (error) {
      setErrors(prev => ({ ...prev, pricing: error.message || 'Failed to delete pricing schedule.' }));
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!validate()) return;
    setSaving(true);
    try {
      await onSave({
        ...formData,
        price: parseFloat(formData.price),
        original_price: formData.original_price ? parseFloat(formData.original_price) : null,
        stock: parseInt(formData.stock || '0', 10) || 0,
        sale_percent: formData.sale_percent ? parseInt(formData.sale_percent, 10) : null,
        specs: formData.specs.reduce((acc, { key, value }) => {
          if (key.trim()) acc[key.trim()] = value.trim();
          return acc;
        }, {}),
        seo: {
          meta_title: formData.seo.meta_title || null,
          meta_description: formData.seo.meta_description || null,
          canonical_url: formData.seo.canonical_url || null,
          robots_directive: formData.seo.robots_directive || null
        },
        options: formData.product_type === 'configurable'
          ? formData.options
              .filter(option => option.name.trim())
              .map((option, optionIndex) => ({
                id: option.id,
                name: option.name.trim(),
                position: optionIndex + 1,
                values: option.values
                  .filter(value => value.value.trim())
                  .map((value, valueIndex) => ({
                    id: value.id,
                    value: value.value.trim(),
                    display_value: value.display_value?.trim() || value.value.trim(),
                    position: valueIndex + 1
                  }))
              }))
          : [],
        variants: formData.product_type === 'configurable'
          ? formData.variants.map((variant, index) => ({
              id: variant.id,
              title: variant.title,
              sku: variant.sku || null,
              slug: variant.slug || null,
              price: parseFloat(variant.price),
              compare_at_price: variant.compare_at_price ? parseFloat(variant.compare_at_price) : null,
              stock: parseInt(variant.stock || '0', 10) || 0,
              status: variant.status || 'active',
              position: index + 1,
              selected_options: (variant.selected_options || []).map(option => ({
                option_name: option.option_name,
                value: option.value,
                display_value: option.display_value || option.value
              }))
            }))
          : []
      });
      onClose();
    } catch (error) {
      console.error('Failed to save product:', error);
      setErrors({ submit: 'Failed to save product. Please try again.' });
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content product-form-modal">
        <header className="modal-header">
          <div className="modal-title-group">
            <h2>{initialData ? 'Edit Product' : 'Add New Product'}</h2>
            <p className="modal-subtitle">{formData.name || 'Untitled Piece'}</p>
          </div>
          <button onClick={onClose} className="close-btn"><X size={24} /></button>
        </header>

        <div className="product-form-tabs">
          {[
            { id: 'general', label: '1. Identity & Media' },
            { id: 'variants', label: '2. Options & Variants' },
            ...(initialData ? [
              { id: 'inventory', label: '3. Inventory & History' },
              { id: 'marketing', label: '4. Pricing & SEO' }
            ] : [
              { id: 'marketing', label: '3. SEO & Metadata' }
            ])
          ].map(tab => (
            <button
              key={tab.id}
              type="button"
              className={`form-tab-btn ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="product-form luxury-form-v2">
          {errors.submit && <div className="form-error-banner">{errors.submit}</div>}
          
          <div className="form-sections">
            {activeTab === 'general' && (
              <section className="form-section fade-in">
                <header className="section-title-group"><span className="section-number">01</span><h3>Core Identity</h3></header>
                <div className="section-content">
                  <div className={`form-group ${errors.name ? 'has-error' : ''}`}>
                    <label className="admin-label">Product Name</label>
                    <input type="text" className="admin-input" value={formData.name} onChange={e => patchForm({ name: e.target.value })} placeholder="e.g. Minimalist Velvet Sofa" />
                    {errors.name && <span className="error-text">{errors.name}</span>}
                  </div>
                  <div className="form-triple-grid">
                    <div className="form-group">
                      <label className="admin-label">Product Type</label>
                      <select className="admin-input" value={formData.product_type} onChange={e => patchForm({ product_type: e.target.value })}>
                        <option value="simple">Simple</option>
                        <option value="configurable">Configurable</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label className="admin-label">Slug</label>
                      <input type="text" className="admin-input" value={formData.slug} onChange={e => patchForm({ slug: e.target.value })} placeholder="minimalist-velvet-sofa" />
                    </div>
                    <div className="form-group">
                      <label className="admin-label">Default SKU</label>
                      <input type="text" className="admin-input" value={formData.sku} onChange={e => patchForm({ sku: e.target.value })} placeholder="CH-00001" />
                    </div>
                  </div>
                  <div className="form-group">
                    <label className="admin-label">Description</label>
                    <textarea className="admin-input" rows="4" value={formData.description} onChange={e => patchForm({ description: e.target.value })} placeholder="Describe the product features, materials..." />
                  </div>
                  <div className={`form-group ${errors.images ? 'has-error' : ''}`}>
                    <label className="admin-label">Media Gallery</label>
                    <div className="image-upload-grid">
                      {formData.images.map((url, index) => (
                        <div key={index} className="uploaded-image-v2">
                          <img src={url} alt="" />
                          <button type="button" onClick={() => removeImage(index)} className="remove-img"><Trash2 size={12} /></button>
                        </div>
                      ))}
                      <label className="image-upload-btn-v2">
                        <input type="file" hidden onChange={handleImageUpload} accept="image/*" />
                        {uploading ? <div className="spinner"></div> : <><Plus size={24} /><span>Add Photo</span></>}
                      </label>
                    </div>
                    {errors.images && <span className="error-text">{errors.images}</span>}
                  </div>
                </div>
              </section>
            )}

            {activeTab === 'variants' && (
              <section className="form-section fade-in">
                <header className="section-title-group"><span className="section-number">02</span><h3>Pricing & Variations</h3></header>
                <div className="section-content">
                  <div className="form-triple-grid">
                    <div className={`form-group ${errors.price ? 'has-error' : ''}`}>
                      <label className="admin-label">Base Price ($)</label>
                      <input type="number" className="admin-input" step="0.01" value={formData.price} onChange={e => patchForm({ price: e.target.value })} />
                      {errors.price && <span className="error-text">{errors.price}</span>}
                    </div>
                    <div className="form-group">
                      <label className="admin-label">Compare At</label>
                      <input type="number" className="admin-input" step="0.01" value={formData.original_price} onChange={e => patchForm({ original_price: e.target.value })} />
                    </div>
                    <div className="form-group">
                      <label className="admin-label">Initial Stock</label>
                      <input
                        type="number"
                        className="admin-input"
                        value={formData.stock}
                        onChange={e => patchForm({ stock: e.target.value })}
                        disabled={formData.product_type === 'configurable' || Boolean(initialData?.id)}
                      />
                    </div>
                  </div>

                  {formData.product_type === 'configurable' && (
                    <div className="configurable-matrix-v2">
                      <div className="form-group">
                        <div className="configurable-header-row">
                          <label className="admin-label">Product Options</label>
                          <div className="configurable-header-actions">
                            <button type="button" className="btn btn-secondary btn-small" onClick={addOption}><Plus size={14} /> Add Option</button>
                            <button type="button" className="btn btn-secondary btn-small" onClick={generateVariantsFromOptions}>Generate Matrix</button>
                          </div>
                        </div>
                        {errors.options && <span className="error-text">{errors.options}</span>}
                        <div className="option-editor-list">
                          {formData.options.map((option, optionIndex) => (
                            <div key={optionIndex} className="option-editor-card">
                              <div className="option-card-header">
                                <input type="text" className="admin-input" value={option.name} onChange={e => patchOption(optionIndex, { name: e.target.value })} placeholder="Option (Size, Color...)" />
                                <button type="button" onClick={() => removeOption(optionIndex)} className="remove-btn"><Trash2 size={14} /></button>
                              </div>
                              <div className="option-value-list">
                                {option.values.map((value, valueIndex) => (
                                  <div key={valueIndex} className="option-value-row">
                                    <input type="text" className="admin-input" value={value.value} onChange={e => patchOptionValue(optionIndex, valueIndex, { value: e.target.value })} placeholder="Value" />
                                    <button type="button" onClick={() => removeOptionValue(optionIndex, valueIndex)} className="remove-btn"><X size={14} /></button>
                                  </div>
                                ))}
                                <button type="button" className="btn-text-small" onClick={() => addOptionValue(optionIndex)}>+ Add Value</button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="form-group">
                        <label className="admin-label">Variant Matrix</label>
                        <div className="variant-editor-list">
                          {formData.variants.map((variant, index) => (
                            <div key={index} className="variant-editor-card">
                              <div className="variant-card-header">
                                <strong>{variant.title || 'New Variant'}</strong>
                                {variant.sku && <span className="sku-badge">{variant.sku}</span>}
                              </div>
                              <div className="form-triple-grid">
                                <div className="form-group">
                                  <label className="admin-label-small">SKU</label>
                                  <input type="text" className="admin-input" value={variant.sku} onChange={e => patchVariant(index, { sku: e.target.value })} />
                                </div>
                                <div className="form-group">
                                  <label className="admin-label-small">Price</label>
                                  <input type="number" className="admin-input" value={variant.price} onChange={e => patchVariant(index, { price: e.target.value })} />
                                </div>
                                <div className="form-group">
                                  <label className="admin-label-small">Stock</label>
                                  <input type="number" className="admin-input" value={variant.stock} onChange={e => patchVariant(index, { stock: e.target.value })} disabled={Boolean(initialData?.id)} />
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </section>
            )}

            {activeTab === 'inventory' && initialData && (
              <section className="form-section fade-in">
                <header className="section-title-group"><span className="section-number">03</span><h3>Inventory Control</h3></header>
                <div className="section-content">
                  <div className="inventory-adjustment-list">
                    {inventoryVariants.map((variant) => {
                      const variantKey = variant.id ?? variant.position;
                      const draft = adjustmentDrafts[variantKey] || createInventoryDraft(variant);
                      return (
                        <div key={variantKey} className="inventory-adjustment-card">
                          <div className="inventory-header">
                            <div>
                              <h4>{variant.title || formData.name}</h4>
                              <p>{variant.sku || 'No SKU'}</p>
                            </div>
                            <div className="stock-summary">
                              <strong>{variant.availableQuantity ?? variant.stock ?? 0} On Hand</strong>
                            </div>
                          </div>
                          <div className="inventory-adjustment-grid">
                            <select className="admin-input" value={draft.adjustment_type} onChange={e => patchAdjustmentDraft(variantKey, { adjustment_type: e.target.value })}>
                              <option value="increase">Add (+)</option>
                              <option value="decrease">Reduce (-)</option>
                              <option value="set">Set Exact (=)</option>
                            </select>
                            <input type="number" className="admin-input" placeholder="Qty" value={draft.quantity} onChange={e => patchAdjustmentDraft(variantKey, { quantity: e.target.value })} />
                            <button type="button" className="btn btn-primary" onClick={() => applyInventoryAdjustment(variant)} disabled={inventorySubmittingId === variant.id}>
                              {inventorySubmittingId === variant.id ? '...' : 'Apply'}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="inventory-history-panel" style={{ marginTop: '32px' }}>
                    <div className="inventory-history-panel__header">
                      <h4>Stock Adjustment History</h4>
                      <span className="badge">{inventoryHistory.length} entries</span>
                    </div>
                    {inventoryHistory.length > 0 ? (
                      <div className="inventory-history-table">
                        <div className="inventory-history-row inventory-history-row--head">
                          <span>When</span>
                          <span>Variant</span>
                          <span>Adjustment</span>
                          <span>Reason</span>
                        </div>
                        {inventoryHistory.map((entry) => (
                          <div key={entry.id} className="inventory-history-row">
                            <span>{new Date(entry.created_at).toLocaleDateString()}</span>
                            <span>{entry.variant_title || formData.name}</span>
                            <span className={entry.delta >= 0 ? 'delta-pos' : 'delta-neg'}>{entry.delta >= 0 ? `+${entry.delta}` : entry.delta}</span>
                            <span>{entry.reason}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="input-hint">No history found.</p>
                    )}
                  </div>
                </div>
              </section>
            )}

            {activeTab === 'marketing' && (
              <section className="form-section fade-in">
                <header className="section-title-group"><span className="section-number">04</span><h3>Marketing & SEO</h3></header>
                <div className="section-content">
                  <div className="form-pair-grid">
                    <div className="form-group">
                      <label className="admin-label">Brand Badging</label>
                      <div className="badge-selector">
                        {['new', 'sale', 'last', 'popular'].map(b => (
                          <button key={b} type="button" className={`badge-opt ${formData.badge === b ? 'active' : ''}`} onClick={() => patchForm({ badge: b })}>{b.toUpperCase()}</button>
                        ))}
                        <button type="button" className={`badge-opt ${!formData.badge ? 'active' : ''}`} onClick={() => patchForm({ badge: '' })}>NONE</button>
                      </div>
                    </div>
                    <div className="form-group">
                      <label className="luxury-toggle-v2" style={{ marginTop: '32px' }}>
                        <input type="checkbox" checked={formData.is_canadian_made} onChange={e => patchForm({ is_canadian_made: e.target.checked })} />
                        <div className="luxury-toggle-pill"><span>Canadian Made Heritage</span></div>
                      </label>
                    </div>
                  </div>
                  
                  <div className="form-group">
                    <label className="admin-label">Specifications Matrix</label>
                    <div className="specs-editor">
                      {formData.specs.map((spec, i) => (
                        <div key={i} className="spec-row">
                          <input type="text" className="admin-input" placeholder="Property" value={spec.key} onChange={e => updateSpec(i, { key: e.target.value })} />
                          <input type="text" className="admin-input" placeholder="Value" value={spec.value} onChange={e => updateSpec(i, { value: e.target.value })} />
                          <button type="button" onClick={() => removeSpec(i)}><Trash2 size={16} /></button>
                        </div>
                      ))}
                      <button type="button" className="btn btn-secondary btn-small" onClick={addSpec}>+ Add Detail</button>
                    </div>
                  </div>

                  <div className="form-group" style={{ marginTop: '24px' }}>
                    <label className="admin-label">Meta Description</label>
                    <textarea className="admin-input" rows="3" value={formData.seo.meta_description} onChange={e => patchSeo({ meta_description: e.target.value })} />
                  </div>

                  {initialData?.id && (
                    <div className="form-group pricing-schedule-section" style={{ marginTop: '32px', paddingTop: '32px', borderTop: '1px solid var(--border-light)' }}>
                      <label className="admin-label">Scheduled Pricing Rules</label>
                      <div className="pricing-schedule-list">
                        {scheduledPrices.map(schedule => (
                          <div key={schedule.id} className="schedule-card">
                            <div className="schedule-info">
                              <strong>${schedule.price}</strong>
                              <span>{schedule.label}</span>
                            </div>
                            <button type="button" onClick={() => removeSchedule(schedule.id)}><Trash2 size={14} /></button>
                          </div>
                        ))}
                        <p className="input-hint">Use the full Pricing Management tool for complex rule scheduling. Simple overrides can be added here.</p>
                      </div>
                    </div>
                  )}
                </div>
              </section>
            )}
          </div>

          <footer className="luxury-form-footer">
            <div className="footer-actions">
              <button type="button" onClick={onClose} className="btn-admin btn-admin-secondary">Discard</button>
              <button type="submit" className="btn-admin btn-admin-primary" disabled={saving}>
                {saving ? 'Processing...' : (initialData ? 'Commit Changes' : 'Publish Product')}
              </button>
            </div>
          </footer>
        </form>
      </div>
    </div>
  );
}
