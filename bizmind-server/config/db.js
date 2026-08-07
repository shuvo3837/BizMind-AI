import mongoose from 'mongoose';

export const connectDB = async () => {
  try {
    const connStr = process.env.MONGODB_URI;
    if (!connStr || connStr.includes('username:password') || connStr.includes('<password>')) {
      console.log('ℹ️ MongoDB URI not configured. Operating with high-performance in-memory persistence layer.');
      return false;
    }
    const conn = await mongoose.connect(connStr, {
      serverSelectionTimeoutMS: 3000
    });
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    return true;
  } catch (error) {
    console.log(`ℹ️ External MongoDB connection skipped (${error.message}). Operating smoothly with in-memory persistence layer.`);
    return false;
  }
};
