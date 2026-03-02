import React from 'react';
import ReactDOM from 'react-dom';

function Modal({ isOpen, title, children, footer, onClose }) {
  if (!isOpen) return null;

  const modalContent = (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0, 0, 0, 0.6)', backdropFilter: 'blur(6px)' }}>
      <div className="w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden rounded-2xl border border-slate-700/50 shadow-2xl" style={{ background: 'var(--bg-card-solid)', boxShadow: '0 0 30px rgba(16, 185, 129, 0.1), 0 8px 30px rgba(0,0,0,0.5)' }}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700/50" style={{ background: 'rgba(15, 23, 42, 0.5)' }}>
          <h3 className="text-xl font-bold text-slate-100 m-0">{title}</h3>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full border border-slate-600 text-slate-400 hover:text-slate-200 hover:border-emerald-400 transition-colors focus:outline-none"
            style={{ background: 'var(--bg-elevated)' }}
            aria-label="Close"
          >
            <span className="text-xl font-medium leading-none mb-0.5">&times;</span>
          </button>
        </div>

        <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
          {children}
        </div>

        {footer && (
          <div className="px-6 py-4 border-t border-slate-700/50 flex items-center justify-end gap-3 rounded-b-2xl" style={{ background: 'rgba(15, 23, 42, 0.5)' }}>
            {footer}
          </div>
        )}
      </div>
    </div>
  );

  return ReactDOM.createPortal(modalContent, document.body);
}

export default Modal;