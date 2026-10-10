import React, { useState, useEffect } from 'react';
import { AdminBookingCard } from './AdminBookingCard';
import { LoadingSpinner } from '../Common/LoadingSpinner';
import { apiService } from '../../services/api';
import { Search } from 'lucide-react';

export const AdminPanel = ({ token, onScanQR }) => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('pending');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBooking, setSelectedBooking] = useState(null); // For QR modal

  

  const fetchBookings = async () => {
    try {
      const data = await apiService.getBookings(token);
      const sortedData = data.sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );
      setBookings(sortedData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const handleStatusUpdate = async (bookingId, status) => {
    await apiService.updateBookingStatus(bookingId, status, token);
    fetchBookings();
  };

  // ✅ Filter and search
  const filteredBookings =
    filter === 'all' ? bookings : bookings.filter(b => b.status === filter);

  const searchedBookings = filteredBookings.filter(b => {
    const query = searchQuery.toLowerCase();
    return (
      b.user?.name?.toLowerCase().includes(query) ||
      b.user?.email?.toLowerCase().includes(query)
    );
  });

  const showNoResults =
    searchQuery.trim() !== '' && searchedBookings.length === 0;

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <h2 className="page-title">Admin Panel - All Bookings</h2>

      {/* 🔍 Search Bar */}
      <div className="search-container">
        <div className="search-bar">
          <Search size={18} color="#64748b" />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="booking-filter-container">
        {['all', 'pending', 'approved', 'returned'].map((tab) => (
          <button
            key={tab}
            className={`booking-filter-btn ${filter === tab ? 'active' : ''}`}
            onClick={() => setFilter(tab)}
          >
            {tab === 'all' && '📋 All'}
            {tab === 'pending' && '⏳ Pending'}
            {tab === 'approved' && '✅ Approved'}
            {tab === 'returned' && '🔁 Returned'}
          </button>
        ))}
      </div>

      <button onClick={onScanQR} className="btn-scan" style={{ marginBottom: '2rem' }}>
        📷 Scan QR
      </button>

      {/* ✅ Render Bookings */}
      {searchedBookings.length === 0 ? (
        showNoResults ? (
          <p style={{ textAlign: 'center', color: '#64748b', fontWeight: '500' }}>
            No bookings found for “{searchQuery}”.
          </p>
        ) : (
          <p style={{ textAlign: 'center', color: '#64748b', fontWeight: '500' }}>
            No {filter !== 'all' ? filter : ''} bookings found.
          </p>
        )
      ) : (
        <div className="booking-list">
          {searchedBookings.map(booking => (
            <AdminBookingCard
              key={booking._id}
              booking={booking}
              onStatusUpdate={handleStatusUpdate}
              onViewQR={() => setSelectedBooking(booking)} // pass QR trigger
            />
          ))}
        </div>
      )}

      {/* ✅ QR Modal */}
      {selectedBooking && (
        <div className="modal-overlay" onClick={() => setSelectedBooking(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">Booking QR Code</h2>
              <button className="modal-close" onClick={() => setSelectedBooking(null)}>
                ✕
              </button>
            </div>

            <div className="modal-body" style={{ textAlign: 'center' }}>
              <img
                src={selectedBooking.qrCode}
                alt="QR Code"
                className="qr-code-image"
                style={{
                  width: '200px',
                  height: '200px',
                  borderRadius: '12px',
                  marginBottom: '1rem',
                }}
              />
              <p
                style={{
                  color: '#64748b',
                  fontSize: '0.9rem',
                  fontWeight: '500',
                  marginBottom: '0.5rem',
                }}
              >
                Booking ID: {selectedBooking._id}
              </p>
              <p
                style={{
                  color: '#64748b',
                  fontSize: '0.9rem',
                  fontWeight: '500',
                }}
              >
                Created:{' '}
                {new Date(selectedBooking.createdAt).toLocaleString('en-IN', {
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                  hour12: true,
                })}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
