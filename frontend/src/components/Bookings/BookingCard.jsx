import React, { useState } from 'react';

export const BookingCard = ({ booking }) => {
  const [showQR, setShowQR] = useState(false);

  return (
    <div className="booking-card">
      {/* Header */}
      <div className="booking-header">
        <div>
          <span className={`status-badge ${booking.status}`}>
            {booking.status}
          </span>
        </div>
        <div className="booking-meta">
          <div className="booking-date">
            {new Date(booking.createdAt).toLocaleString('en-IN', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
              hour12: true, // change to false for 24h format
            })}
          </div>
        </div>
      </div>

      {/* Items */}
      <div className="booking-items">
        {booking.items.map((item, idx) => (
          <div key={idx} className="booking-item-row">
            <span className="booking-item-name">{item.item?.name}</span>
            <span className="booking-item-qty">Qty: {item.quantity}</span>
          </div>
        ))}
      </div>

      {/* ✅ View QR Button */}
      {booking.qrCode && (
        <div style={{ marginTop: '1.5rem', textAlign: 'right' }}>
          <button
            className="btn-view-qr"
            onClick={() => setShowQR(true)}
          >
            🧾 View QR
          </button>
        </div>
      )}

      {/* ✅ QR Modal */}
      {showQR && (
        <div className="modal-overlay" onClick={() => setShowQR(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">Booking QR Code</h2>
              <button
                className="modal-close"
                onClick={() => setShowQR(false)}
              >
                ✕
              </button>
            </div>
            <div className="modal-body" style={{ textAlign: 'center' }}>
              <img
                src={booking.qrCode}
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
                Booking ID: {booking._id}
              </p>
              <p
                style={{
                  color: '#64748b',
                  fontSize: '0.9rem',
                  fontWeight: '500',
                }}
              >
                Created:{' '}
                {new Date(booking.createdAt).toLocaleString('en-IN', {
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
