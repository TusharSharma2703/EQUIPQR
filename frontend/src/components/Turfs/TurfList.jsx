import React, { useState, useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';
import { apiService } from '../../services/api';
import toast from 'react-hot-toast';

export const TurfList = ({ type, onBack, onSelectTurf }) => {
  const [turfs, setTurfs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTurfs();
  }, [type]);

  const fetchTurfs = async () => {
    try {
      setLoading(true);
      const data = await apiService.getTurfsByType(type);
      setTurfs(data);
    } catch (err) {
      toast.error('Error loading turfs');
    } finally {
      setLoading(false);
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
    return <div className="loading">Loading turfs...</div>;
  }

  return (
    <div className="turf-list-container">
      <div className="turf-list-header">
        <button onClick={onBack} className="btn-back-turf">
          <ArrowLeft size={20} />
          Back
        </button>
        <div>
          <h2>{typeEmojis[type]} {type.charAt(0).toUpperCase() + type.slice(1)} Courts</h2>
          <p>{turfs.length} courts available</p>
        </div>
      </div>

      <div className="turfs-grid">
        {turfs.map((turf) => (
          <div key={turf._id} className="turf-card">
            <div className="turf-card-header">
              <span className="turf-icon">{typeEmojis[type]}</span>
              <h3>{turf.name}</h3>
            </div>
            <div className="turf-card-body">
              <div className="turf-stat">
                <span>Current Bookings:</span>
                <span className="stat-value">{turf.bookings.length}</span>
              </div>
              <div className="turf-stat">
                <span>Status:</span>
                <span className="stat-value available">Available</span>
              </div>
            </div>
            <button
              onClick={() => onSelectTurf(turf)}
              className="btn-book-turf"
            >
              Book Slot
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};