import { Router, Response } from 'express';
import bcrypt from 'bcryptjs';
import { getDb } from '../db';
import {
  AuthRequest,
  AuthenticatedUser,
  createSessionToken,
  setSessionCookie,
  clearSessionCookie,
  requireAuth,
} from '../middleware/auth';

export const authRouter = Router();

// Designated super administrators by email
const SUPER_ADMIN_EMAILS = [
  'rohantarke07@gmail.com',
  'admin@civicbridge.gov.in',
  ...(process.env.SUPER_ADMIN_EMAILS ? process.env.SUPER_ADMIN_EMAILS.split(',').map((e) => e.trim().toLowerCase()) : []),
];

// 1. POST /api/auth/login - Secure Email & Password authentication
authRouter.post('/login', async (req: AuthRequest, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'MISSING_FIELDS', message: 'Email and password are required.' });
    }

    const cleanEmail = String(email).toLowerCase().trim();
    const db = getDb();

    const userQuery = await db.query('SELECT * FROM users WHERE email = $1 AND is_active = true LIMIT 1', [cleanEmail]);
    if (!userQuery.rows || userQuery.rows.length === 0) {
      return res.status(401).json({ error: 'INVALID_CREDENTIALS', message: 'Invalid email or password.' });
    }

    const dbUser = userQuery.rows[0];
    if (!dbUser.password_hash) {
      return res.status(401).json({ error: 'INVALID_CREDENTIALS', message: 'Invalid email or password.' });
    }

    const isMatch = await bcrypt.compare(String(password), dbUser.password_hash);
    if (!isMatch) {
      return res.status(401).json({ error: 'INVALID_CREDENTIALS', message: 'Invalid email or password.' });
    }

    const authUser: AuthenticatedUser = {
      id: dbUser.id,
      name: dbUser.name,
      email: dbUser.email,
      role: dbUser.role,
      department_id: dbUser.department_id,
      designation: dbUser.designation,
      ward_or_district: dbUser.ward_or_district,
      avatar: dbUser.avatar,
    };

    const sessionToken = createSessionToken(authUser);
    setSessionCookie(res, sessionToken);

    res.json({ success: true, user: authUser });
  } catch (err: any) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'AUTH_ERROR', message: err.message || 'Authentication failed.' });
  }
});

// 2. POST /api/auth/register - Secure Citizen Registration (role is strictly determined by backend)
authRouter.post('/register', async (req: AuthRequest, res: Response) => {
  try {
    const { email, password, name, phone } = req.body;
    if (!email || !password || !name) {
      return res.status(400).json({ error: 'MISSING_FIELDS', message: 'Name, email, and password are required.' });
    }

    const cleanEmail = String(email).toLowerCase().trim();
    const cleanName = String(name).trim();

    if (password.length < 6) {
      return res.status(400).json({ error: 'WEAK_PASSWORD', message: 'Password must be at least 6 characters.' });
    }

    const db = getDb();
    const existing = await db.query('SELECT id FROM users WHERE email = $1 LIMIT 1', [cleanEmail]);
    if (existing.rows && existing.rows.length > 0) {
      return res.status(409).json({ error: 'EMAIL_EXISTS', message: 'An account with this email already exists.' });
    }

    // Strictly enforce: users cannot pick their role; backend exclusively determines roles.
    // Public registrations always create a Citizen account.
    const isDesignatedAdmin = SUPER_ADMIN_EMAILS.includes(cleanEmail);
    const assignedRole = isDesignatedAdmin ? 'super_admin' : 'citizen';

    const passwordHash = await bcrypt.hash(String(password), 10);

    const insert = await db.query(
      `INSERT INTO users (name, email, password_hash, phone, role, is_active)
       VALUES ($1, $2, $3, $4, $5, true)
       RETURNING *`,
      [cleanName, cleanEmail, passwordHash, phone || null, assignedRole]
    );

    const newUser = insert.rows[0];
    const authUser: AuthenticatedUser = {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      ward_or_district: newUser.ward_or_district,
      avatar: newUser.avatar,
    };

    const sessionToken = createSessionToken(authUser);
    setSessionCookie(res, sessionToken);

    res.json({ success: true, user: authUser });
  } catch (err: any) {
    console.error('Registration error:', err);
    res.status(500).json({ error: 'REGISTRATION_ERROR', message: err.message || 'Registration failed.' });
  }
});

// 7. GET /api/auth/me - Current user
authRouter.get('/me', (req: AuthRequest, res: Response) => {
  if (!req.user) {
    return res.json({ authenticated: false, user: null });
  }
  res.json({ authenticated: true, user: req.user });
});

// 8. POST /api/auth/logout - Sign out
authRouter.post('/logout', (req: AuthRequest, res: Response) => {
  clearSessionCookie(res);
  res.json({ success: true, message: 'Logged out successfully.' });
});

// 9. PATCH /api/auth/profile - Update personal profile
authRouter.patch('/profile', requireAuth, async (req: AuthRequest, res: Response) => {
  const { name, phone, avatar, wardOrDistrict, language } = req.body;
  const db = getDb();

  // Users can NEVER change their own role or department through this endpoint
  await db.query(
    `UPDATE users 
     SET name = COALESCE($1, name),
         phone = COALESCE($2, phone),
         avatar = COALESCE($3, avatar),
         ward_or_district = COALESCE($4, ward_or_district),
         language = COALESCE($5, language),
         updated_at = CURRENT_TIMESTAMP
     WHERE id = $6`,
    [name || null, phone || null, avatar || null, wardOrDistrict || null, language || null, req.user!.id]
  );

  const updated = await db.query('SELECT * FROM users WHERE id = $1', [req.user!.id]);
  const u = updated.rows[0];

  res.json({
    success: true,
    user: {
      id: u.id,
      name: u.name,
      email: u.email,
      role: u.role,
      phone: u.phone,
      department_id: u.department_id,
      designation: u.designation,
      ward_or_district: u.ward_or_district,
      avatar: u.avatar,
      language: u.language,
    },
  });
});
