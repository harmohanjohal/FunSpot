import React from 'react';

function DataCard({ title, children, footerAction }) {
  return (
    <div className="dashboard-card">
      <h3 className="dashboard-title">{title}</h3>
      {children}
      {footerAction && (
        <div style={{ marginTop: '10px' }}>
          {footerAction}
        </div>
      )}
    </div>
  );
}

export default DataCard;