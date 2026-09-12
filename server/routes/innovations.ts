import { Router, Response } from 'express';
import { getDb } from '../db';
import { AuthRequest, requireAuth, requireRole } from '../middleware/auth';

export const innovationsRouter = Router();

// 1. GET /api/innovations - List innovations with vote status for authenticated user
innovationsRouter.get('/', async (req: AuthRequest, res: Response) => {
  const db = getDb();
  const userId = req.user?.id;

  try {
    const result = await db.query(
      `SELECT * FROM innovations ORDER BY created_at DESC`
    );

    const innovations = result.rows || [];

    // Check user votes if logged in
    let userVotedIds = new Set<string>();
    if (userId) {
      const votesRes = await db.query(`SELECT innovation_id FROM innovation_votes WHERE user_id = $1`, [userId]);
      if (votesRes.rows) {
        userVotedIds = new Set(votesRes.rows.map((v) => v.innovation_id));
      }
    }

    const enriched = innovations.map((inv) => ({
      ...inv,
      hasUserVoted: userVotedIds.has(inv.id),
      votes: inv.votes_count || 0,
    }));

    res.json({ success: true, innovations: enriched });
  } catch (err: any) {
    res.status(500).json({ error: 'DB_ERROR', message: err.message });
  }
});

// 2. GET /api/innovations/:id - Single innovation with reviews & comments
innovationsRouter.get('/:id', async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const db = getDb();
  const userId = req.user?.id;

  try {
    const invRes = await db.query(
      `SELECT * FROM innovations WHERE id = $1 OR tracking_id = $1 LIMIT 1`,
      [id]
    );

    if (!invRes.rows || invRes.rows.length === 0) {
      return res.status(404).json({ error: 'NOT_FOUND', message: 'Innovation not found.' });
    }

    const innovation = invRes.rows[0];

    // Reviews
    const revRes = await db.query(
      `SELECT * FROM innovation_reviews WHERE innovation_id = $1 ORDER BY created_at DESC`,
      [innovation.id]
    );

    // Has user voted?
    let hasUserVoted = false;
    if (userId) {
      const voteCheck = await db.query(
        `SELECT id FROM innovation_votes WHERE innovation_id = $1 AND user_id = $2 LIMIT 1`,
        [innovation.id, userId]
      );
      hasUserVoted = !!(voteCheck.rows && voteCheck.rows.length > 0);
    }

    res.json({
      success: true,
      innovation: {
        ...innovation,
        votes: innovation.votes_count || 0,
        hasUserVoted,
        reviews: revRes.rows || [],
      },
    });
  } catch (err: any) {
    res.status(500).json({ error: 'DB_ERROR', message: err.message });
  }
});

