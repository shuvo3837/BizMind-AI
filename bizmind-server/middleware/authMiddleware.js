import jwt from 'jsonwebtoken';
import { JWT_CONFIG } from '../config/jwt.js';
import User from '../models/User.js';
import Business from '../models/Business.js';

// When BYPASS_AUTH=true, JWT is disabled for the current testing/development phase.
// Controllers still receive a synthetic req.user so downstream ownership checks work.
// Flip BYPASS_AUTH back to false (or remove it) to re-enable JWT authentication.
// NOTE: read this lazily because ESM hoists `import` statements above the
// `dotenv.config()` call in app.js, so a top-level `const` here would freeze
// the value to whatever process.env was when the module first loaded (likely
// undefined). The getter below re-reads on every request.
const isBypassEnabledStatic = () => String(process.env.BYPASS_AUTH || '').toLowerCase() === 'true';

// Synthetic dev user used when BYPASS_AUTH is on. businessId is resolved lazily
// so a fresh MongoDB Atlas still gets a working ownership filter.
const DEV_USER_ID = process.env.BYPASS_AUTH_USER_ID || null;
const DEV_BUSINESS_ID = process.env.BYPASS_AUTH_BUSINESS_ID || null;

const isBypassEnabled = () => isBypassEnabledStatic();

// In-memory cache for the resolved dev businessId so we don't hit MongoDB on every request.
let cachedDevBusinessId = null;
let cachedDevUserId = null;

// Once the DB is known to be unreachable (timeout/IP block), go straight to
// synthetic ids on subsequent requests without re-trying.
let dbUnavailable = false;

const ensureDevBusiness = async () => {
  // Hard-pinned bypass business id wins immediately.
  if (DEV_BUSINESS_ID) {
    cachedDevBusinessId = DEV_BUSINESS_ID;
  }

  // Hard-pinned user id wins immediately.
  if (DEV_USER_ID) {
    cachedDevUserId = DEV_USER_ID;
  }

  if (cachedDevBusinessId && cachedDevUserId) {
    return { userId: cachedDevUserId, businessId: cachedDevBusinessId };
  }

  // If we already know the DB is unreachable, skip the slow query entirely.
  if (dbUnavailable) {
    cachedDevUserId = '000000000000000000000001';
    cachedDevBusinessId = '000000000000000000000002';
    return { userId: cachedDevUserId, businessId: cachedDevBusinessId };
  }

  // Resolve (or create) a Business row we can attach to the synthetic user.
  // We use a sentinel string ObjectId for the owner since we're not creating a User.
  const ownerId = '000000000000000000000001';

  // Race the DB call against a 3s timeout. If Atlas is unreachable (IP block,
  // DNS failure, etc.) we go straight to synthetic ids rather than block the
  // request for the driver's default 10s+ timeout.
  const tryResolveFromDB = async () => {
    let biz = await Business.findOne({ ownerId, companyName: 'BizMind Dev Workspace' })
      .maxTimeMS(2000)
      .lean();
    if (!biz) {
      const created = await Business.create({
        ownerId,
        companyName: 'BizMind Dev Workspace',
        industry: 'Testing',
        currency: 'USD',
        monthlyTarget: 0,
        employeesCount: 1,
        description: 'Auto-created for BYPASS_AUTH testing phase.',
      });
      biz = created.toObject();
      console.log('[BYPASS_AUTH] Created dev Business ' + biz._id.toString());
    }
    return biz._id.toString();
  };

  try {
    const businessId = await Promise.race([
      tryResolveFromDB(),
      new Promise((_, reject) => setTimeout(() => reject(new Error('DB timeout 3s')), 3000))
    ]);
    cachedDevBusinessId = businessId;
    cachedDevUserId = ownerId;
    return { userId: cachedDevUserId, businessId: cachedDevBusinessId };
  } catch (e) {
    // DB unreachable (timeout, Atlas IP block, etc.) — use a stable synthetic
    // ObjectId pair so the upload pipeline still works for testing. Data will
    // not persist across server restarts until Atlas is reachable.
    console.warn('[BYPASS_AUTH] DB unreachable, using synthetic dev businessId:', e.message);
    dbUnavailable = true;
    cachedDevUserId = '000000000000000000000001';
    cachedDevBusinessId = '000000000000000000000002';
    return { userId: cachedDevUserId, businessId: cachedDevBusinessId };
  }
};

const buildDevUser = async () => {
  const { userId, businessId } = await ensureDevBusiness();
  return {
    _id: userId,
    id: userId,
    name: 'Dev Bypass User',
    email: 'dev@bizmind.local',
    role: 'owner',
    businessId,
    __bypassAuth: true,
  };
};

export const protect = async (req, res, next) => {
  // ----- BYPASS MODE -----
  // Skip JWT entirely so the upload (and any other) endpoint works without a token
  // during the testing phase. Set BYPASS_AUTH=false (or remove it) to restore JWT.
  if (isBypassEnabled()) {
    try {
      req.user = await buildDevUser();
    } catch (e) {
      console.error('[BYPASS_AUTH] Failed to build dev user:', e.message);
      return res.status(500).json({
        success: false,
        message: 'Auth bypass is enabled but dev workspace setup failed.',
      });
    }
    return next();
  }

  // ----- JWT MODE -----
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized: missing authentication token',
    });
  }

  try {
    const decoded = jwt.verify(token, JWT_CONFIG.secret);
    const user = await User.findById(decoded.id).select('-password').lean();

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized: user no longer exists',
      });
    }

    req.user = {
      _id: user._id,
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
      businessId: user.businessId ? user.businessId.toString() : null,
    };

    return next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized: token failed or expired',
    });
  }
};

export { isBypassEnabled };
