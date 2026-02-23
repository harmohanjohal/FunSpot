import React from 'react';

function Modal({ isOpen, title, children, footer, onClose }) {
  if (!isOpen) return null;
  
  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-header">
          <h3>{title}</h3>
          {/* Close button (X) in the corner */}
          <button 
            onClick={onClose} 
            className="modal-close-btn"
            aria-label="Close"
          >
            ×
          </button>
        </div>
        
        <div className="modal-content">
          {children}
        </div>
        
        {footer && (
          <div className="modal-footer">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

export default Modal;