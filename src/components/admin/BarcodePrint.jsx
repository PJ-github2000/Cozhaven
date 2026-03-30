import React from 'react';
import Barcode from 'react-barcode';
import './BarcodePrint.css';

export default function BarcodePrint({ product }) {
  if (!product) return null;

  // Generate a predictable SKU-like value for the barcode if one doesn't exist
  const barcodeValue = product.sku || `CH${String(product.id).padStart(6, '0')}`;

  return (
    <div className="barcode-print-tag">
      <div className="barcode-print-tag__header">
        <h2 className="barcode-print-tag__brand">Cozhaven</h2>
        <span className="barcode-print-tag__category">{product.category}</span>
      </div>
      
      <div className="barcode-print-tag__info">
        <h1 className="barcode-print-tag__name">{product.name}</h1>
        <div className="barcode-print-tag__price">
          ${product.price?.toLocaleString()}
        </div>
      </div>

      <div className="barcode-print-tag__details">
        {product.specs?.dimensions && (
          <div className="barcode-print-tag__spec">
            <strong>Dims:</strong> {product.specs.dimensions}
          </div>
        )}
        <div className="barcode-print-tag__spec">
          <strong>Warranty:</strong> 10-Year Framework
        </div>
        <div className="barcode-print-tag__financing">
          ${Math.floor(product.price / 12)}/mo financing available
        </div>
      </div>

      <div className="barcode-print-tag__code">
        <Barcode 
          value={barcodeValue} 
          width={1.2} 
          height={50} 
          fontSize={10}
          margin={0}
        />
      </div>

      <div className="barcode-print-tag__footer">
        <span>Premium Canadian-Made Furniture</span>
      </div>
    </div>
  );
}
