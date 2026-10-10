import React, { useState, useRef, useEffect } from 'react';
import { Scanner } from '@yudiel/react-qr-scanner';
import { ScanModal } from './ScanModal';
import toast from 'react-hot-toast';

export const QRScanner = ({ token, onBack }) => {
  const [scannedBooking, setScannedBooking] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const lastScannedRef = useRef(null);
  const updatingRef = useRef(false);
  const scanTimeoutRef = useRef(null);

  const handleScan = async (result) => {
    if (!result || isProcessing) return;

    let bookingId;
    let scannedText;

    try {
      scannedText = result[0]?.rawValue || result?.text || result;
      console.log('Scanned text:', scannedText);

      if (lastScannedRef.current === scannedText) {
        console.log('Duplicate scan prevented');
        return;
      }

      const parsed = JSON.parse(scannedText);
      bookingId = parsed.bookingId;
    } catch (err) {
      console.error('QR Parse Error:', err);
      toast.error('Invalid QR code format');
      return;
    }

    if (!bookingId) {
      toast.error('Invalid QR code - no booking ID found');
      return;
    }

    setIsProcessing(true);
    lastScannedRef.current = scannedText;

    // Allow re-scanning of the same QR after 1s
    if (scanTimeoutRef.current) clearTimeout(scanTimeoutRef.current);
    scanTimeoutRef.current = setTimeout(() => {
      lastScannedRef.current = null;
    }, 1000);

    try {
      const res = await fetch(`${process.env.REACT_APP_BACKENDURL}/api/bookings/${bookingId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();

      if (res.ok) {
        const bookingData = data.booking || data;
        setScannedBooking(bookingData);
        setShowModal(true);
        toast.success('Booking scanned successfully!');
      } else {
        toast.error(data.message || 'Booking not found');
      }
    } catch (err) {
      console.error('Fetch Error:', err);
      toast.error('Error fetching booking details');
    } finally {
      // ✅ Unlock scanner so next QR can be scanned (even if modal shows)
      setIsProcessing(false);
    }
  };

  const updateBookingStatus = async (status, successMessage, errorMessage) => {
    if (!scannedBooking || updatingRef.current) return;
    updatingRef.current = true;

    try {
      const bookingId = scannedBooking._id || scannedBooking.id;
      const res = await fetch(
        `${process.env.REACT_APP_BACKENDURL}/api/bookings/${bookingId}/status`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({ status }),
        }
      );

      const data = await res.json();

      if (res.ok) {
        toast.success(successMessage);
        closeModal(); // ✅ Modal close resets scanner now
      } else {
        toast.error(data.message || errorMessage);
      }
    } catch (err) {
      console.error('Status Update Error:', err);
      toast.error(errorMessage);
    } finally {
      updatingRef.current = false;
    }
  };

  const handleApprove = () =>
    updateBookingStatus('approved', '✅ Booking approved successfully!', 'Error approving booking');
  const handleReject = () =>
    updateBookingStatus('rejected', '❌ Booking rejected. Stock restored.', 'Error rejecting booking');
  const handleReturn = () =>
    updateBookingStatus('returned', '📦 Booking marked as returned! Stock restored.', 'Error returning booking');

  const closeModal = () => {
    setShowModal(false);
    setScannedBooking(null);
    // ✅ Allow next scans immediately
    setIsProcessing(false);
    lastScannedRef.current = null;
  };

  useEffect(() => {
    return () => {
      if (scanTimeoutRef.current) clearTimeout(scanTimeoutRef.current);
    };
  }, []);

  return (
    <div className="scanner-container">
      <h2 className="page-title">📷 Scan Booking QR Code</h2>

      <div className="scanner-wrapper-fullscreen">
        <Scanner
          onScan={handleScan}
          onError={(err) => {
            console.error('Scanner Error:', err);
            toast.error('Scanner error - check camera permissions');
          }}
          constraints={{ facingMode: 'environment' }}
          styles={{
            container: {
              width: '100%',
              borderRadius: '16px',
              overflow: 'hidden'
            }
          }}
        />
        <div className="scanner-instructions">
          {isProcessing ? (
            <span>⏳ Processing scan...</span>
          ) : (
            <span>📱 Position the QR code within the frame to scan</span>
          )}
        </div>
      </div>

      {showModal && scannedBooking && (
        <ScanModal
          booking={scannedBooking}
          onClose={closeModal}
          onApprove={handleApprove}
          onReject={handleReject}
          onReturn={handleReturn}
        />
      )}

      <button
        onClick={onBack}
        className="btn-back"
        style={{ marginTop: '2rem', width: '100%' }}
      >
        ← Back to Admin Panel
      </button>
    </div>
  );
};
