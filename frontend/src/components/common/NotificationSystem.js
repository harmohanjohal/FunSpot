import React, { useState, useEffect } from 'react';
import '../common/AlertStyles.css';

const NotificationSystem = ({ message, type = 'success', duration = 5000, onClose }) => {
  const [visible, setVisible] = useState(!!message);
  
  useEffect(() => {
    if (message) {
      setVisible(true);
      
      // Auto-hide after duration
      const timer = setTimeout(() => {
        setVisible(false);
        if (onClose) {
          onClose();
        }
      }, duration);
      
      return () => clearTimeout(timer);
    }
  }, [message, duration, onClose]);
  
  if (!visible || !message) {
    return null;
  }
  
  // Handle close
  const handleClose = () => {
    setVisible(false);
    if (onClose) {
      onClose();
    }
  };
  
  return (
    <div className={`alert alert-${type}`} style={{ 
      position: 'fixed',
      top: '20px',
      right: '20px',
      zIndex: 1000,
      minWidth: '300px',
      maxWidth: '400px',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    }}>
      <div>{message}</div>
      <button 
        onClick={handleClose}
        className="alert-close"
        aria-label="Close notification"
      >
        &times;
      </button>
    </div>
  );
};

export default NotificationSystem;