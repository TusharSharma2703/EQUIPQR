import React from 'react';
import { CheckCircle, XCircle, RotateCcw } from 'lucide-react';

export const ScanModal = ({ 
  booking, 
  onClose, 
  onApprove, 
  onReject, 
  onReturn 
}) => {
  if (!booking) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">🎫 Booking Details</h2>
          <button className="modal-close" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="modal-body">
          <div className="modal-user-info">
            <h3>{booking.user.name}</h3>
            <p>{booking.user.email}</p>
          </div>

          <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
            <span 
              className={`status-badge ${booking.status}`} 
              style={{ fontSize: '1rem', padding: '0.75rem 1.5rem' }}
            >
              {booking.status.toUpperCase()}
            </span>
          </div>

          <div className="modal-booking-date">
            📅 Booked on {new Date(booking.createdAt).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </div>

          <div className="booking-items">
            <h4 style={{ 
              fontSize: '1.1rem', 
              fontWeight: '700', 
              color: '#1e293b', 
              marginBottom: '1rem' 
            }}>
              📦 Items:
            </h4>
            {booking.items.map((item, idx) => (
              <div 
                key={idx} 
                className="booking-item-row" 
                style={{ marginBottom: '0.75rem' }}
              >
                <div>
                  <span className="booking-item-name">{item.item.name}</span>
                  <div style={{ 
                    fontSize: '0.85rem', 
                    color: '#64748b', 
                    marginTop: '0.25rem' 
                  }}>
                    Available: {item.item.available} | Requested: {item.quantity}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {booking.status === 'returned' && (
            <div style={{
              padding: '1rem',
              background: '#dbeafe',
              color: '#1e40af',
              borderRadius: '12px',
              textAlign: 'center',
              fontWeight: '600',
              marginTop: '1.5rem'
            }}>
              ✅ This booking has already been returned
            </div>
          )}

          {booking.status === 'rejected' && (
            <div style={{
              padding: '1rem',
              background: '#fee2e2',
              color: '#991b1b',
              borderRadius: '12px',
              textAlign: 'center',
              fontWeight: '600',
              marginTop: '1.5rem'
            }}>
              ❌ This booking has been rejected
            </div>
          )}
        </div>

        <div className="modal-footer">
          {booking.status === 'pending' && (
            <>
              <button onClick={onApprove} className="btn-approve">
                <CheckCircle size={18} />
                Approve
              </button>
              <button onClick={onReject} className="btn-reject">
                <XCircle size={18} />
                Reject
              </button>
            </>
          )}

          {booking.status === 'approved' && (
            <button onClick={onReturn} className="btn-return">
              <RotateCcw size={18} />
              Mark as Returned
            </button>
          )}

          <button 
            onClick={onClose} 
            className="btn-back" 
            style={{ flex: booking.status === 'pending' ? 0.3 : 1 }}
          >
            {booking.status === 'pending' ? 'Cancel' : 'Scan Another'}
          </button>
        </div>
      </div>
    </div>
  );
};