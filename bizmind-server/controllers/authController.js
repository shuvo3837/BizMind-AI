import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { JWT_CONFIG } from '../config/jwt.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { validateRegisterInput, validateLoginInput } from '../validators/authValidator.js';

const generateToken = (userId, email, role) =>
  jwt.sign({ id: userId, email, role }, JWT_CONFIG.secret, { expiresIn: JWT_CONFIG.expiresIn });

const sanitizeUser = (user) => ({
  id: user._id.toString(),
  _id: user._id.toString(),
  name: user.name,
  email: user.email,
  role: user.role,
  businessId: user.businessId ? user.businessId.toString() : null,
  avatar: user.avatar || '',
  createdAt: user.createdAt,
  updatedAt: user.updatedAt,
});

export const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password, companyName, industry } = req.body || {};

  const validation = validateRegisterInput({ name, email, password });
  if (!validation.isValid) {
    return sendError(res, 'Validation failed', 400, validation.errors);
  }

  const normalizedEmail = email.toLowerCase().trim();
  const existing = await User.findOne({ email: normalizedEmail });
  if (existing) {
    return sendError(res, 'A user with this email already exists', 409);
  }

  const hashedPassword = await bcrypt.hash(password, 12);

  const user = await User.create({
    name: name.trim(),
    email: normalizedEmail,
    password: hashedPassword,
    role: 'owner',
  });

  // Optionally auto-create a business on registration if details provided.
  if (companyName) {
    try {
      const { default: Business } = await import('../models/Business.js');
      const business = await Business.create({
        ownerId: user._id,
        companyName: companyName.trim(),
        industry: industry || 'General',
      });
      user.businessId = business._id;
      await user.save();
    } catch (err) {
      console.warn('Auto-create business on register failed:', err.message);
    }
  }

  const token = generateToken(user._id.toString(), user.email, user.role);

  return sendSuccess(
    res,
    'User registered successfully',
    { user: sanitizeUser(user), token },
    201
  );
});

export const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body || {};

  const validation = validateLoginInput({ email, password });
  if (!validation.isValid) {
    return sendError(res, 'Validation failed', 400, validation.errors);
  }

  const normalizedEmail = email.toLowerCase().trim();
  const user = await User.findOne({ email: normalizedEmail }).select('+password');
  if (!user) {
    return sendError(res, 'Invalid email or password', 401);
  }

  const passwordMatches = await bcrypt.compare(password, user.password);
  if (!passwordMatches) {
    return sendError(res, 'Invalid email or password', 401);
  }

  const token = generateToken(user._id.toString(), user.email, user.role);

  return sendSuccess(res, 'Logged in successfully', { user: sanitizeUser(user), token });
});

export const getCurrentUserProfile = asyncHandler(async (req, res) => {
  if (!req.user || !req.user._id) {
    return sendError(res, 'Not authenticated', 401);
  }
  const user = await User.findById(req.user._id);
  if (!user) {
    return sendError(res, 'User not found', 404);
  }
  return sendSuccess(res, 'User profile retrieved', { user: sanitizeUser(user) });
});
