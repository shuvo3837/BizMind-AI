import Business from '../models/Business.js';
import User from '../models/User.js';

export const DEV_BUSINESS_ID = 'dev-business-001';
export const DEV_USER_ID = 'usr_default_101';

export const getBusinessContext = async (req) => {
  let userId = req?.user?.id || req?.user?._id || req?.headers?.['x-user-id'] || DEV_USER_ID;
  let businessId = req?.user?.businessId || req?.headers?.['x-business-id'] || req?.query?.businessId || req?.body?.businessId || DEV_BUSINESS_ID;

  let business = null;

  try {
    // Look up business by businessId string, or ownerId
    business = await Business.findOne({
      $or: [
        { businessId: businessId },
        { ownerId: userId },
        { _id: businessId.match(/^[0-9a-fA-F]{24}$/) ? businessId : null }
      ].filter(Boolean)
    }).lean();

    if (!business) {
      // Create new Business profile for this businessId / userId in MongoDB
      const created = await Business.create({
        businessId: businessId,
        ownerId: userId,
        companyName: 'My Business Workspace',
        businessName: 'My Business Workspace',
        industry: 'E-Commerce & Retail',
        businessType: 'Retail',
        country: 'United States',
        currency: 'USD',
        monthlyTarget: 50000,
        employeesCount: 5,
        website: '',
        description: 'Business Intelligence Workspace'
      });
      business = created.toObject();
    }
  } catch (err) {
    console.warn('getBusinessContext fallback warning:', err.message);
    business = {
      _id: businessId,
      businessId: businessId,
      ownerId: userId,
      companyName: 'My Business Workspace',
      businessName: 'My Business Workspace',
      industry: 'E-Commerce & Retail',
      currency: 'USD'
    };
  }

  const finalBusinessId = business.businessId || business._id?.toString() || businessId;

  return {
    userId,
    businessId: finalBusinessId,
    business
  };
};

export default {
  getBusinessContext
};
