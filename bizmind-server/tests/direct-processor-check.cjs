// Direct test of fileProcessor + DB inserts (no HTTP server required).
// Writes a JSON status file we can inspect afterwards.
const fs = require('fs');
const path = require('path');

require('dotenv').config({ path: path.resolve(__dirname, '..', '.env') });

(async () => {
  const out = { startedAt: new Date().toISOString(), events: [] };
  const log = (name, data) => {
    out.events.push({ at: new Date().toISOString(), name, ...data });
    fs.writeFileSync(path.resolve(__dirname, '..', 'processor-test-output.json'), JSON.stringify(out, null, 2));
  };

  try {
    log('boot', { uri: !!process.env.MONGODB_URI, envFile: process.env.NODE_ENV });

    const mongoose = require('mongoose');
    await mongoose.connect(process.env.MONGODB_URI, {
      dbName: process.env.MONGODB_DB_NAME || 'bizmind_ai',
      serverSelectionTimeoutMS: 8000,
    });
    log('connected', { host: mongoose.connection.host, db: mongoose.connection.name });

    const Sale = require('../models/Sale');
    const Expense = require('../models/Expense');
    const Product = require('../models/Product');
    const Inventory = require('../models/Inventory');
    const Upload = require('../models/Upload');
    const Business = require('../models/Business');

    const ownerId = new mongoose.Types.ObjectId('000000000000000000000001');
    let biz = await Business.findOne({ ownerId, companyName: 'Processor Test Workspace' }).lean();
    if (!biz) {
      const created = await Business.create({
        ownerId,
        companyName: 'Processor Test Workspace',
        industry: 'Testing',
        currency: 'USD',
      });
      biz = created.toObject();
    }
    const businessId = biz._id.toString();
    const userId = ownerId.toString();

    const sample = path.resolve(__dirname, '..', '..', 'sample-test.csv');
    log('csv', { path: sample, exists: fs.existsSync(sample), size: fs.existsSync(sample) ? fs.statSync(sample).size : 0 });

    const { processUpload } = require('../services/fileProcessor');
    const fakeFile = {
      originalname: 'sample-test.csv',
      filename: 'sample-test.csv',
      mimetype: 'text/csv',
      size: fs.statSync(sample).size,
      path: sample,
    };

    let result;
    try {
      result = await processUpload({ file: fakeFile, businessId, userId });
      log('processUpload', { ok: true, result });
    } catch (err) {
      log('processUpload', { ok: false, message: err.message, stack: err.stack });
      await mongoose.disconnect();
      process.exit(1);
    }

    const counts = await Promise.all([
      Sale.countDocuments({ businessId }),
      Expense.countDocuments({ businessId }),
      Product.countDocuments({ businessId }),
      Inventory.countDocuments({ businessId }),
      Upload.countDocuments({ businessId }),
    ]);
    const samples = await Promise.all([
      Sale.findOne({ businessId }).select('businessId userId productName quantity revenue').lean(),
      Product.findOne({ businessId }).select('businessId userId name totalUnitsSold totalRevenue').lean(),
      Inventory.findOne({ businessId }).select('businessId userId productName quantity inventoryValue').lean(),
    ]);
    log('counts', {
      sales: counts[0],
      expenses: counts[1],
      products: counts[2],
      inventory: counts[3],
      uploads: counts[4],
      sampleSale: samples[0],
      sampleProduct: samples[1],
      sampleInventory: samples[2],
    });

    await mongoose.disconnect();
    log('done', {});
    process.exit(0);
  } catch (err) {
    log('fatal', { message: err.message, stack: err.stack });
    process.exit(1);
  }
})();