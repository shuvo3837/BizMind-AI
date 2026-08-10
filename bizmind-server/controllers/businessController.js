import mongoose from 'mongoose';
import Business from '../models/Business.js';
import User from '../models/User.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const sanitizeBusiness = (business) => ({
  id: business._id.toString(),
  _id: business._id.toString(),
  ownerId: business.ownerId ? business.ownerId.toString() : null,
  businessName: business.companyName,
  companyName: business.companyName,
  industry: business.industry,
  category: business.industry,
  location: business.location || '',
  currency: business.currency,
  description: business.description || '',
  monthlyTarget: business.monthlyTarget || 0,
  employeesCount: business.employeesCount || 0,
  website: business.website || '',
  createdAt: business.createdAt,
  updatedAt: business.updatedAt,
});

export const createBusiness = asyncHandler(async (req, res) => {
  if (!req.user || !req.user._id) {
    return sendError(res, 'Authentication required', 401);
  }

  const {
    businessName,
    companyName,
    industry,
    category,
    location,
    currency,
    description,
    monthlyTarget,
    employeesCount,
    website,
  } = req.body || {};

  const name = (businessName || companyName || '').trim();
  if (!name) {
    return sendError(res, 'Business name is required', 400);
  }

  const business = await Business.create({
    ownerId: req.user._id,
    companyName: name,
    industry: industry || category || 'General',
    location: location || '',
    currency: currency || 'USD',
    description: description || '',
    monthlyTarget: Number.isFinite(Number(monthlyTarget)) ? Number(monthlyTarget) : 0,
    employeesCount: Number.isFinite(Number(employeesCount)) ? Number(employeesCount) : 0,
    website: website || '',
  });

  // Link business to user
  await User.findByIdAndUpdate(req.user._id, { businessId: business._id });

  return sendSuccess(res, 'Business created successfully', sanitizeBusiness(business), 201);
});

export const getBusinesses = asyncHandler(async (req, res) => {
  if (!req.user || !req.user._id) {
    return sendError(res, 'Authentication required', 401);
  }

  const businesses = await Business.find({ ownerId: req.user._id }).sort({ createdAt: -1 });

  return sendSuccess(res, 'Businesses retrieved', {
    count: businesses.length,
    businesses: businesses.map(sanitizeBusiness),
  });
});

export const getBusinessById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return sendError(res, 'Invalid business id', 400);
  }

  const business = await Business.findOne({ _id: id, ownerId: req.user._id });
  if (!business) {
    return sendError(res, 'Business not found', 404);
  }

  return sendSuccess(res, 'Business retrieved', sanitizeBusiness(business));
});

export const updateBusiness = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return sendError(res, 'Invalid business id', 400);
  }

  const updates = {};
  const allowedFields = [
    'companyName',
    'industry',
    'location',
    'currency',
    'description',
    'monthlyTarget',
    'employeesCount',
    'website',
  ];
  for (const field of allowedFields) {
    if (req.body[field] !== undefined) {
      updates[field] = req.body[field];
    }
  }
  // Aliases
  if (req.body.businessName !== undefined) updates.companyName = req.body.businessName;
  if (req.body.category !== undefined) updates.industry = req.body.category;

  if (Object.keys(updates).length === 0) {
    return sendError(res, 'No valid fields provided to update', 400);
  }

  const business = await Business.findOneAndUpdate(
    { _id: id, ownerId: req.user._id },
    updates,
    { new: true, runValidators: true }
  );

  if (!business) {
    return sendError(res, 'Business not found or access denied', 404);
  }

  return sendSuccess(res, 'Business updated successfully', sanitizeBusiness(business));
});

export const deleteBusiness = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return sendError(res, 'Invalid business id', 400);
  }
  const business = await Business.findOneAndDelete({ _id: id, ownerId: req.user._id });
  if (!business) {
    return sendError(res, 'Business not found or access denied', 404);
  }
  await User.updateMany({ businessId: id }, { $unset: { businessId: 1 } });
  return sendSuccess(res, 'Business deleted', { id: business._id.toString() });
});

// Backward-compatible aliases for the existing frontend endpoints
export const getBusinessProfile = asyncHandler(async (req, res) => {
  if (!req.user || !req.user._id) {
    return sendError(res, 'Authentication required', 401);
  }
  const business = await Business.findOne({ ownerId: req.user._id }).sort({ createdAt: -1 });
  if (!business) {
    return sendError(res, 'No business found for this user', 404);
  }
  return sendSuccess(res, 'Business profile retrieved', sanitizeBusiness(business));
});

export const updateBusinessProfile = asyncHandler(async (req, res) => {
  if (!req.user || !req.user._id) {
    return sendError(res, 'Authentication required', 401);
  }

  const business = await Business.findOne({ ownerId: req.user._id });
  if (!business) {
    return sendError(res, 'No business found to update', 404);
  }

  const updates = {};
  const allowedFields = [
    'companyName',
    'industry',
    'location',
    'currency',
    'description',
    'monthlyTarget',
    'employeesCount',
    'website',
  ];
  for (const field of allowedFields) {
    if (req.body[field] !== undefined) {
      updates[field] = req.body[field];
    }
  }
  if (req.body.businessName !== undefined) updates.companyName = req.body.businessName;
  if (req.body.category !== undefined) updates.industry = req.body.category;

  const updated = await Business.findByIdAndUpdate(business._id, updates, {
    new: true,
    runValidators: true,
  });

  return sendSuccess(res, 'Business profile updated successfully', sanitizeBusiness(updated));
});
