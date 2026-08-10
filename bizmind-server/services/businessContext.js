export const getCurrentBusinessId = (req) => {
  const envBusinessId = process.env.DEV_BUSINESS_ID || 'dev-business-001';
  return req?.user?.businessId || envBusinessId;
};

export const getCurrentUserId = (req) => {
  const envUserId = process.env.DEV_USER_ID || 'dev-user-001';
  return req?.user?.id || req?.user?._id || envUserId;
};
