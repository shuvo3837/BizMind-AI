export const validateBusinessInput = (data) => {
  const errors = {};
  if (!data.businessName && !data.companyName) {
    errors.businessName = 'Business name is required';
  }
  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};
