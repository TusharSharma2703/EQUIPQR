import React from 'react';

export const EmptyState = ({ icon: Icon, message }) => {
  return (
    <div className="empty-state">
      <Icon className="empty-icon" size={80} />
      <p className="empty-text">{message}</p>
    </div>
  );
};