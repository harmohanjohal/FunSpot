import React from 'react';
import './LoadingSpinner.css';

function LoadingSpinner({ fullscreen = false, message = 'Loading...' }) {
  const SpinnerContent = () => (
    <div className="spinner-container">
      <div className="spinner"></div>
      {message && <div style={{ marginLeft: '10px' }}>{message}</div>}
    </div>
  );

  if (fullscreen) {
    return (
      <div className="spinner-overlay">
        <SpinnerContent />
      </div>
    );
  }

  return <SpinnerContent />;
}

export default LoadingSpinner;