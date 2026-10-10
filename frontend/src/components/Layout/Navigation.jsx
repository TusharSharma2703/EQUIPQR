import React from 'react';

export const Navigation = ({ activeView, onViewChange, isAdmin }) => {
  const isSportsView = ['sports-home', 'sport-items', 'cart', 'bookings'].includes(activeView);

  return (
    <nav className="nav-bar">
      <div className="nav-content">
        {/* Sports / Equipment Section */}
        <button
          onClick={() => onViewChange('sports-home')}
          className={`nav-button ${isSportsView ? 'active' : ''}`}
        >
          🏏 Browse Equipment
        </button>

        {/* Equipment Bookings */}
        <button
          onClick={() => onViewChange('bookings')}
          className={`nav-button ${activeView === 'bookings' ? 'active' : ''}`}
        >
          📋 My Bookings
        </button>

        {/* Turf Booking Section */}
<button
  onClick={() => onViewChange('turf-types')}
  className={`nav-button ${activeView.startsWith('turf') ? 'active' : ''}`}
>
  🏟️ Turf Booking
</button>

<button
  onClick={() => onViewChange('my-turf-bookings')}
  className={`nav-button ${
    activeView === 'my-turf-bookings' ? 'active' : ''
  }`}
>
  🏟️ My Turf Bookings
</button>


        {/* Admin Panel */}
        {isAdmin && (
          <button
            onClick={() => onViewChange('admin')}
            className={`nav-button ${activeView === 'admin' || activeView === 'scan' ? 'active' : ''}`}
          >
            ⚙️ Admin Panel
          </button>
        )}
      </div>
    </nav>
  );
};