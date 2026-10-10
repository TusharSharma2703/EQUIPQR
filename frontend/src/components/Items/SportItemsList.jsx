import React, { useState, useEffect } from 'react';
import { SearchBar } from './SearchBar';
import { SportItemCard } from './SportItemCard';
import { EmptyState } from '../Common/EmptyState';
import { LoadingSpinner } from '../Common/LoadingSpinner';
import { ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';

export const SportItemsList = ({ sport, cart, onAddToCart, onBack, onViewCart }) => {
  const [items, setItems] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [sportDisplay, setSportDisplay] = useState('');



  const fetchItems = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${process.env.REACT_APP_BACKENDURL}/api/items/sport/${sport}`);
      const data = await res.json();
      // Only accept a real list; anything else (e.g. an error object) shows the empty state
      setItems(res.ok && Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setItems([]);
      toast.error('Error loading items');
    } finally {
      setLoading(false);
    }
  };

    useEffect(() => {
    fetchItems();
    setSportDisplay(sport.charAt(0).toUpperCase() + sport.slice(1).replace("_", " "));
  }, [sport]);

  const filteredItems = items.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <LoadingSpinner />;

  const cartItemsInSport = cart.filter(c => c.item.sport === sport);

  return (
    <div>
      <div className="sport-items-header">
        <button onClick={onBack} className="btn-back-sport">
          <ArrowLeft size={20} />
          Back
        </button>
        <div>
          <h2 className="page-title">🏏 {sportDisplay} Equipment</h2>
          <p className="sport-subtitle">Select equipment to book (max 1 of each item)</p>
        </div>
      </div>

      <SearchBar
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        cartCount={cartItemsInSport.length}
        onViewCart={onViewCart}
        sport={sport}
      />

      {filteredItems.length === 0 ? (
        <EmptyState
          icon={() => <div style={{ fontSize: '4rem' }}>📭</div>}
          message="No items found for this sport"
        />
      ) : (
        <div className="items-grid">
          {filteredItems.map(item => (
            <SportItemCard
              key={item._id}
              item={item}
              onAddToCart={onAddToCart}
              isInCart={cart.some(c => c.item._id === item._id)}
              sport={sport}
            />
          ))}
        </div>
      )}
    </div>
  );
};