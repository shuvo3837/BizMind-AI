export const validateRegisterInput = (data) => {
  const errors = {};
  if (!data.name || !data.name.trim()) errors.name = 'Name is required';
  if (!data.email || !data.email.trim()) errors.email = 'Email is required';
  if (!data.password || data.password.length < 6) errors.password = 'Password must be at least 6 characters';
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

export const validateLoginInput = (data) => {
  const errors = {};
  if (!data.email || !data.email.trim()) errors.email = 'Email is required';
  if (!data.password) errors.password = 'Password is required';

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};
