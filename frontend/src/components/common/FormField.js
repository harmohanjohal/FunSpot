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
  className = 'form-control'
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
          <div className="radio-group">
            {options.map(option => (
              <label key={option.value} className="radio-label">
                <input
                  type="radio"
                  name={id}
                  value={option.value}
                  checked={value === option.value}
                  onChange={onChange}
                  required={required}
                />
                <span>{option.label}</span>
              </label>
            ))}
          </div>
        );
        
      case 'checkbox':
        return (
          <div className="checkbox-field">
            <input
              type="checkbox"
              id={id}
              name={id}
              checked={value}
              onChange={onChange}
              required={required}
            />
            {label && <label htmlFor={id}>{label}</label>}
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
      <div className="form-group">
        {renderField()}
        {error && <div className="invalid-feedback">{error}</div>}
      </div>
    );
  }

  return (
    <div className="form-group">
      {label && <label htmlFor={id}>{label}</label>}
      {renderField()}
      {error && <div className="invalid-feedback">{error}</div>}
    </div>
  );
}

export default FormField;