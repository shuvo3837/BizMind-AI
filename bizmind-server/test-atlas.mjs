import mongoose from 'mongoose';

const uri = process.env.MONGODB_URI ||
  'mongodb+srv://shuvosd4747_db_user:yTFsoKgkm4Prm314@cluster0.8c01ywb.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';

try {
  await mongoose.connect(uri, { serverSelectionTimeoutMS: 6000 });
  console.log('OK connected to', mongoose.connection.host, '/', mongoose.connection.name);
  await mongoose.connection.close();
  process.exit(0);
} catch (e) {
  console.error('FAIL:', e.message);
  process.exit(1);
}
