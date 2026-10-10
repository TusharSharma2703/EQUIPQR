import React, { useState } from 'react';
import { Package, User, LogOut, Menu, X } from 'lucide-react';

export const Header = ({ user, onLogout }) => {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="header">
      <div className="header-content">
        {/* Brand (Left) */}
        <div className="header-brand">
          <div className="brand-icon">
            <Package size={28} />
          </div>
          <h1 className="brand-title">EquipQR</h1>
        </div>

        {/* Desktop Header Actions (Right) */}
        <div className="header-actions desktop-only">
          <div className="user-info">
            <User size={20} />
            <span>{user?.name}</span>
            {user?.isAdmin && <span className="admin-badge">Admin</span>}
          </div>

          <button onClick={onLogout} className="btn-logout">
            <LogOut size={18} />
            Logout
          </button>
        </div>

        {/* Burger Icon (Right on Mobile) */}
        <button
          className="menu-toggle mobile-only"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? <X size={26} /> : <Menu size={26} />}
        </button>
      </div>

      {/* Mobile Dropdown Menu */}
      {menuOpen && (
        <div className="mobile-menu">
          <div className="mobile-user-info">
            <User size={20} />
            <span className="user-name">{user?.name}</span>
            {user?.isAdmin && <span className="admin-badge">Admin</span>}
          </div>

          <button
            onClick={() => {
              onLogout();
              setMenuOpen(false);
            }}
            className="btn-mobile-logout"
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>
      )}
    </header>
  );
};
