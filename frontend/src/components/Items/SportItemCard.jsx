import React from 'react';
import { Check } from 'lucide-react';

const sportIcons = {
  cricket: "🏏",
  football: "⚽",
  basketball: "🏀",
  tennis: "🎾",
  badminton: "🏸",
  volleyball: "🏐",
  table_tennis: "🏓",
  athletics: "🏃"
};

export const SportItemCard = ({ item, onAddToCart, isInCart, sport }) => {
  const handleAdd = () => {
    if (isInCart) {
      onAddToCart(item, 'remove');
    } else {
      onAddToCart(item, 'add');
    }
  };

  return (
    <div className="sport-item-card">
      <div className="item-header">
        <div className="item-info">
          <h3>{item.name}</h3>
          <p className="item-sport-label">{sportIcons[sport]} {sport.replace("_", " ").toUpperCase()}</p>
        </div>
        <div className="item-icon">
          {sportIcons[sport]}
        </div>
      </div>
      
      <div className="item-details">
        <div className="item-detail-row">
          <span className="detail-label">Total Stock</span>
          <span className="detail-value">{item.quantity}</span>
        </div>
        <div className="item-detail-row">
          <span className="detail-label">Available</span>
          <span className={`detail-value ${item.available > 0 ? 'available' : 'unavailable'}`}>
            {item.available}
          </span>
        </div>
      </div>

      {item.description && (
        <div className="item-description">
          <p>{item.description}</p>
        </div>
      )}

      <button
        onClick={handleAdd}
        disabled={item.available === 0 && !isInCart}
        className={`btn-add-to-cart ${isInCart ? 'in-cart' : ''}`}
      >
        {isInCart ? (
          <>
            <Check size={18} />
            Added to Cart
          </>
        ) : item.available > 0 ? (
          'Add to Cart'
        ) : (
          'Out of Stock'
        )}
      </button>
    </div>
  );
};