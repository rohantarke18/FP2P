import { Router, Response } from 'express';
import { getDb } from '../db';
import { AuthRequest, requireAuth, requireRole } from '../middleware/auth';

export const problemsRouter = Router();

// Calculate SLA deadline
function calculateDeadline(urgency: string): Date {
  const hoursMap: Record<string, number> = {
    Critical: 24,
    High: 48,
    Medium: 96,
    Low: 168,
  };
  const hours = hoursMap[urgency] || 96;
  return new Date(Date.now() + hours * 60 * 60 * 1000);
}

// 1. POST /api/problems - Citizen file grievance
problemsRouter.post('/', requireAuth, async (req: AuthRequest, res: Response) => {
  const user = req.user!;
  const {
    title,
    description,
    category,
    department,
    address,
    landmark,
    ward,
    city = 'Chhatrapati Sambhajinagar',
    district = 'Chhatrapati Sambhajinagar',
    state = 'Maharashtra',
    pincode = '431001',
    coordinates,
    impactScope = 'My neighbourhood',
    urgency = 'Medium',
    priority = 'Medium',
    priorityScore = 70,
    evidence = [],
    aiAssessment,
    tags = [],
    citizenPhone,
  } = req.body;

  if (!title || !description || !category || !ward || !address) {
    return res.status(400).json({
      error: 'MISSING_REQUIRED_FIELDS',
      message: 'Title, description, category, ward, and address are required.',
    });
  }

  const db = getDb();
  const trackingId = `CIV-2026-${Math.floor(100000 + Math.random() * 900000)}`;
  const deadline = calculateDeadline(urgency);
  const lat = coordinates?.lat || 19.8753;
  const lng = coordinates?.lng || 75.3433;
  const phone = citizenPhone || '';
  const maskedPhone = phone.length >= 6 ? `${phone.slice(0, 3)}****${phone.slice(-2)}` : 'Verified Citizen';

  try {
    const insertRes = await db.query(
      `INSERT INTO problems (
        tracking_id, title, description, category, department_name,
        address, landmark, ward, city, district, state, pincode, lat, lng,
        impact_scope, urgency, priority, priority_score, status, deadline,
        reporter_id, citizen_name, citizen_phone, citizen_phone_masked,
        ai_assessment, tags
      ) VALUES (
        $1, $2, $3, $4, $5,
        $6, $7, $8, $9, $10, $11, $12, $13, $14,
        $15, $16, $17, $18, $19, $20,
        $21, $22, $23, $24,
        $25, $26
      ) RETURNING *`,
      [
        trackingId,
        title,
        description,
        category,
        department || 'Municipal Administration',
        address,
        landmark || '',
        ward,
        city,
        district,
        state,
        pincode,
        lat,
        lng,
        impactScope,
        urgency,
        priority,
        priorityScore,
        'Submitted',
        deadline.toISOString(),
        user.id,
        user.name,
        phone,
        maskedPhone,
        JSON.stringify(aiAssessment || {}),
        tags,
      ]
    );

    const createdProblem = insertRes.rows[0];

    // Record initial timeline event
    await db.query(
      `INSERT INTO problem_updates (
        problem_id, actor_id, actor_name, actor_role, step, title, status, notes
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [
        createdProblem.id,
        user.id,
        user.name,
        'citizen',
        'Grievance Registered',
        'Submitted by Citizen',
        'Submitted',
        'Grievance registered with geographic coordinates and preliminary categorization.',
      ]
    );

    // Save evidence items if any
    if (Array.isArray(evidence) && evidence.length > 0) {
      for (const item of evidence) {
        if (item.url) {
          await db.query(
            `INSERT INTO problem_evidence (
              problem_id, uploaded_by, storage_path, file_name, file_type, file_size, url
            ) VALUES ($1, $2, $3, $4, $5, $6, $7)`,
            [
              createdProblem.id,
              user.id,
              item.url,
              item.name || 'evidence_file',
              item.type || 'image',
              item.size || 0,
              item.url,
            ]
          );
        }
      }
    }

    // Write to audit log
    await db.query(
      `INSERT INTO audit_logs (action, entity_type, entity_id, actor_id, actor_name, actor_role, details)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [
        'COMPLAINT_SUBMITTED',
        'problem',
        trackingId,
        user.id,
        user.name,
        user.role,
        `Grievance ${trackingId} submitted under "${category}" in ${ward}.`,
      ]
    );

    res.status(201).json({ success: true, problem: createdProblem });
  } catch (err: any) {
    console.error('Error creating problem in PostgreSQL:', err);
    res.status(500).json({ error: 'DB_ERROR', message: err.message });
  }
});

