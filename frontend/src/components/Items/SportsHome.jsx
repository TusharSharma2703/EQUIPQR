import React, { useState, useEffect } from 'react';
import { LoadingSpinner } from '../Common/LoadingSpinner';
import toast from 'react-hot-toast';

export const SportsHome = ({ onSelectSport }) => {
  const [sports, setSports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSports();
  }, []);

  const fetchSports = async () => {
    try {
      const res = await fetch(`${process.env.REACT_APP_BACKENDURL}/api/items/sports/all`);
      const data = await res.json();
      setSports(data);
    } catch (err) {
      console.error(err);
      toast.error('Error loading sports');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="sports-home">
      <div className="sports-header">
        <h1>Select a Sport</h1>
        <p>Choose a sport to browse available equipment</p>
      </div>

      <div className="sports-grid">
        {sports.map((sport) => (
          <div
            key={sport.name}
            className="sport-card"
            onClick={() => onSelectSport(sport.name)}
          >
            <div className="sport-icon-large">{sport.icon}</div>
            <h3>{sport.displayName}</h3>
            <div className="sport-stats">
              <div className="stat">
                <span className="stat-label">Items</span>
                <span className="stat-value">{sport.totalItems}</span>
              </div>
              <div className="stat">
                <span className="stat-label">Available</span>
                <span className="stat-value available">{sport.availableCount}</span>
              </div>
            </div>
            <button className="btn-browse-sport">
              Browse →
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};