import toast from "react-hot-toast";


export const apiService = {
  // ==================== SPORTS ====================
  // ==================== TURFS ====================

// Get all turfs
getTurfs: async () => {
  try {
    const res = await fetch(`${process.env.REACT_APP_BACKENDURL}/api/turfs`);
    if (!res.ok) throw new Error('Failed to fetch turfs');
    return res.json();
  } catch (err) {
    console.error('Error fetching turfs:', err);
    throw err;
  }
},

// Get turfs by type
getTurfsByType: async (type) => {
  try {
    const res = await fetch(`${process.env.REACT_APP_BACKENDURL}/api/turfs/type/${type}`);
    if (!res.ok) throw new Error(`Failed to fetch ${type} turfs`);
    return res.json();
  } catch (err) {
    console.error(`Error fetching ${type} turfs:`, err);
    throw err;
  }
},

// Get single turf
getTurf: async (turfId) => {
  try {
    const res = await fetch(`${process.env.REACT_APP_BACKENDURL}/api/turfs/${turfId}`);
    if (!res.ok) throw new Error('Failed to fetch turf');
    return res.json();
  } catch (err) {
    console.error('Error fetching turf:', err);
    throw err;
  }
},

// Check availability
checkTurfAvailability: async (turfId, date, startTime, endTime, token) => {
  try {
    const res = await fetch(
      `${process.env.REACT_APP_BACKENDURL}/api/turfs/${turfId}/availability`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ date, startTime, endTime })
      }
    );
    if (!res.ok) throw new Error('Failed to check availability');
    return res.json();
  } catch (err) {
    console.error('Error checking availability:', err);
    throw err;
  }
},

// Book turf
bookTurf: async (turfId, date, startTime, endTime, token) => {
  try {
    const res = await fetch(
      `${process.env.REACT_APP_BACKENDURL}/api/turfs/${turfId}/book`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ date, startTime, endTime })
      }
    );
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.message || 'Failed to book turf');
    }
    return res.json();
  } catch (err) {
    console.error('Error booking turf:', err);
    throw err;
  }
},

// Get user bookings
getUserTurfBookings: async (token) => {
  try {
    const res = await fetch(
      `${process.env.REACT_APP_BACKENDURL}/api/turfs/user/bookings`,
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );
    if (!res.ok) throw new Error('Failed to fetch bookings');
    return res.json();
  } catch (err) {
    console.error('Error fetching bookings:', err);
    throw err;
  }
},

// Cancel booking
cancelTurfBooking: async (turfId, date, startTime, endTime, token) => {
  try {
    const res = await fetch(
      `${process.env.REACT_APP_BACKENDURL}/api/turfs/${turfId}/cancel`,
      {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ date, startTime, endTime })
      }
    );
    if (!res.ok) throw new Error('Failed to cancel booking');
    return res.json();
  } catch (err) {
    console.error('Error cancelling booking:', err);
    throw err;
  }
},
  // Get all sports with stats
  getSports: async () => {
    try {
      const res = await fetch(`${process.env.REACT_APP_BACKENDURL}/api/items/sports/all`);
      if (!res.ok) throw new Error('Failed to fetch sports');
      return res.json();
    } catch (err) {
      console.error('Error fetching sports:', err);
      throw err;
    }
  },

  // Get items for specific sport
  getItemsBySport: async (sport) => {
    try {
      const res = await fetch(`${process.env.REACT_APP_BACKENDURL}/api/items/sport/${sport}`);
      if (!res.ok) throw new Error(`Failed to fetch items for ${sport}`);
      return res.json();
    } catch (err) {
      console.error(`Error fetching ${sport} items:`, err);
      throw err;
    }
  },

  // ==================== ITEMS (OLD - can keep for admin) ====================

  // Get all items
  getItems: async () => {
    try {
      const res = await fetch(`${process.env.REACT_APP_BACKENDURL}/api/items`);
      if (!res.ok) throw new Error('Failed to fetch items');
      return res.json();
    } catch (err) {
      console.error('Error fetching items:', err);
      throw err;
    }
  },

  // ==================== BOOKINGS ====================

  // Get all bookings
  getBookings: async (token) => {
    try {
      const res = await fetch(`${process.env.REACT_APP_BACKENDURL}/api/bookings`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to fetch bookings');
      return res.json();
    } catch (err) {
      console.error('Error fetching bookings:', err);
      throw err;
    }
  },

  // Get the logged-in student's own bookings
  getMyBookings: async (token) => {
    try {
      const res = await fetch(`${process.env.REACT_APP_BACKENDURL}/api/bookings/my`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to fetch your bookings');
      return res.json();
    } catch (err) {
      console.error('Error fetching your bookings:', err);
      throw err;
    }
  },

  // Get booking by ID
  getBookingById: async (bookingId, token) => {
    try {
      const res = await fetch(`${process.env.REACT_APP_BACKENDURL}/api/bookings/${bookingId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Booking not found');
      return res.json();
    } catch (err) {
      console.error('Error fetching booking:', err);
      throw err;
    }
  },

  // Create booking
  createBooking: async (items, token) => {
    try {
      const res = await fetch(`${process.env.REACT_APP_BACKENDURL}/api/bookings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ items })
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'Failed to create booking');
      }
      return res.json();
    } catch (err) {
      console.error('Error creating booking:', err);
      throw err;
    }
  },

  // Update booking status
  updateBookingStatus: async (bookingId, status, token) => {
    try {
      const res = await fetch(`${process.env.REACT_APP_BACKENDURL}/api/bookings/${bookingId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status })
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'Failed to update booking');
      }
      return res.json();
    } catch (err) {
      console.error('Error updating booking status:', err);
      throw err;
    }
  },

  // ==================== AUTHENTICATION ====================

  // Login
  login: async (email, password) => {
    try {
      const res = await fetch(`${process.env.REACT_APP_BACKENDURL}/api/users/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'Login failed');
      }
      return res.json();
    } catch (err) {
      console.error('Login error:', err);
      return err;
    }
  },

  // Register
  register: async (name, email, password) => {
    try {
      const res = await fetch(`${process.env.REACT_APP_BACKENDURL}/api/users/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password })
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'Registration failed');
      }
      return res.json();
    } catch (err) {
      console.error('Registration error:', err);
      return err;
    }
  },

  // Get user profile
  getUserProfile: async (token) => {
    try {
      const res = await fetch(`${process.env.REACT_APP_BACKENDURL}/api/users/profile`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to fetch profile');
      return res.json();
    } catch (err) {
      console.error('Error fetching profile:', err);
      throw err;
    }
  }
};