// 2. GET /api/problems/my - Citizen complaints
problemsRouter.get('/my', requireAuth, async (req: AuthRequest, res: Response) => {
  const db = getDb();
  try {
    const result = await db.query(
      `SELECT * FROM problems WHERE reporter_id = $1 ORDER BY created_at DESC`,
      [req.user!.id]
    );
    res.json({ success: true, problems: result.rows || [] });
  } catch (err: any) {
    res.status(500).json({ error: 'DB_ERROR', message: err.message });
  }
});

// 3. GET /api/problems/:id - Single problem detail
problemsRouter.get('/:id', requireAuth, async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const user = req.user!;
  const db = getDb();

  try {
    const result = await db.query(
      `SELECT * FROM problems WHERE id = $1 OR tracking_id = $1 LIMIT 1`,
      [id]
    );

    if (!result.rows || result.rows.length === 0) {
      return res.status(404).json({ error: 'NOT_FOUND', message: 'Complaint not found.' });
    }

    const problem = result.rows[0];

    // Check authorization: must be reporter or officer/admin
    const isOwner = problem.reporter_id === user.id;
    const isPrivileged = ['officer', 'department_admin', 'super_admin'].includes(user.role);

    if (!isOwner && !isPrivileged) {
      return res.status(403).json({ error: 'FORBIDDEN', message: 'Unauthorized to view this complaint.' });
    }

    // Fetch timeline updates
    const updatesRes = await db.query(
      `SELECT * FROM problem_updates WHERE problem_id = $1 ORDER BY created_at ASC`,
      [problem.id]
    );

    // Fetch evidence
    const evidenceRes = await db.query(
      `SELECT * FROM problem_evidence WHERE problem_id = $1 ORDER BY created_at ASC`,
      [problem.id]
    );

    // Fetch resolution if available
    const resRes = await db.query(
      `SELECT * FROM resolutions WHERE problem_id = $1 LIMIT 1`,
      [problem.id]
    );

    res.json({
      success: true,
      problem: {
        ...problem,
        timeline: updatesRes.rows || [],
        evidence: evidenceRes.rows || [],
        resolutionEvidence: resRes.rows?.[0] || null,
      },
    });
  } catch (err: any) {
    res.status(500).json({ error: 'DB_ERROR', message: err.message });
  }
});

