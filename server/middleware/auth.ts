import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { getDb } from '../db';

const SESSION_COOKIE_NAME = 'cb_session';
const SESSION_SECRET = process.env.SESSION_SECRET || 'civicbridge-secure-session-key-dev-only-change-in-production';

export interface AuthenticatedUser {
  id: string;
  name: string;
  email: string;
  role: 'citizen' | 'officer' | 'department_admin' | 'expert' | 'super_admin';
  department_id?: string;
  department_name?: string;
  designation?: string;
  ward_or_district?: string;
  avatar?: string;
}

export interface AuthRequest extends Request {
  user?: AuthenticatedUser;
}

export function createSessionToken(user: AuthenticatedUser): string {
  return jwt.sign(
    {
      sub: user.id,
      email: user.email,
      role: user.role,
    },
    SESSION_SECRET,
    { expiresIn: '7d' }
  );
}

export function setSessionCookie(res: Response, token: string) {
  const isProduction = process.env.NODE_ENV === 'production';
  res.cookie(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: true, // Always true for cross-site iframe support
    sameSite: 'none', // Required for AI Studio iframe embedding & cross-site auth
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    path: '/',
  });
}

export function clearSessionCookie(res: Response) {
  res.clearCookie(SESSION_COOKIE_NAME, {
    httpOnly: true,
    secure: true,
    sameSite: 'none',
    path: '/',
  });
}

export async function authenticateUser(req: AuthRequest, res: Response, next: NextFunction) {
  const token = req.cookies?.[SESSION_COOKIE_NAME] || req.headers.authorization?.replace('Bearer ', '');

  if (!token) {
    req.user = undefined;
    return next();
  }

  try {
    const decoded = jwt.verify(token, SESSION_SECRET) as { sub: string; email: string };
    const db = getDb();
    const result = await db.query('SELECT * FROM users WHERE id = $1 AND is_active = true LIMIT 1', [decoded.sub]);

    if (result.rows && result.rows.length > 0) {
      const dbUser = result.rows[0];
      req.user = {
        id: dbUser.id,
        name: dbUser.name,
        email: dbUser.email,
        role: dbUser.role,
        department_id: dbUser.department_id,
        designation: dbUser.designation,
        ward_or_district: dbUser.ward_or_district,
        avatar: dbUser.avatar,
      };
    } else {
      req.user = undefined;
    }
  } catch (err) {
    req.user = undefined;
  }

  next();
}

/**
 * Enforces that user must be logged in with a valid session
 */
export function requireAuth(req: AuthRequest, res: Response, next: NextFunction) {
  if (!req.user) {
    return res.status(401).json({
      error: 'UNAUTHORIZED',
      message: 'Authentication required. Please sign in with your verified account.',
    });
  }
  next();
}

/**
 * Enforces strict role requirements.
 * Roles: 'citizen' | 'officer' | 'department_admin' | 'expert' | 'super_admin'
 */
export function requireRole(allowedRoles: string[]) {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        error: 'UNAUTHORIZED',
        message: 'Authentication required.',
      });
    }

    // Super admin has universal access
    if (req.user.role === 'super_admin') {
      return next();
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        error: 'FORBIDDEN',
        message: `Forbidden: This action requires one of the following roles: [${allowedRoles.join(', ')}]. Your current role is "${req.user.role}".`,
      });
    }

    next();
  };
}

/**
 * Enforces departmental data segregation for department admins and officers
 */
export function requireDepartmentAccess(req: AuthRequest, res: Response, next: NextFunction) {
  if (!req.user) {
    return res.status(401).json({ error: 'UNAUTHORIZED', message: 'Authentication required.' });
  }

  if (req.user.role === 'super_admin') {
    return next();
  }

  const targetDeptId = req.params.deptId || req.body.department_id;
  if (req.user.department_id && targetDeptId && req.user.department_id !== targetDeptId) {
    return res.status(403).json({
      error: 'FORBIDDEN_DEPARTMENT',
      message: 'Access denied: You cannot access grievances outside your assigned municipal department.',
    });
  }

  next();
}
