import React from 'react';

function Modal({ isOpen, title, children, footer, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50/50">
          <h3 className="text-xl font-bold text-gray-900 m-0">{title}</h3>
          {/* Close button (X) in the corner */}
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-white hover:bg-gray-100 text-gray-400 hover:text-gray-700 border border-gray-200 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label="Close"
          >
            <span className="text-xl font-medium leading-none mb-0.5">&times;</span>
          </button>
        </div>

        <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
          {children}
        </div>

        {footer && (
          <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex items-center justify-end gap-3 rounded-b-2xl">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

export default Modal;