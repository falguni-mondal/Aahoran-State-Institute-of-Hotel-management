import jwt from 'jsonwebtoken';
import { Alumni } from '../models/alumni.model.js';
import Admin from '../models/admin.model.js';

const getJwtSecret = () =>
  process.env.JWT_ACCESS_SECRET || 'sihm_durgapur_fallback_jwt_secret_2026';

/**
 * Generates a 7-day JWT token for an authenticated Alumnus.
 */
export const signAlumniSessionToken = (alumniDoc) => {
  return jwt.sign(
    {
      id: alumniDoc._id,
      registrationId: alumniDoc.registrationId,
      email: alumniDoc.email,
      role: 'Alumni',
      type: 'alumni_access',
    },
    getJwtSecret(),
    { expiresIn: '7d' }
  );
};

/**
 * Sets an HttpOnly cookie (`sihm_alumni_token`) for seamless Alumni session persistence.
 */
export const setAlumniSessionCookie = (res, token) => {
  res.cookie('sihm_alumni_token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: '/',
  });
};

/**
 * Clears the HttpOnly Alumni session cookie on logout.
 */
export const clearAlumniSessionCookie = (res) => {
  res.cookie('sihm_alumni_token', 'logged_out', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    maxAge: 0,
    expires: new Date(0),
    path: '/',
  });
};

/**
 * Extracts the Alumni JWT from either `Authorization: Bearer <token>` or `req.cookies.sihm_alumni_token`.
 */
const extractTokenFromRequest = (req) => {
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer ')
  ) {
    return req.headers.authorization.split(' ')[1];
  }
  if (
    req.cookies?.sihm_alumni_token &&
    req.cookies.sihm_alumni_token !== 'logged_out'
  ) {
    return req.cookies.sihm_alumni_token;
  }
  return null;
};

/**
 * Optional middleware: Populates `req.alumni` if a valid Alumni token is present,
 * or leaves `req.alumni = null` for unauthenticated guests without blocking the request.
 */
export const optionalAlumniAuth = async (req, _res, next) => {
  try {
    const token = extractTokenFromRequest(req);
    if (!token) {
      req.alumni = null;
      return next();
    }

    const decoded = jwt.verify(token, getJwtSecret());
    if (decoded.type === 'alumni_access' && decoded.role === 'Alumni') {
      const alumnus = await Alumni.findById(decoded.id).lean();
      if (alumnus) {
        req.alumni = alumnus;
        req.actorRole = 'Alumni';
      }
    } else if (decoded.type === 'access') {
      const admin = await Admin.findById(decoded.id).lean();
      if (admin) {
        req.user = admin;
        req.actorRole = admin.role || 'Admin';
      }
    }
  } catch {
    req.alumni = null;
  }
  return next();
};

/**
 * Strict middleware: Requires a valid logged-in Alumnus session.
 */
export const verifyAlumniToken = async (req, res, next) => {
  try {
    const token = extractTokenFromRequest(req);
    if (!token) {
      return res.status(401).json({
        status: 'fail',
        message: 'Please sign in to your SIHM Alumni account to continue.',
      });
    }

    const decoded = jwt.verify(token, getJwtSecret());
    if (decoded.type !== 'alumni_access' || decoded.role !== 'Alumni') {
      return res.status(403).json({
        status: 'fail',
        message: 'Invalid token scope. Alumni account clearance required.',
      });
    }

    const alumnus = await Alumni.findById(decoded.id);
    if (!alumnus) {
      return res.status(401).json({
        status: 'fail',
        message: 'The Alumni account associated with this session no longer exists.',
      });
    }

    req.alumni = alumnus;
    req.actorRole = 'Alumni';
    return next();
  } catch {
    return res.status(401).json({
      status: 'fail',
      message: 'Your Alumni session has expired. Please sign in again.',
    });
  }
};

/**
 * Role-Based Access Control (RBAC) Gate:
 * Ensures the caller holds one of the permitted roles (`Alumni`, `Admin`, `SuperAdmin`).
 */
export const requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    const currentRole =
      req.user?.role || (req.alumni ? 'Alumni' : null) || req.actorRole;

    if (!currentRole || !allowedRoles.includes(currentRole)) {
      return res.status(403).json({
        status: 'fail',
        message: `Access denied. Required role clearance: ${allowedRoles.join(' or ')}.`,
      });
    }
    return next();
  };
};