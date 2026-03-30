/**
 * Analytics Event Tracking - GA4 Ready
 * 
 * Usage:
 * import { trackEvent, trackAddToCart, trackViewProduct } from '../utils/analytics';
 * 
 * // Track custom event
 * trackEvent('search', { search_term: 'sofa' });
 * 
 * // Track e-commerce events
 * trackAddToCart(product, quantity);
 * trackViewProduct(product);
 */

// Generic event tracking
export const trackEvent = (eventName, params = {}) => {
  // Send to GA4 if available
  if (window.gtag) {
    window.gtag('event', eventName, params);
  }
  
  // Log in development for testing
  if (import.meta.env.DEV) {
    console.log('📊 Analytics Event:', eventName, params);
  }
  
  // You can add more analytics providers here (e.g., Facebook Pixel, Mixpanel)
  // Example: fbq('track', eventName, params);
};

// E-commerce: View Product
export const trackViewProduct = (product) => {
  trackEvent('view_item', {
    currency: 'CAD',
    value: product.price,
    items: [{
      item_id: product.id,
      item_name: product.name,
      item_category: product.category,
      price: product.price,
    }]
  });
};

// E-commerce: Add to Cart
export const trackAddToCart = (product, quantity = 1, color, size) => {
  trackEvent('add_to_cart', {
    currency: 'CAD',
    value: product.price * quantity,
    items: [{
      item_id: product.id,
      item_name: product.name,
      item_category: product.category,
      price: product.price,
      quantity: quantity,
      ...(color && { item_variant2: color }),
      ...(size && { item_variant: size }),
    }]
  });
};

// E-commerce: Remove from Cart
export const trackRemoveFromCart = (product, quantity = 1) => {
  trackEvent('remove_from_cart', {
    currency: 'CAD',
    value: product.price * quantity,
    items: [{
      item_id: product.id,
      item_name: product.name,
      item_category: product.category,
      price: product.price,
      quantity: quantity,
    }]
  });
};

// E-commerce: View Cart
export const trackViewCart = (cart) => {
  trackEvent('view_cart', {
    currency: 'CAD',
    value: cart.subtotal,
    items: cart.items.map(item => ({
      item_id: item.id,
      item_name: item.name,
      item_category: item.category,
      price: item.price,
      quantity: item.quantity,
    }))
  });
};

// E-commerce: Begin Checkout
export const trackBeginCheckout = (cart) => {
  trackEvent('begin_checkout', {
    currency: 'CAD',
    value: cart.subtotal,
    coupon: cart.couponCode || null,
    items: cart.items.map(item => ({
      item_id: item.id,
      item_name: item.name,
      item_category: item.category,
      price: item.price,
      quantity: item.quantity,
    }))
  });
};

// E-commerce: Add Shipping Info
export const trackAddShippingInfo = (shippingData) => {
  trackEvent('add_shipping_info', {
    currency: 'CAD',
    shipping_tier: shippingData.method,
    shipping: shippingData.cost || 0,
  });
};

// E-commerce: Add Payment Info
export const trackAddPaymentInfo = (paymentData) => {
  trackEvent('add_payment_info', {
    currency: 'CAD',
    payment_type: paymentData.method,
  });
};

// E-commerce: Purchase (Order Success)
export const trackPurchase = (orderData) => {
  trackEvent('purchase', {
    transaction_id: orderData.orderNumber,
    currency: 'CAD',
    value: orderData.total,
    tax: orderData.tax || 0,
    shipping: orderData.shippingCost || 0,
    coupon: orderData.discountCode || null,
    items: orderData.items.map(item => ({
      item_id: item.id,
      item_name: item.name,
      item_category: item.category,
      price: item.price,
      quantity: item.quantity,
    }))
  });
};

// Engagement: Search
export const trackSearch = (searchTerm, resultsCount) => {
  trackEvent('search', {
    search_term: searchTerm,
    ...(resultsCount !== undefined && { search_results: resultsCount }),
  });
};

// Engagement: Select Item (from search/results)
export const trackSelectItem = (product, source) => {
  trackEvent('select_item', {
    item_list_name: source,
    items: [{
      item_id: product.id,
      item_name: product.name,
      item_category: product.category,
    }]
  });
};

// Engagement: View Item List (category page, featured products)
export const trackViewItemList = (products, listName) => {
  trackEvent('view_item_list', {
    item_list_name: listName,
    items: products.map(product => ({
      item_id: product.id,
      item_name: product.name,
      item_category: product.category,
      index: products.indexOf(product),
    }))
  });
};

// Lead: Sign Up / Newsletter Subscription
export const trackLead = (method) => {
  trackEvent('sign_up', {
    method: method || 'email',
  });
};

// Lead: Contact Form Submission
export const trackContact = () => {
  trackEvent('contact', {
    method: 'contact_form',
  });
};

// Error Tracking
export const trackError = (errorDescription, errorType = 'JavaScript Error') => {
  trackEvent('exception', {
    description: errorDescription,
    fatal: false,
  });
  
  if (import.meta.env.DEV) {
    console.error('❌ Error Tracked:', errorDescription);
  }
};

// Page View (for manual tracking if needed)
export const trackPageView = (pagePath, pageTitle) => {
  if (window.gtag) {
    window.gtag('config', 'G-XXXXXXXXXX', {
      page_path: pagePath,
      page_title: pageTitle,
    });
  }
};
