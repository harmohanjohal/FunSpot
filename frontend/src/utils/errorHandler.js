export const parseApiError = (error) => {
    if (typeof error === 'string') {
      return error;
    }
    
    if (error.message) {
      return error.message;
    }
    
    if (error.error) {
      return error.error;
    }
    
    return 'An unknown error occurred';
  };
  
  // Format validation errors for display
  export const formatValidationErrors = (errors) => {
    if (typeof errors === 'string') {
      return errors;
    }
    
    if (Array.isArray(errors)) {
      return errors.join(', ');
    }
    
    if (typeof errors === 'object') {
      return Object.values(errors).join(', ');
    }
    
    return 'Validation failed';
  };
  
  // Common form validation functions
  export const validators = {
    // Check if value is empty
    required: (value) => {
      if (value === null || value === undefined || value === '') {
        return 'This field is required';
      }
      return null;
    },
    
    // Check if value is a number
    isNumber: (value) => {
      if (isNaN(Number(value))) {
        return 'Please enter a valid number';
      }
      return null;
    },
    
    // Check minimum value
    minValue: (min) => (value) => {
      if (Number(value) < min) {
        return `Value must be at least ${min}`;
      }
      return null;
    },
    
    // Check maximum value
    maxValue: (max) => (value) => {
      if (Number(value) > max) {
        return `Value must be at most ${max}`;
      }
      return null;
    },
    
    // Check minimum length
    minLength: (min) => (value) => {
      if (value && value.length < min) {
        return `Must be at least ${min} characters`;
      }
      return null;
    },
    
    // Check maximum length
    maxLength: (max) => (value) => {
      if (value && value.length > max) {
        return `Cannot exceed ${max} characters`;
      }
      return null;
    },
    
    // Check if email format is valid
    email: (value) => {
      const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (value && !re.test(value)) {
        return 'Please enter a valid email address';
      }
      return null;
    },
    
    // Check date format
    date: (value) => {
      if (value && isNaN(Date.parse(value))) {
        return 'Please enter a valid date';
      }
      return null;
    },
    
    // Run multiple validations
    compose: (...validators) => (value) => {
      for (const validator of validators) {
        const error = validator(value);
        if (error) {
          return error;
        }
      }
      return null;
    }
  };
  
  // Validate a form based on a validation schema
  export const validateForm = (values, validationSchema) => {
    const errors = {};
    
    Object.entries(validationSchema).forEach(([field, validator]) => {
      const error = validator(values[field]);
      if (error) {
        errors[field] = error;
      }
    });
    
    return {
      errors,
      isValid: Object.keys(errors).length === 0
    };
  };
  
  // Format API errors for display
  export const handleApiError = (error, defaultMessage = 'An error occurred') => {
    console.error('API Error:', error);
    
    if (error.response) {
      // Server responded with an error
      if (error.response.data) {
        if (error.response.data.error) {
          return error.response.data.error;
        }
        if (error.response.data.message) {
          return error.response.data.message;
        }
      }
      return `Error ${error.response.status}: ${error.response.statusText}`;
    }
    
    if (error.message) {
      return error.message;
    }
    
    return defaultMessage;
  };
  
  export default {
    parseApiError,
    formatValidationErrors,
    validators,
    validateForm,
    handleApiError
  };