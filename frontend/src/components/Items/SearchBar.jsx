import React from 'react';
import { Search, ShoppingCart } from 'lucide-react';

export const SearchBar = ({ searchTerm, onSearchChange, cartCount, onViewCart }) => {
  return (
    <div className="search-bar-container">
      <div className="search-wrapper">
        <Search className="search-icon" size={20} />
        <input
          type="text"
          placeholder="Search items..."
          className="search-input"
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>
      
      {cartCount > 0 && (
        <div className="cart-info">
          <span className="cart-badge">🛒 {cartCount} items</span>
          <button onClick={onViewCart} className="btn-cart">
            <ShoppingCart size={20} />
            View Cart
          </button>
        </div>
      )}
    </div>
  );
};