import React from 'react';
import { Link } from 'react-router-dom';

function DashboardHeader({ title, links, onLogout }) {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white p-6 rounded-xl shadow-sm mb-8 mt-4 gap-4" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)', boxShadow: 'var(--shadow-md)', borderWidth: '1px' }}>
      <h2 className="m-0" style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--text-main)' }}>{title}</h2>
      <div className="flex flex-wrap gap-3 items-center">
        {links && links.map((link, index) => (
          <Link
            key={index}
            to={link.to}
            className="btn-secondary-action py-2"
          >
            {link.label}
          </Link>
        ))}
        {onLogout && (
          <button
            onClick={onLogout}
            className="btn-secondary-action py-2" style={{ color: '#dc2626', borderColor: '#fca5a5', backgroundColor: '#fef2f2', marginLeft: '0.5rem' }}
          >
            Logout
          </button>
        )}
      </div>
    </div>
  );
}

export default DashboardHeader;