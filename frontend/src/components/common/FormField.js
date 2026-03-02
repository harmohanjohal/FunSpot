import React from 'react';

function FormField({
  id,
  label,
  type = 'text',
  value,
  onChange,
  required = false,
  options = [],
  error = '',
  placeholder = '',
  className = 'w-full px-4 py-2.5 border text-sm rounded-lg block focus:outline-none focus:ring-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors'
}) {
  // Override className style for dark theme
  const darkClassName = className.includes('bg-gray-50')
    ? className.replace('bg-gray-50', '').replace('border-gray-300', 'border-slate-600').replace('text-gray-900', 'text-slate-100').replace('focus:ring-blue-500', 'focus:ring-emerald-500').replace('focus:border-blue-500', 'focus:border-emerald-500').replace('disabled:bg-gray-100', 'disabled:opacity-50').replace('disabled:text-gray-500', 'disabled:cursor-not-allowed')
    : className;

  const inputStyle = {
    background: 'var(--bg-input)',
    color: 'var(--text-main)',
    border: '1px solid var(--border-strong)'
  };

  const renderField = () => {
    switch (type) {
      case 'select':
        return (
          <select
            id={id}
            name={id}
            className={darkClassName}
            style={inputStyle}
            value={value}
            onChange={onChange}
            required={required}
          >
            {options.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        );

      case 'textarea':
        return (
          <textarea
            id={id}
            name={id}
            className={darkClassName}
            style={inputStyle}
            value={value}
            onChange={onChange}
            required={required}
            placeholder={placeholder}
          />
        );

      case 'radio':
        return (
          <div className="flex flex-wrap gap-4 mt-2">
            {options.map(option => (
              <label key={option.value} className="flex items-center gap-2 cursor-pointer group">
                <input
                  type="radio"
                  name={id}
                  value={option.value}
                  checked={value === option.value}
                  onChange={onChange}
                  required={required}
                  className="w-4 h-4 text-emerald-500 border-slate-600 focus:ring-emerald-500 focus:ring-2 cursor-pointer"
                  style={{ accentColor: '#3AAFA9' }}
                />
                <span className="text-sm font-medium" style={{ color: 'var(--text-muted)' }}>{option.label}</span>
              </label>
            ))}
          </div>
        );

      case 'checkbox':
        return (
          <div className="flex items-center gap-2 cursor-pointer group py-1">
            <input
              type="checkbox"
              id={id}
              name={id}
              checked={value}
              onChange={onChange}
              required={required}
              className="w-4 h-4 text-emerald-500 border-slate-600 rounded focus:ring-emerald-500 focus:ring-2 cursor-pointer"
              style={{ accentColor: '#3AAFA9' }}
            />
            {label && <label htmlFor={id} className="text-sm font-medium cursor-pointer m-0" style={{ color: 'var(--text-muted)' }}>{label}</label>}
          </div>
        );

      default:
        return (
          <input
            type={type}
            id={id}
            name={id}
            className={darkClassName}
            style={inputStyle}
            value={value}
            onChange={onChange}
            required={required}
            placeholder={placeholder}
          />
        );
    }
  };

  // For checkbox, render the label inside renderField
  if (type === 'checkbox') {
    return (
      <div className="mb-4">
        {renderField()}
        {error && <div className="mt-1 text-sm text-red-400 font-medium">{error}</div>}
      </div>
    );
  }

  return (
    <div className="mb-4">
      {label && <label htmlFor={id} className="block mb-1.5 text-sm font-semibold" style={{ color: 'var(--text-muted)' }}>{label}</label>}
      {renderField()}
      {error && <div className="mt-1 text-sm text-red-400 font-medium">{error}</div>}
    </div>
  );
}

export default FormField;