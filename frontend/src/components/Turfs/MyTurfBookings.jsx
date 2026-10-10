import React, { useState, useEffect } from 'react';
import { Calendar, Clock, MapPin } from 'lucide-react';
import { apiService } from '../../services/api';
import toast from 'react-hot-toast';

// Show "17:00" as "05:00 PM" (older bookings already saved as "05:00 PM" pass through)
const to12h = (time) => {
  const match = /^(\d{2}):(\d{2})$/.exec(time || "");
  if (!match) return time;
  const hours = Number(match[1]);
  const suffix = hours >= 12 ? "PM" : "AM";
  return `${String(hours % 12 || 12).padStart(2, "0")}:${match[2]} ${suffix}`;
};

export const MyTurfBookings = ({ token }) => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const data = await apiService.getUserTurfBookings(token);
      setBookings(data);
    } catch (err) {
      toast.error('Error loading bookings');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (booking) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) {
      return;
    }

    try {
      await apiService.cancelTurfBooking(
        booking.turfId,
        booking.date,
        booking.startTime,
        booking.endTime,
        token
      );
      toast.success('Booking cancelled ✅');
      fetchBookings(); // Refresh
    } catch (err) {
      toast.error('Error cancelling booking');
    }
  };

  const typeEmojis = {
    badminton: '🏸',
    tennis: '🎾',
    cricket: '🏏',
    football: '⚽',
    volleyball: '🏐'
  };

  if (loading) {
    return <div className="loading">Loading bookings...</div>;
  }

  if (bookings.length === 0) {
    return (
      <div className="empty-state">
        <Calendar size={80} />
        <p>No turf bookings yet</p>
      </div>
    );
  }

  return (
    <div className="my-turf-bookings">
      <h2>🏟️ My Turf Bookings</h2>
      
      <div className="bookings-grid">
        {bookings.map((booking) => (
          <div key={booking._id} className="turf-booking-card">
            <div className="booking-card-header">
              <span className="turf-type-icon">
                {typeEmojis[booking.turfType]}
              </span>
              <div>
                <h3>{booking.turfName}</h3>
                <p className="turf-type">{booking.turfType.toUpperCase()}</p>
              </div>
            </div>

            <div className="booking-card-body">
              <div className="booking-detail">
                <Calendar size={18} />
                <span>{new Date(booking.date).toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}</span>
              </div>

              <div className="booking-detail">
                <Clock size={18} />
                <span>{to12h(booking.startTime)} - {to12h(booking.endTime)}</span>
              </div>

              <div className="booking-detail">
                <MapPin size={18} />
                <span>Sports Complex</span>
              </div>
            </div>

            <button
              onClick={() => handleCancel(booking)}
              className="btn-cancel-booking"
            >
              Cancel Booking
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};