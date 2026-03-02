import React from 'react';
import ReactDOM from 'react-dom';

function Modal({ isOpen, title, children, footer, onClose }) {
  if (!isOpen) return null;

  const modalContent = (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(80, 60, 40, 0.45)', backdropFilter: 'blur(8px)' }}
    >
      <div
        className="w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden rounded-2xl shadow-2xl"
        style={{
          background: 'var(--bg-page)',
          border: '1px solid var(--border-strong)',
          boxShadow: '0 0 40px rgba(58, 175, 169, 0.12), 0 20px 60px rgba(80, 60, 40, 0.3)',
        }}
      >
        {/* Header — teal accent bar with warm text */}
        <div
          className="flex items-center justify-between px-6 py-4"
          style={{
            background: 'linear-gradient(135deg, #2B7A78, #3AAFA9)',
            borderBottom: '1px solid var(--border-strong)',
          }}
        >
          <h3 className="text-xl font-bold text-white m-0 tracking-wide">{title}</h3>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full transition-colors focus:outline-none"
            style={{
              background: 'rgba(255,255,255,0.15)',
              border: '1px solid rgba(255,255,255,0.3)',
              color: 'white',
            }}
            aria-label="Close"
          >
            <span className="text-xl font-medium leading-none mb-0.5">&times;</span>
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto custom-scrollbar flex-1" style={{ background: 'var(--bg-page)' }}>
          {children}
        </div>

        {/* Footer — warm elevated surface */}
        {footer && (
          <div
            className="px-6 py-4 flex items-center justify-end gap-3 rounded-b-2xl"
            style={{
              background: 'var(--bg-elevated)',
              borderTop: '1px solid var(--border)',
            }}
          >
            {footer}
          </div>
        )}
      </div>
    </div>
  );

  return ReactDOM.createPortal(modalContent, document.body);
}

export default Modal;