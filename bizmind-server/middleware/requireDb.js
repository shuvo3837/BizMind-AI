import mongoose from 'mongoose';
import { fail } from '../utils/apiResponse.js';

/**
 * Guard middleware: refuses the request with HTTP 503 when the database is
 * not currently reachable. Mounted before any route that requires real DB
 * reads/writes. Health/auth endpoints opt out explicitly.
 */
export const requireDb = (req, res, next) => {
  if (mongoose.connection.readyState === 1) {
    return next();
  }
  return fail(
    res,
    'MongoDB is not currently reachable. Please retry once the database is online.',
    503
  );
};