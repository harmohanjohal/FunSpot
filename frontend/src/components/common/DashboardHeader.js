import React from 'react';
import { Link } from 'react-router-dom';

function DashboardHeader({ title, links, onLogout }) {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-center bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-8 mt-4 gap-4">
      <h2 className="text-2xl font-bold text-gray-800 m-0">{title}</h2>
      <div className="flex flex-wrap gap-3 items-center">
        {links && links.map((link, index) => (
          <Link
            key={index}
            to={link.to}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg transition-colors"
          >
            {link.label}
          </Link>
        ))}
        {onLogout && (
          <button
            onClick={onLogout}
            className="px-4 py-2 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 border border-red-100 rounded-lg transition-colors ml-2"
          >
            Logout
          </button>
        )}
      </div>
    </div>
  );
}

export default DashboardHeader;