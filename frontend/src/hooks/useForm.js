import { useState } from 'react';

// In useForm.js
export function useForm(initialValues = {}) {
  const [form, setFormState] = useState(initialValues);

  // Update a single field
  const updateForm = (field, value) => {
    setFormState(prevForm => ({
      ...prevForm,
      [field]: value
    }));
  };

  // Update multiple fields at once
  const updateFormBatch = (updates) => {
    setFormState(prevForm => ({
      ...prevForm,
      ...updates
    }));
  };

  // Set entire form
  const setForm = (newFormData) => {
    setFormState(newFormData);
  };

  // Reset to initial or provided values
  const resetForm = (values = initialValues) => {
    setFormState(values);
  };

  return {
    form,
    updateForm,
    updateFormBatch,
    setForm,
    resetForm
  };
}

// For backwards compatibility, also provide a default export
export default useForm;