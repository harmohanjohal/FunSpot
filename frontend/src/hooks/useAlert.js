import { useState } from 'react';

function useAlert(timeout = 5000) {
  const [alert, setAlert] = useState({
    show: false,
    message: '',
    type: 'success', // 'success', 'danger', 'warning', 'info'
  });

  let alertTimer = null;

  const showAlert = (message, type, duration = timeout) => {
    // Clear any existing timer
    if (alertTimer) {
      clearTimeout(alertTimer);
    }
    
    // Show the new alert
    setAlert({
      show: true,
      message,
      type
    });
    
    // Auto-hide alert after duration
    if (duration > 0) {
      alertTimer = setTimeout(() => {
        clearAlert();
      }, duration);
    }
  };
  
  const showSuccess = (message, duration) => showAlert(message, 'success', duration);
  const showError = (message, duration) => showAlert(message, 'danger', duration);
  const showWarning = (message, duration) => showAlert(message, 'warning', duration);
  const showInfo = (message, duration) => showAlert(message, 'info', duration);
  
  const clearAlert = () => {
    setAlert({
      show: false,
      message: '',
      type: 'success'
    });
    
    if (alertTimer) {
      clearTimeout(alertTimer);
      alertTimer = null;
    }
  };
  
  return {
    alert,
    showAlert,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    clearAlert
  };
}

export default useAlert;