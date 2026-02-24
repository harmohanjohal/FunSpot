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
  className = 'w-full px-4 py-2.5 bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block focus:outline-none focus:ring-2 disabled:bg-gray-100 disabled:text-gray-500 transition-colors'
}) {
  const renderField = () => {
    switch (type) {
      case 'select':
        return (
          <select
            id={id}
            name={id}
            className={className}
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
            className={className}
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
                  className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 focus:ring-2 cursor-pointer"
                />
                <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900">{option.label}</span>
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
              className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2 cursor-pointer"
            />
            {label && <label htmlFor={id} className="text-sm font-medium text-gray-700 group-hover:text-gray-900 cursor-pointer m-0">{label}</label>}
          </div>
        );

      default:
        return (
          <input
            type={type}
            id={id}
            name={id}
            className={className}
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
        {error && <div className="mt-1 text-sm text-red-600 font-medium">{error}</div>}
      </div>
    );
  }

  return (
    <div className="mb-4">
      {label && <label htmlFor={id} className="block mb-1.5 text-sm font-medium text-gray-700">{label}</label>}
      {renderField()}
      {error && <div className="mt-1 text-sm text-red-600 font-medium">{error}</div>}
    </div>
  );
}

export default FormField;