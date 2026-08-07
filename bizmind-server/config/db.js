import mongoose from 'mongoose';

export const connectDB = async () => {
  try {
    const connStr = process.env.MONGODB_URI;
    if (!connStr || connStr.includes('username:password')) {
      console.log('ℹ️ MongoDB URI not configured or using default template. Running with in-memory persistence layer fallback.');
      return false;
    }
    const conn = await mongoose.connect(connStr);
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    return true;
  } catch (error) {
    console.warn(`⚠️ MongoDB connection error: ${error.message}. Continuing with local fallback state.`);
    return false;
  }
};
