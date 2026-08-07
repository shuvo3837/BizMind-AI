export const validateBusinessInput = (data) => {
  const errors = {};
  if (!data.companyName || !data.companyName.trim()) errors.companyName = 'Company name is required';
  if (!data.industry || !data.industry.trim()) errors.industry = 'Industry classification is required';

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};