// 4. PATCH /api/problems/:id/status - Officer status progression
problemsRouter.patch('/:id/status', requireRole(['officer', 'department_admin', 'super_admin']), async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { status, notes, stepTitle } = req.body;
  const user = req.user!;
  const db = getDb();

  const allowedStatuses = [
    'Submitted', 'Under Review', 'Assigned', 'In Progress',
    'Awaiting Information', 'Resolution Submitted', 'Citizen Verification',
    'Resolved', 'Closed', 'Reopened', 'Rejected'
  ];

  if (!allowedStatuses.includes(status)) {
    return res.status(400).json({ error: 'INVALID_STATUS', message: `Invalid status: ${status}` });
  }

  try {
    const probRes = await db.query('SELECT * FROM problems WHERE id = $1 OR tracking_id = $1 LIMIT 1', [id]);
    if (!probRes.rows || probRes.rows.length === 0) {
      return res.status(404).json({ error: 'NOT_FOUND', message: 'Complaint not found.' });
    }
    const problem = probRes.rows[0];

    await db.query(
      `UPDATE problems SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2`,
      [status, problem.id]
    );

    // Record timeline step
    await db.query(
      `INSERT INTO problem_updates (
        problem_id, actor_id, actor_name, actor_role, step, title, status, notes
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [
        problem.id,
        user.id,
        user.name,
        user.role,
        stepTitle || `Status updated to ${status}`,
        `Status changed to ${status}`,
        status,
        notes || '',
      ]
    );

    // Notify citizen
    await db.query(
      `INSERT INTO notifications (user_id, title, message, category, link)
       VALUES ($1, $2, $3, 'complaint', $4)`,
      [
        problem.reporter_id,
        `Status Update: ${problem.tracking_id}`,
        `Your grievance has progressed to "${status}". Notes: ${notes || 'Updated by municipal team.'}`,
        `/problems/${problem.tracking_id}`,
      ]
    );

    // Audit log
    await db.query(
      `INSERT INTO audit_logs (action, entity_type, entity_id, actor_id, actor_name, actor_role, details)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [
        'STATUS_CHANGED',
        'problem',
        problem.tracking_id,
        user.id,
        user.name,
        user.role,
        `Status changed from "${problem.status}" to "${status}". Notes: ${notes || 'None'}`,
      ]
    );

    res.json({ success: true, message: `Status updated to ${status}` });
  } catch (err: any) {
    res.status(500).json({ error: 'DB_ERROR', message: err.message });
  }
});

// 5. POST /api/problems/:id/resolve - Official submit resolution
problemsRouter.post('/:id/resolve', requireRole(['officer', 'department_admin', 'super_admin']), async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { notes, workOrderRef, media = [], completionDate = new Date().toISOString() } = req.body;
  const user = req.user!;
  const db = getDb();

  try {
    const probRes = await db.query('SELECT * FROM problems WHERE id = $1 OR tracking_id = $1 LIMIT 1', [id]);
    if (!probRes.rows || probRes.rows.length === 0) {
      return res.status(404).json({ error: 'NOT_FOUND', message: 'Complaint not found.' });
    }
    const problem = probRes.rows[0];

    // Upsert resolution
    await db.query(
      `INSERT INTO resolutions (
        problem_id, officer_id, officer_name, officer_designation,
        notes, work_order_ref, completion_date, media, verification_status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'pending')
      ON CONFLICT (problem_id) DO UPDATE SET
        notes = EXCLUDED.notes,
        work_order_ref = EXCLUDED.work_order_ref,
        completion_date = EXCLUDED.completion_date,
        media = EXCLUDED.media,
        verification_status = 'pending',
        updated_at = CURRENT_TIMESTAMP`,
      [
        problem.id,
        user.id,
        user.name,
        user.designation || 'Executive Engineer',
        notes,
        workOrderRef || null,
        completionDate,
        JSON.stringify(media),
      ]
    );

    // Update problem status to Citizen Verification
    await db.query(
      `UPDATE problems SET status = 'Citizen Verification', updated_at = CURRENT_TIMESTAMP WHERE id = $1`,
      [problem.id]
    );

    // Timeline event
    await db.query(
      `INSERT INTO problem_updates (
        problem_id, actor_id, actor_name, actor_role, step, title, status, notes
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [
        problem.id,
        user.id,
        user.name,
        user.role,
        'Resolution Submitted',
        'Official Work Completion Evidence Filed',
        'Citizen Verification',
        notes,
      ]
    );

    // Notify citizen to verify
    await db.query(
      `INSERT INTO notifications (user_id, title, message, category, link)
       VALUES ($1, $2, $3, 'complaint', $4)`,
      [
        problem.reporter_id,
        `Verification Required: ${problem.tracking_id}`,
        `Field works are completed. Please inspect and confirm whether the issue is resolved.`,
        `/problems/${problem.tracking_id}`,
      ]
    );

    res.json({ success: true, message: 'Resolution submitted for citizen verification.' });
  } catch (err: any) {
    res.status(500).json({ error: 'DB_ERROR', message: err.message });
  }
});

// 6. POST /api/problems/:id/verify - Citizen verify resolution
problemsRouter.post('/:id/verify', requireAuth, async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { satisfactionRating = 5, feedbackNotes = '' } = req.body;
  const user = req.user!;
  const db = getDb();

  try {
    const probRes = await db.query('SELECT * FROM problems WHERE id = $1 OR tracking_id = $1 LIMIT 1', [id]);
    if (!probRes.rows || probRes.rows.length === 0) {
      return res.status(404).json({ error: 'NOT_FOUND', message: 'Complaint not found.' });
    }
    const problem = probRes.rows[0];

    if (problem.reporter_id !== user.id && user.role !== 'super_admin') {
      return res.status(403).json({ error: 'FORBIDDEN', message: 'Only the citizen who filed this complaint can verify resolution.' });
    }

    await db.query(
      `UPDATE resolutions 
       SET verification_status = 'verified',
           verified_at = CURRENT_TIMESTAMP,
           feedback_notes = $1,
           satisfaction_rating = $2,
           updated_at = CURRENT_TIMESTAMP
       WHERE problem_id = $3`,
      [feedbackNotes, satisfactionRating, problem.id]
    );

    await db.query(
      `UPDATE problems SET status = 'Resolved', updated_at = CURRENT_TIMESTAMP WHERE id = $1`,
      [problem.id]
    );

    await db.query(
      `INSERT INTO problem_updates (
        problem_id, actor_id, actor_name, actor_role, step, title, status, notes
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [
        problem.id,
        user.id,
        user.name,
        'citizen',
        'Citizen Verified & Closed',
        'Resolution Confirmed by Citizen',
        'Resolved',
        `Rating: ${satisfactionRating}/5. Feedback: ${feedbackNotes || 'Resolved satisfactorily.'}`,
      ]
    );

    res.json({ success: true, message: 'Resolution verified. Complaint closed as Resolved.' });
  } catch (err: any) {
    res.status(500).json({ error: 'DB_ERROR', message: err.message });
  }
});

