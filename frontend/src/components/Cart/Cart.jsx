import React, { useState } from 'react';
import { ShoppingCart, User } from 'lucide-react';
import { CartItem } from './CartItem';
import { EmptyState } from '../Common/EmptyState';
import { apiService } from '../../services/api';
import toast from 'react-hot-toast';

export const Cart = ({ cart, onRemove, onBack, token, onBookingCreated }) => {
   const[loading,setloading] = useState(false);
  
  const createBooking = async () => {
    if(loading) return;

    setloading(true);
    try {
      const bookingItems = cart.map(c => ({
        item: c.item._id,
        quantity: c.quantity
      }));

      const res = await fetch(`${process.env.REACT_APP_BACKENDURL}/api/bookings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ items: bookingItems })
      });

      if (res.ok) {
        toast.success('Booking created successfully!');
        onBookingCreated();
      } else {
        const data = await res.json();
        toast.error(data.message || 'Booking failed');
      }
    } catch (err) {
      toast.error('Network error. Please try again.');
    } finally {
      setloading(false);
    }
  };

  return (
    <div>
      <div className="page-header">
        <h2 className="page-title">Shopping Cart</h2>
        <button onClick={onBack} className="btn-back">
          ← Back to Items
        </button>
      </div>

      {cart.length === 0 ? (
        <EmptyState
          icon={ShoppingCart}
          message="Your cart is empty"
        />
      ) : (
        <div className="cart-list">
          {cart.map(cartItem => (
            <CartItem
              key={cartItem.item._id}
              cartItem={cartItem}
              onRemove={onRemove}
            />
          ))}

          <button onClick={createBooking} className="btn-create-booking" disabled = {loading}>
            Create Booking
          </button>
        </div>
      )}
    </div>
  );
};