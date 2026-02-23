import React, { createContext, useContext, useState } from 'react';
import NotificationSystem from '../components/common/NotificationSystem';

// Create context
const NotificationContext = createContext();

// Custom hook to use the notification context
export const useNotification = () => {
  return useContext(NotificationContext);
};

// Provider component
export const NotificationProvider = ({ children }) => {
  const [notification, setNotification] = useState({
    message: '',
    type: 'success',
    visible: false
  });
  
  // Show success notification
  const showSuccess = (message, duration = 5000) => {
    setNotification({
      message,
      type: 'success',
      visible: true,
      duration
    });
  };
  
  // Show error notification
  const showError = (message, duration = 5000) => {
    setNotification({
      message,
      type: 'danger',
      visible: true,
      duration
    });
  };
  
  // Show warning notification
  const showWarning = (message, duration = 5000) => {
    setNotification({
      message,
      type: 'warning',
      visible: true,
      duration
    });
  };
  
  // Show info notification
  const showInfo = (message, duration = 5000) => {
    setNotification({
      message,
      type: 'info',
      visible: true,
      duration
    });
  };
  
  // Hide notification
  const hideNotification = () => {
    setNotification(prev => ({
      ...prev,
      visible: false
    }));
  };
  
  // Clear notification (completely remove message)
  const clearNotification = () => {
    setNotification({
      message: '',
      type: 'success',
      visible: false
    });
  };
  
  // Value to be provided to consumers
  const value = {
    showSuccess,
    showError,
    showWarning,
    showInfo,
    hideNotification,
    clearNotification
  };
  
  return (
    <NotificationContext.Provider value={value}>
      {children}
      {notification.visible && (
        <NotificationSystem
          message={notification.message}
          type={notification.type}
          duration={notification.duration}
          onClose={clearNotification}
        />
      )}
    </NotificationContext.Provider>
  );
};

export default NotificationContext;