// 7. POST /api/problems/:id/dispute - Citizen dispute and reopen
problemsRouter.post('/:id/dispute', requireAuth, async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { disputeReason } = req.body;
  const user = req.user!;
  const db = getDb();

  if (!disputeReason) {
    return res.status(400).json({ error: 'REASON_REQUIRED', message: 'Dispute reason is required.' });
  }

  try {
    const probRes = await db.query('SELECT * FROM problems WHERE id = $1 OR tracking_id = $1 LIMIT 1', [id]);
    if (!probRes.rows || probRes.rows.length === 0) {
      return res.status(404).json({ error: 'NOT_FOUND', message: 'Complaint not found.' });
    }
    const problem = probRes.rows[0];

    if (problem.reporter_id !== user.id && user.role !== 'super_admin') {
      return res.status(403).json({ error: 'FORBIDDEN', message: 'Only the citizen who filed this complaint can dispute.' });
    }

    await db.query(
      `UPDATE resolutions 
       SET verification_status = 'disputed',
           dispute_reason = $1,
           updated_at = CURRENT_TIMESTAMP
       WHERE problem_id = $2`,
      [disputeReason, problem.id]
    );

    await db.query(
      `UPDATE problems SET status = 'Reopened', updated_at = CURRENT_TIMESTAMP WHERE id = $1`,
      [problem.id]
    );

    await db.query(
      `INSERT INTO problem_updates (
        problem_id, actor_id, actor_name, actor_role, step, title, status, notes
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [
        problem.id,
        user.id,
        user.name,
        'citizen',
        'Citizen Disputed Resolution',
        'Case Reopened for Municipal Review',
        'Reopened',
        disputeReason,
      ]
    );

    res.json({ success: true, message: 'Grievance reopened for municipal re-inspection.' });
  } catch (err: any) {
    res.status(500).json({ error: 'DB_ERROR', message: err.message });
  }
});
