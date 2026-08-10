import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';

const s = await MongoMemoryServer.create();
const uri = s.getUri();
console.log('MEMORY_URI:', uri);

await mongoose.connect(uri, { dbName: 'bizmind_ai_test' });
console.log('CONNECTED to memory server');
await mongoose.connection.close();
await s.stop();
console.log('DONE');
process.exit(0);