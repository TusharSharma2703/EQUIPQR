import React, { useState, useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import { useAuth } from './hooks/useAuth';
import { Login } from './components/Auth/Login';
import { Register } from './components/Auth/Register';
import { Header } from './components/Layout/Header';
import { Navigation } from './components/Layout/Navigation';
import { SportsHome } from './components/Items/SportsHome';
import { SportItemsList } from './components/Items/SportItemsList';
import { Cart } from './components/Cart/Cart';
import { BookingsList } from './components/Bookings/BookingsList';
import { AdminPanel } from './components/Admin/AdminPanel';
import { QRScanner } from './components/Admin/QRScanner';
// ✨ NEW IMPORTS
import { TurfTypes } from './components/Turfs/TurfTypes';
import { TurfList } from './components/Turfs/TurfList';
import { TurfBookingForm } from './components/Turfs/TurfBookingForm';
import { MyTurfBookings } from './components/Turfs/MyTurfBookings';
import './App.css';

function App() {
  const { user, token, loading, login, register, logout } = useAuth();
  const [view, setView] = useState('login');
  const [cart, setCart] = useState([]);
  const [selectedSport, setSelectedSport] = useState(null);
  
  // ✨ NEW STATE FOR TURFS
  const [selectedTurfType, setSelectedTurfType] = useState(null);
  const [selectedTurf, setSelectedTurf] = useState(null);

  useEffect(() => {
    if (token && user && (view === 'login' || view === 'register')) {
      setView('sports-home');
    }
  }, [token, user]);

  // Handle sport selection
  const handleSelectSport = (sport) => {
    setSelectedSport(sport);
    setView('sport-items');
  };

  // Handle back from sport items
  const handleBackFromSportItems = () => {
    setSelectedSport(null);
    setView('sports-home');
    setCart([]);
  };

  // ✨ NEW: Handle turf type selection
  const handleSelectTurfType = (type) => {
    setSelectedTurfType(type);
    setView('turf-list');
  };

  // ✨ NEW: Handle turf selection
  const handleSelectTurf = (turf) => {
    setSelectedTurf(turf);
    setView('turf-booking-form');
  };

  // ✨ NEW: Handle back from turf views
  const handleBackToTurfTypes = () => {
    setSelectedTurfType(null);
    setSelectedTurf(null);
    setView('turf-types');
  };

  const handleBackToTurfList = () => {
    setSelectedTurf(null);
    setView('turf-list');
  };

  // Add/Remove from cart with sport lock.
  // Functional updates (prev => ...) always use the latest cart, so quick
  // successive clicks can't overwrite each other.
  const addToCart = (item, action = 'add') => {
    if (action === 'remove') {
      setCart(prev => prev.filter(c => c.item._id !== item._id));
      return;
    }

    if (cart.length > 0 && cart[0].item.sport !== item.sport) {
      alert(`You already have items from ${cart[0].item.sport}. You can only book from one sport at a time.`);
      return;
    }

    if (cart.some(c => c.item._id === item._id)) {
      alert('This item is already in your cart.');
      return;
    }

    setCart(prev =>
      prev.some(c => c.item._id === item._id) || (prev.length > 0 && prev[0].item.sport !== item.sport)
        ? prev
        : [...prev, { item, quantity: 1 }]
    );
  };

  const removeFromCart = (itemId) => {
    setCart(prev => prev.filter(c => c.item._id !== itemId));
  };

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '100vh' 
      }}>
        Loading...
      </div>
    );
  }

  if (!token) {
    return (
      <>
        <Toaster position="top-center" />
        {view === 'login' ? (
          <Login
            onLogin={login}
            onSwitchToRegister={() => setView('register')}
          />
        ) : (
          <Register
            onRegister={register}
            onSwitchToLogin={() => setView('login')}
          />
        )}
      </>
    );
  }

  return (
    <div className="app-container">
      <Toaster position="top-center" />
      <Header user={user} onLogout={() => {
        logout();
        setView('login');
        setCart([]);
        setSelectedSport(null);
        setSelectedTurfType(null);
        setSelectedTurf(null);
      }} />
      <Navigation
        activeView={view}
        onViewChange={setView}
        isAdmin={user?.isAdmin}
      />

      <main className="main-content">
        {/* Equipment Booking Views */}
        {view === 'sports-home' && (
          <SportsHome onSelectSport={handleSelectSport} />
        )}

        {view === 'sport-items' && selectedSport && (
          <SportItemsList
            sport={selectedSport}
            cart={cart}
            onAddToCart={addToCart}
            onBack={handleBackFromSportItems}
            onViewCart={() => setView('cart')}
          />
        )}

        {view === 'cart' && (
          <Cart
            cart={cart}
            onRemove={removeFromCart}
            onBack={() => setView('sport-items')}
            token={token}
            onBookingCreated={() => {
              setCart([]);
              setView('bookings');
            }}
          />
        )}

        {view === 'bookings' && (
          <BookingsList userId={user._id} token={token} />
        )}

        {/* ✨ NEW: Turf Booking Views */}
        {view === 'turf-types' && (
          <TurfTypes onSelectType={handleSelectTurfType} />
        )}

        {view === 'turf-list' && selectedTurfType && (
          <TurfList
            type={selectedTurfType}
            onBack={handleBackToTurfTypes}
            onSelectTurf={handleSelectTurf}
          />
        )}

        {view === 'turf-booking-form' && selectedTurf && (
          <TurfBookingForm
            turf={selectedTurf}
            token={token}
            onBack={handleBackToTurfList}
            onSuccess={() => {
              setView('my-turf-bookings');
              setSelectedTurf(null);
              setSelectedTurfType(null);
            }}
          />
        )}

        {view === 'my-turf-bookings' && (
          <MyTurfBookings token={token} />
        )}

        {/* Admin Views */}
        {view === 'admin' && user?.isAdmin && (
          <AdminPanel
            token={token}
            onScanQR={() => setView('scan')}
          />
        )}

        {view === 'scan' && (
          <QRScanner
            token={token}
            onBack={() => setView('admin')}
          />
        )}
      </main>
    </div>
  );
}

export default App;