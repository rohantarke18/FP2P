import { Router, Response } from 'express';
import { getDb } from '../db';
import { AuthRequest, requireAuth, requireRole } from '../middleware/auth';

export const consultationsRouter = Router();

// 1. GET /api/consultations - List all policy consultations
consultationsRouter.get('/', async (_req: AuthRequest, res: Response) => {
  const db = getDb();
  try {
    const result = await db.query(`SELECT * FROM consultations ORDER BY created_at DESC`);
    res.json({ success: true, consultations: result.rows || [] });
  } catch (err: any) {
    res.status(500).json({ error: 'DB_ERROR', message: err.message });
  }
});

// 2. GET /api/consultations/:id - Get single consultation
consultationsRouter.get('/:id', async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const db = getDb();
  const userId = req.user?.id;

  try {
    const result = await db.query(`SELECT * FROM consultations WHERE id = $1 OR code = $1 LIMIT 1`, [id]);
    if (!result.rows || result.rows.length === 0) {
      return res.status(404).json({ error: 'NOT_FOUND', message: 'Consultation not found.' });
    }

    const consultation = result.rows[0];

    // Check if current user has already responded
    let hasUserResponded = false;
    let userResponse = null;
    if (userId) {
      const respRes = await db.query(
        `SELECT responses, feedback, created_at FROM consultation_responses WHERE consultation_id = $1 AND user_id = $2 LIMIT 1`,
        [consultation.id, userId]
      );
      if (respRes.rows && respRes.rows.length > 0) {
        hasUserResponded = true;
        userResponse = respRes.rows[0];
      }
    }

    res.json({
      success: true,
      consultation: {
        ...consultation,
        hasUserResponded,
        userResponse,
      },
    });
  } catch (err: any) {
    res.status(500).json({ error: 'DB_ERROR', message: err.message });
  }
});

// 3. POST /api/consultations/:id/respond - Citizen submit response
consultationsRouter.post('/:id/respond', requireAuth, async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { feedback } = req.body;
  const responses = req.body.responses || req.body.answers;
  const user = req.user!;
  const db = getDb();

  if (!responses || typeof responses !== 'object') {
    return res.status(400).json({ error: 'INVALID_DATA', message: 'Responses or answers object is required.' });
  }

  try {
    const cRes = await db.query(`SELECT * FROM consultations WHERE id = $1 OR code = $1 LIMIT 1`, [id]);
    if (!cRes.rows || cRes.rows.length === 0) {
      return res.status(404).json({ error: 'NOT_FOUND', message: 'Consultation not found.' });
    }
    const consultation = cRes.rows[0];

    // Insert response with unique constraint
    await db.query(
      `INSERT INTO consultation_responses (consultation_id, user_id, responses, feedback)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (consultation_id, user_id) DO UPDATE SET
         responses = EXCLUDED.responses,
         feedback = EXCLUDED.feedback,
         created_at = CURRENT_TIMESTAMP`,
      [consultation.id, user.id, JSON.stringify(responses), feedback || null]
    );

    // Increment count
    await db.query(`UPDATE consultations SET total_responses = total_responses + 1 WHERE id = $1`, [consultation.id]);

    res.json({ success: true, message: 'Your feedback has been officially registered.' });
  } catch (err: any) {
    res.status(500).json({ error: 'DB_ERROR', message: err.message });
  }
});

// 4. POST /api/consultations - Admin create consultation
consultationsRouter.post('/', requireRole(['department_admin', 'super_admin']), async (req: AuthRequest, res: Response) => {
  const { title, departmentName, topic, summary, deadline, questions = [] } = req.body;
  const user = req.user!;
  const db = getDb();

  if (!title || !topic || !summary || !deadline) {
    return res.status(400).json({ error: 'MISSING_FIELDS', message: 'Title, topic, summary, and deadline are required.' });
  }

  const code = `POL-2026-${Math.floor(10 + Math.random() * 90)}`;

  try {
    const insertRes = await db.query(
      `INSERT INTO consultations (
        code, title, department_name, topic, summary, status, deadline, questions, created_by
      ) VALUES ($1, $2, $3, $4, $5, 'Active', $6, $7, $8)
      RETURNING *`,
      [code, title, departmentName || 'Town Planning & Traffic Engineering', topic, summary, deadline, JSON.stringify(questions), user.id]
    );

    res.status(201).json({ success: true, consultation: insertRes.rows[0] });
  } catch (err: any) {
    res.status(500).json({ error: 'DB_ERROR', message: err.message });
  }
});
