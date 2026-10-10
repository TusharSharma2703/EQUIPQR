
import React from 'react';
import { Minus, Plus } from 'lucide-react';

export const CartItem = ({ cartItem, onRemove }) => {
  return (
    <div className="cart-item">
      <div className="cart-item-info">
        <h3 className="cart-item-name">{cartItem.item.name}</h3>
        <p className="cart-item-available">Available: {cartItem.item.available}</p>
      </div>

      <div className="cart-item-actions">
        <div className="quantity-control">
          <button className="btn-quantity" disabled>
            <Minus size={18} />
          </button>
          <span className="quantity-value">{cartItem.quantity}</span>
          <button className="btn-quantity" disabled>
            <Plus size={18} />
          </button>
        </div>

        <button
          onClick={() => onRemove(cartItem.item._id)}
          className="btn-remove"
        >
          Remove
        </button>
      </div>
    </div>
  );
};