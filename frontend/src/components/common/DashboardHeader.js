import React from 'react';
import { Link } from 'react-router-dom';

function DashboardHeader({ title, links, onLogout }) {
  return (
    <div className="dashboard-header">
      <h2>{title}</h2>
      <div className="nav-links">
        {links && links.map((link, index) => (
          <Link key={index} to={link.to}>{link.label}</Link>
        ))}
        {onLogout && (
          <button onClick={onLogout} className="btn btn-secondary">Logout</button>
        )}
      </div>
    </div>
  );
}

export default DashboardHeader;