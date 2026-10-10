import React from 'react';

const turfTypes = [
  { name: 'badminton', displayName: 'Badminton', icon: '🏸', count: 10, color: '#667eea' },
  { name: 'tennis', displayName: 'Tennis', icon: '🎾', count: 6, color: '#764ba2' },
  { name: 'cricket', displayName: 'Cricket', icon: '🏏', count: 3, color: '#f093fb' },
  { name: 'football', displayName: 'Football', icon: '⚽', count: 2, color: '#4facfe' },
  { name: 'volleyball', displayName: 'Volleyball', icon: '🏐', count: 4, color: '#43e97b' }
];

export const TurfTypes = ({ onSelectType }) => {
  return (
    <div className="turf-types-container">
      <div className="turf-types-header">
        <h1>🏟️ Book Sports Courts</h1>
        <p>Select a sport to view available courts and book your slot</p>
      </div>

      <div className="turf-types-grid">
        {turfTypes.map((type) => (
          <div
            key={type.name}
            className="turf-type-card"
            onClick={() => onSelectType(type.name)}
            style={{ '--card-color': type.color }}
          >
            <div className="turf-type-icon">{type.icon}</div>
            <h3>{type.displayName}</h3>
            <p className="turf-count">{type.count} Courts Available</p>
            <button className="btn-view-courts">View Courts →</button>
          </div>
        ))}
      </div>
    </div>
  );
};