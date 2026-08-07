import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { JWT_CONFIG } from '../config/jwt.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';

export const registerUser = async (req, res) => {
  try {
    const { name, email, password, companyName, industry } = req.body;

    const mockUser = {
      id: 'usr_' + Date.now(),
      name: name || 'Demo Business Owner',
      email: email || 'owner@bizmind.ai',
      role: 'owner',
      business: {
        id: 'biz_' + Date.now(),
        companyName: companyName || 'BizMind Global Corp',
        industry: industry || 'SaaS & E-Commerce'
      }
    };

    const token = jwt.sign(
      { id: mockUser.id, email: mockUser.email, role: mockUser.role },
      JWT_CONFIG.secret,
      { expiresIn: JWT_CONFIG.expiresIn }
    );

    return sendSuccess(res, 'User registered successfully', { user: mockUser, token }, 201);
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const mockUser = {
      id: 'usr_65f1a2b3c4d5e6f7a8b9c0d1',
      name: 'Alex Vance',
      email: email || 'alex@bizmind.ai',
      role: 'owner',
      business: {
        id: 'biz_65f1a2b3c4d5e6f7a8b9c0d2',
        companyName: 'Apex Growth Dynamics',
        industry: 'E-Commerce & Digital Commerce',
        currency: 'USD',
        monthlyTarget: 150000
      }
    };

    const token = jwt.sign(
      { id: mockUser.id, email: mockUser.email, role: mockUser.role },
      JWT_CONFIG.secret,
      { expiresIn: JWT_CONFIG.expiresIn }
    );

    return sendSuccess(res, 'Logged in successfully', { user: mockUser, token });
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};

export const getCurrentUserProfile = async (req, res) => {
  return sendSuccess(res, 'User profile retrieved', {
    user: req.user || {
      id: 'usr_65f1a2b3c4d5e6f7a8b9c0d1',
      name: 'Alex Vance',
      email: 'alex@bizmind.ai',
      role: 'owner'
    }
  });
};
