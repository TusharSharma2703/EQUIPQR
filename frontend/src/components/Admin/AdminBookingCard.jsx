import React, { useState, useRef } from 'react';
import { CheckCircle, XCircle, RotateCcw, QrCode } from 'lucide-react';
import toast from 'react-hot-toast';

export const AdminBookingCard = ({ booking, onStatusUpdate }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const [currentStatus, setCurrentStatus] = useState(booking.status);
  // A ref updates instantly; state only updates after re-render, so a fast
  // second click could slip through a state-only check
  const processingRef = useRef(false);

  const handleStatusUpdate = async (status) => {
    if (processingRef.current || currentStatus === 'returned') return;
    processingRef.current = true;
    setIsProcessing(true);

    try {
      await onStatusUpdate(booking._id, status);
      setCurrentStatus(status);
      toast.success(`Booking ${status} successfully!`);
    } catch (err) {
      toast.error(err.message || 'Error updating booking');
    } finally {
      processingRef.current = false;
      setIsProcessing(false);
    }
  };

  return (
    <div className="booking-card">
      {/* Header */}
      <div className="booking-header">
        <div className="booking-user">
          <h3>{booking.user?.name}</h3>
          <p className="booking-email">{booking.user?.email}</p>
        </div>

        <div className="booking-meta">
          <span className={`status-badge ${currentStatus}`}>
            {currentStatus}
          </span>
          <div className="booking-date">
            {new Date(booking.createdAt).toLocaleString('en-IN', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
              hour12: true,
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

      {/* Actions */}
      <div className="booking-actions">
        {currentStatus === 'pending' && (
          <>
            <button
              onClick={() => handleStatusUpdate('approved')}
              className="btn-approve"
              disabled={isProcessing}
            >
              <CheckCircle size={18} /> Approve
            </button>
            <button
              onClick={() => handleStatusUpdate('rejected')}
              className="btn-reject"
              disabled={isProcessing}
            >
              <XCircle size={18} /> Reject
            </button>
          </>
        )}
        {currentStatus === 'approved' && (
          <button
            onClick={() => handleStatusUpdate('returned')}
            className="btn-return"
            disabled={isProcessing || currentStatus === 'returned'}
          >
            <RotateCcw size={18} /> {isProcessing ? 'Processing...' : 'Mark as Returned'}
          </button>
        )}
      </div>

      {/* View QR */}
      {booking.qrCode && (
        <div style={{ marginTop: '1.5rem', textAlign: 'right' }}>
          <button className="btn-view-qr" onClick={() => setShowQR(true)}>
            <QrCode size={18} /> View QR
          </button>
        </div>
      )}

      {/* QR Modal */}
      {showQR && (
        <div className="modal-overlay" onClick={() => setShowQR(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">Booking QR Code</h2>
              <button className="modal-close" onClick={() => setShowQR(false)}>✕</button>
            </div>
            <div className="modal-body" style={{ textAlign: 'center' }}>
              <img
                src={booking.qrCode}
                alt="QR Code"
                className="qr-code-image"
                style={{ width: '200px', height: '200px', borderRadius: '12px', marginBottom: '1rem' }}
              />
              <p style={{ color: '#64748b', fontSize: '0.9rem', fontWeight: '500' }}>
                Booking ID: {booking._id}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
