import { sendSuccess, sendError } from '../utils/apiResponse.js';

export const getBusinessProfile = async (req, res) => {
  const profile = {
    id: 'biz_65f1a2b3c4d5e6f7a8b9c0d2',
    companyName: 'Apex Growth Dynamics',
    industry: 'SaaS & Digital E-Commerce',
    currency: 'USD',
    monthlyTarget: 150000,
    employeesCount: 24,
    website: 'https://apexgrowth.io',
    description: 'High-growth direct-to-consumer brand offering premium fitness products & automated SaaS subscriptions.',
    createdAt: '2025-01-15T08:00:00.000Z'
  };
  return sendSuccess(res, 'Business profile retrieved', profile);
};

export const updateBusinessProfile = async (req, res) => {
  const updatedData = {
    id: 'biz_65f1a2b3c4d5e6f7a8b9c0d2',
    ...req.body,
    updatedAt: new Date().toISOString()
  };
  return sendSuccess(res, 'Business profile updated successfully', updatedData);
};