// 3. POST /api/innovations - Citizen submit innovation
innovationsRouter.post('/', requireAuth, async (req: AuthRequest, res: Response) => {
  const user = req.user!;
  const {
    title,
    description,
    problemStatement,
    proposedSolution,
    category,
    targetWard,
    budgetEstimate,
    impactProjection,
    timelineEstimate,
    attachments = [],
  } = req.body;

  if (!title || !description || !problemStatement || !proposedSolution || !category) {
    return res.status(400).json({
      error: 'MISSING_FIELDS',
      message: 'Title, description, problem statement, proposed solution, and category are required.',
    });
  }

  const db = getDb();
  const trackingId = `INN-2026-${Math.floor(100 + Math.random() * 900)}`;

  try {
    const insertRes = await db.query(
      `INSERT INTO innovations (
        tracking_id, title, description, problem_statement, proposed_solution,
        category, target_ward, stage, budget_estimate, impact_projection, timeline_estimate,
        submitter_id, submitter_name, submitter_email, attachments
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, 'Submitted', $8, $9, $10, $11, $12, $13, $14)
      RETURNING *`,
      [
        trackingId,
        title,
        description,
        problemStatement,
        proposedSolution,
        category,
        targetWard || 'Ward 8 (CIDCO)',
        budgetEstimate || 'To be appraised',
        impactProjection || 'Community wide',
        timelineEstimate || '3-6 months',
        user.id,
        user.name,
        user.email,
        JSON.stringify(attachments),
      ]
    );

    // Audit log
    await db.query(
      `INSERT INTO audit_logs (action, entity_type, entity_id, actor_id, actor_name, actor_role, details)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [
        'INNOVATION_SUBMITTED',
        'innovation',
        trackingId,
        user.id,
        user.name,
        user.role,
        `Innovation proposal "${title}" submitted under category ${category}.`,
      ]
    );

    res.status(201).json({ success: true, innovation: insertRes.rows[0] });
  } catch (err: any) {
    res.status(500).json({ error: 'DB_ERROR', message: err.message });
  }
});

// 4. POST /api/innovations/:id/vote - 1-user = 1-vote toggle
innovationsRouter.post('/:id/vote', requireAuth, async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const user = req.user!;
  const db = getDb();

  try {
    const invRes = await db.query(`SELECT * FROM innovations WHERE id = $1 OR tracking_id = $1 LIMIT 1`, [id]);
    if (!invRes.rows || invRes.rows.length === 0) {
      return res.status(404).json({ error: 'NOT_FOUND', message: 'Innovation not found.' });
    }
    const innovation = invRes.rows[0];

    // Check if vote exists
    const existing = await db.query(
      `SELECT id FROM innovation_votes WHERE innovation_id = $1 AND user_id = $2`,
      [innovation.id, user.id]
    );

    if (existing.rows && existing.rows.length > 0) {
      // Remove vote
      await db.query(`DELETE FROM innovation_votes WHERE innovation_id = $1 AND user_id = $2`, [innovation.id, user.id]);
      await db.query(`UPDATE innovations SET votes_count = GREATEST(0, votes_count - 1) WHERE id = $1`, [innovation.id]);
      return res.json({ success: true, voted: false, message: 'Vote removed.' });
    } else {
      // Add vote
      await db.query(
        `INSERT INTO innovation_votes (innovation_id, user_id) VALUES ($1, $2)
         ON CONFLICT (innovation_id, user_id) DO NOTHING`,
        [innovation.id, user.id]
      );
      await db.query(`UPDATE innovations SET votes_count = votes_count + 1 WHERE id = $1`, [innovation.id]);
      return res.json({ success: true, voted: true, message: 'Vote registered.' });
    }
  } catch (err: any) {
    res.status(500).json({ error: 'DB_ERROR', message: err.message });
  }
});

// 5. POST /api/innovations/:id/review - Expert evaluation
innovationsRouter.post('/:id/review', requireRole(['expert', 'super_admin', 'department_admin']), async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { score, comments, stageRecommendation } = req.body;
  const user = req.user!;
  const db = getDb();

  if (score === undefined || !comments) {
    return res.status(400).json({ error: 'MISSING_FIELDS', message: 'Score and appraisal comments are required.' });
  }

  try {
    const invRes = await db.query(`SELECT * FROM innovations WHERE id = $1 OR tracking_id = $1 LIMIT 1`, [id]);
    if (!invRes.rows || invRes.rows.length === 0) {
      return res.status(404).json({ error: 'NOT_FOUND', message: 'Innovation not found.' });
    }
    const innovation = invRes.rows[0];

    await db.query(
      `INSERT INTO innovation_reviews (
        innovation_id, expert_id, expert_name, expert_designation, score, comments, stage_recommendation
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [
        innovation.id,
        user.id,
        user.name,
        user.designation || 'Civic Innovation Evaluator',
        score,
        comments,
        stageRecommendation || 'Shortlisted',
      ]
    );

    if (stageRecommendation) {
      await db.query(`UPDATE innovations SET stage = $1, feasibility_score = $2 WHERE id = $3`, [
        stageRecommendation,
        score,
        innovation.id,
      ]);
    }

    res.json({ success: true, message: 'Expert evaluation recorded.' });
  } catch (err: any) {
    res.status(500).json({ error: 'DB_ERROR', message: err.message });
  }
});
