import React, { useState, useEffect } from 'react';
import { Calendar } from 'lucide-react';
import { BookingCard } from './BookingCard';
import { EmptyState } from '../Common/EmptyState';
import { LoadingSpinner } from '../Common/LoadingSpinner';
import { apiService } from '../../services/api';

export const BookingsList = ({ userId, token }) => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('pending'); // 👈 current tab filter

  

  const fetchBookings = async () => {
    try {
      const data = await apiService.getMyBookings(token);
      setBookings(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const filteredBookings = bookings.filter(b => b.status === filter);

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <h2 className="page-title">My Bookings</h2>

      {/* Filter Buttons */}
      <div className="booking-filter-container">
        <button
          className={`booking-filter-btn ${filter === 'pending' ? 'active' : ''}`}
          onClick={() => setFilter('pending')}
        >
          ⏳ Pending
        </button>
        <button
          className={`booking-filter-btn ${filter === 'approved' ? 'active' : ''}`}
          onClick={() => setFilter('approved')}
        >
          ✅ Approved
        </button>
        <button
          className={`booking-filter-btn ${filter === 'returned' ? 'active' : ''}`}
          onClick={() => setFilter('returned')}
        >
          🔁 Returned
        </button>
      </div>

      {filteredBookings.length === 0 ? (
        <EmptyState icon={Calendar} message={`No ${filter} bookings yet`} />
      ) : (
        <div className="booking-list">
          {filteredBookings.map(booking => (
            <BookingCard key={booking._id} booking={booking} />
          ))}
        </div>
      )}
    </div>
  );
};
