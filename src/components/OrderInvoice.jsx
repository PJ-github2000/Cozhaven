import React from 'react';
import './OrderInvoice.css';

export default function OrderInvoice({ order }) {
  if (!order) return null;

  const subtotal = order.items?.reduce((acc, item) => acc + (item.price * item.quantity), 0) || order.total_amount;
  const hst = subtotal * 0.13; // Assuming 13% HST for Ontario, Canada
  const total = subtotal + hst;

  return (
    <div className="invoice-document">
      <div className="invoice-header">
        <div className="invoice-brand">
          <h1>Cozhaven</h1>
          <p>Premium Canadian Furniture</p>
        </div>
        <div className="invoice-meta">
          <h2>INVOICE</h2>
          <p><strong>Order #:</strong> {1000 + order.id}</p>
          <p><strong>Date:</strong> {new Date(order.created_at || Date.now()).toLocaleDateString()}</p>
          <p><strong>Status:</strong> {order.status?.toUpperCase()}</p>
        </div>
      </div>

      <div className="invoice-addresses">
        <div className="address-block">
          <h3>From:</h3>
          <strong>Cozhaven Inc.</strong>
          <p>123 Furniture Way</p>
          <p>Toronto, ON M5V 2L7</p>
          <p>Canada</p>
          <p>GST/HST: 12345 6789 RT0001</p>
        </div>
        <div className="address-block">
          <h3>Bill To:</h3>
          <strong>{order.customer_name}</strong>
          <p>{order.user_email}</p>
          <p>{order.shipping_address || 'Address not provided'}</p>
        </div>
      </div>

      <table className="invoice-table">
        <thead>
          <tr>
            <th>Item Details</th>
            <th className="text-right">Price</th>
            <th className="text-center">Qty</th>
            <th className="text-right">Subtotal</th>
          </tr>
        </thead>
        <tbody>
          {order.items?.map((item, index) => (
            <tr key={index}>
              <td>
                <div className="item-name">{item.product_name}</div>
                <div className="item-variant">
                  {item.color && <span>Color: {item.color}</span>}
                  {item.size && <span>Size: {item.size}</span>}
                  {item.configuration && <span>Config: {item.configuration}</span>}
                  {item.material && <span>Material: {item.material}</span>}
                </div>
              </td>
              <td className="text-right">${item.price.toLocaleString()}</td>
              <td className="text-center">{item.quantity}</td>
              <td className="text-right">${(item.price * item.quantity).toLocaleString()}</td>
            </tr>
          )) || (
            <tr>
              <td>Standard Order Item</td>
              <td className="text-right">${order.total_amount.toLocaleString()}</td>
              <td className="text-center">1</td>
              <td className="text-right">${order.total_amount.toLocaleString()}</td>
            </tr>
          )}
        </tbody>
      </table>

      <div className="invoice-footer">
        <div className="invoice-notes">
          <h3>Notes:</h3>
          <p>Thank you for choosing Cozhaven. Your order is backed by our 10-Year Framework Warranty.</p>
          <p>For support, contact hello@cozhaven.ca</p>
        </div>
        <div className="invoice-totals">
          <div className="total-row">
            <span>Subtotal</span>
            <span>${subtotal.toLocaleString()}</span>
          </div>
          <div className="total-row">
            <span>HST (13%)</span>
            <span>${hst.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
          </div>
          <div className="total-row grand-total">
            <span>Total Amount</span>
            <span>${total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
          </div>
        </div>
      </div>

      <div className="invoice-disclaimer">
        <p>This is a computer-generated document. No signature is required.</p>
      </div>
    </div>
  );
}
