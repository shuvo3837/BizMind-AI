import { connectDB } from '../config/db.js';

export const initializeDatabase = async () => {
  return await connectDB();
};
