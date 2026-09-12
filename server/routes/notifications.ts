import { Router, Response } from 'express';
import { getDb } from '../db';
import { AuthRequest, requireAuth } from '../middleware/auth';

export const notificationsRouter = Router();

// GET /api/notifications - User's notifications
notificationsRouter.get('/', requireAuth, async (req: AuthRequest, res: Response) => {
  const db = getDb();
  try {
    const result = await db.query(
      `SELECT * FROM notifications WHERE user_id = $1 ORDER BY created_at DESC LIMIT 30`,
      [req.user!.id]
    );
    res.json({ success: true, notifications: result.rows || [] });
  } catch (err: any) {
    res.status(500).json({ error: 'DB_ERROR', message: err.message });
  }
});

// PATCH /api/notifications/:id/read - Mark one read
notificationsRouter.patch('/:id/read', requireAuth, async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const db = getDb();
  try {
    await db.query(`UPDATE notifications SET read = true WHERE id = $1 AND user_id = $2`, [id, req.user!.id]);
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: 'DB_ERROR', message: err.message });
  }
});

// PATCH /api/notifications/read-all - Mark all read
notificationsRouter.patch('/read-all', requireAuth, async (req: AuthRequest, res: Response) => {
  const db = getDb();
  try {
    await db.query(`UPDATE notifications SET read = true WHERE user_id = $1`, [req.user!.id]);
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: 'DB_ERROR', message: err.message });
  }
});
