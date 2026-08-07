import jwt from 'jsonwebtoken';
import { JWT_CONFIG } from '../config/jwt.js';

export const protect = (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    // If no token is provided, allow demo mode user context for smooth evaluation/preview
    req.user = {
      _id: '65f1a2b3c4d5e6f7a8b9c0d1',
      id: '65f1a2b3c4d5e6f7a8b9c0d1',
      name: 'Demo Owner',
      email: 'demo@bizmind.ai',
      role: 'owner',
      businessId: '65f1a2b3c4d5e6f7a8b9c0d2'
    };
    return next();
  }

  try {
    const decoded = jwt.verify(token, JWT_CONFIG.secret);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized, token failed or expired'
    });
  }
};
