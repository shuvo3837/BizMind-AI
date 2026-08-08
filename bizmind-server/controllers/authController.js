import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Business from '../models/Business.js';
import { JWT_CONFIG } from '../config/jwt.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';

export const registerUser = async (req, res) => {
  try {
    const { name, email, password, companyName, industry } = req.body;

    if (!email) {
      return sendError(res, 'Email address is required.', 400);
    }

    const cleanEmail = email.trim().toLowerCase();
    let existingUser = await User.findOne({ email: cleanEmail });

    if (existingUser) {
      return sendError(res, 'A user with this email address already exists. Please log in.', 400);
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password || 'password123', salt);

    const user = await User.create({
      name: name || 'Business Owner',
      email: cleanEmail,
      password: hashedPassword,
      role: 'owner'
    });

    const business = await Business.create({
      ownerId: user._id.toString(),
      companyName: companyName || `${user.name}'s Business`,
      businessName: companyName || `${user.name}'s Business`,
      industry: industry || 'General Retail',
      businessId: 'biz_' + user._id.toString()
    });

    user.businessId = business.businessId || business._id.toString();
    await user.save();

    const token = jwt.sign(
      {
        id: user._id.toString(),
        _id: user._id.toString(),
        email: user.email,
        role: user.role,
        businessId: user.businessId
      },
      JWT_CONFIG.secret,
      { expiresIn: JWT_CONFIG.expiresIn }
    );

    return sendSuccess(
      res,
      'User registered successfully',
      {
        user: {
          id: user._id.toString(),
          _id: user._id.toString(),
          name: user.name,
          email: user.email,
          role: user.role,
          businessId: user.businessId,
          business: {
            id: business.businessId || business._id.toString(),
            companyName: business.companyName,
            industry: business.industry
          }
        },
        token
      },
      201
    );
  } catch (error) {
    console.error('Registration error:', error);
    return sendError(res, error.message || 'Error registering user', 500);
  }
};

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const cleanEmail = (email || 'owner@bizmind.ai').trim().toLowerCase();

    let user = await User.findOne({ email: cleanEmail });

    if (!user) {
      // Auto-provision user for smooth demo/first-login
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password || 'password123', salt);

      user = await User.create({
        name: cleanEmail.split('@')[0].replace(/[^a-zA-Z]/g, ' ') || 'Business Owner',
        email: cleanEmail,
        password: hashedPassword,
        role: 'owner'
      });
    }

    let business = await Business.findOne({
      $or: [{ ownerId: user._id.toString() }, { businessId: user.businessId }]
    });

    if (!business) {
      business = await Business.create({
        ownerId: user._id.toString(),
        companyName: `${user.name}'s Business`,
        businessName: `${user.name}'s Business`,
        industry: 'General Retail',
        businessId: 'biz_' + user._id.toString()
      });
    }

    if (!user.businessId) {
      user.businessId = business.businessId || business._id.toString();
      await user.save();
    }

    const token = jwt.sign(
      {
        id: user._id.toString(),
        _id: user._id.toString(),
        email: user.email,
        role: user.role,
        businessId: user.businessId
      },
      JWT_CONFIG.secret,
      { expiresIn: JWT_CONFIG.expiresIn }
    );

    return sendSuccess(res, 'Logged in successfully', {
      user: {
        id: user._id.toString(),
        _id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
        businessId: user.businessId,
        business: {
          id: business.businessId || business._id.toString(),
          companyName: business.companyName,
          industry: business.industry,
          currency: business.currency || 'USD'
        }
      },
      token
    });
  } catch (error) {
    console.error('Login error:', error);
    return sendError(res, error.message || 'Error logging in', 500);
  }
};

export const getCurrentUserProfile = async (req, res) => {
  try {
    const userId = req.user?.id || req.user?._id;
    let user = null;
    let business = null;

    if (userId) {
      user = await User.findById(userId).lean();
      if (user) {
        business = await Business.findOne({
          $or: [{ ownerId: user._id.toString() }, { businessId: user.businessId }]
        }).lean();
      }
    }

    const fallbackUser = req.user || {
      id: 'usr_default_101',
      name: 'Business Owner',
      email: 'owner@bizmind.ai',
      role: 'owner',
      businessId: 'biz_default_101'
    };

    return sendSuccess(res, 'User profile retrieved', {
      user: user
        ? {
            id: user._id.toString(),
            _id: user._id.toString(),
            name: user.name,
            email: user.email,
            role: user.role,
            businessId: user.businessId || business?.businessId || 'biz_default_101',
            companyName: business?.companyName || 'My Business Workspace'
          }
        : fallbackUser
    });
  } catch (error) {
    return sendError(res, error.message || 'Error fetching profile', 500);
  }
};
