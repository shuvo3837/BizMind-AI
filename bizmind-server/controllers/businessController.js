import Business from '../models/Business.js';
import { getBusinessContext } from '../services/businessContextService.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';

export const getBusinessProfile = async (req, res) => {
  try {
    const { businessId, business } = await getBusinessContext(req);
    return sendSuccess(res, 'Business profile retrieved', {
      id: businessId,
      _id: businessId,
      businessId,
      companyName: business.companyName || business.businessName || 'My Business Workspace',
      businessName: business.businessName || business.companyName || 'My Business Workspace',
      industry: business.industry || 'General Retail',
      businessType: business.businessType || 'Retail',
      country: business.country || 'United States',
      currency: business.currency || 'USD',
      monthlyTarget: business.monthlyTarget || 50000,
      employeesCount: business.employeesCount || 5,
      website: business.website || '',
      description: business.description || '',
      logo: business.logo || '',
      createdAt: business.createdAt || new Date()
    });
  } catch (error) {
    return sendError(res, error.message || 'Error fetching business profile', 500);
  }
};

export const updateBusinessProfile = async (req, res) => {
  try {
    const { businessId, userId } = await getBusinessContext(req);
    const updateFields = {
      ...req.body,
      companyName: req.body.companyName || req.body.businessName,
      businessName: req.body.businessName || req.body.companyName
    };

    let updated = await Business.findOneAndUpdate(
      { $or: [{ businessId }, { ownerId: userId }, { _id: businessId.match(/^[0-9a-fA-F]{24}$/) ? businessId : null }].filter(Boolean) },
      { $set: updateFields },
      { new: true, upsert: true }
    ).lean();

    return sendSuccess(res, 'Business profile updated successfully', {
      id: businessId,
      _id: businessId,
      businessId,
      ...updated
    });
  } catch (error) {
    return sendError(res, error.message || 'Error updating business profile', 500);
  }
};

export default {
  getBusinessProfile,
  updateBusinessProfile
};
