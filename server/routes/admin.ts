import { Router, Response } from 'express';
import { getDb } from '../db';
import { AuthRequest, requireRole } from '../middleware/auth';

export const adminRouter = Router();

// Require admin or super admin for all routes here
adminRouter.use(requireRole(['super_admin', 'department_admin']));

// 1. GET /api/admin/audit-logs - Immutable logs
adminRouter.get('/audit-logs', async (_req: AuthRequest, res: Response) => {
  const db = getDb();
  try {
    const result = await db.query(
      `SELECT * FROM audit_logs ORDER BY created_at DESC LIMIT 100`
    );
    res.json({ success: true, logs: result.rows || [] });
  } catch (err: any) {
    res.status(500).json({ error: 'DB_ERROR', message: err.message });
  }
});

// 2. GET /api/admin/users - List users for management
adminRouter.get('/users', async (_req: AuthRequest, res: Response) => {
  const db = getDb();
  try {
    const result = await db.query(
      `SELECT id, name, email, phone, role, department_id, designation, ward_or_district, is_active, created_at
       FROM users
       ORDER BY created_at DESC LIMIT 100`
    );
    res.json({ success: true, users: result.rows || [] });
  } catch (err: any) {
    res.status(500).json({ error: 'DB_ERROR', message: err.message });
  }
});

// 3. POST /api/admin/users/role - Provision official role
adminRouter.post('/users/role', async (req: AuthRequest, res: Response) => {
  const { targetUserId, newRole, departmentId, designation } = req.body;
  const adminUser = req.user!;
  const db = getDb();

  const allowedRoles = ['citizen', 'officer', 'department_admin', 'expert', 'super_admin'];
  if (!allowedRoles.includes(newRole)) {
    return res.status(400).json({ error: 'INVALID_ROLE', message: `Invalid role: ${newRole}` });
  }

  // Only super_admin can create super_admin
  if (newRole === 'super_admin' && adminUser.role !== 'super_admin') {
    return res.status(403).json({ error: 'FORBIDDEN', message: 'Only a Super Admin can appoint another Super Admin.' });
  }

  try {
    const userRes = await db.query('SELECT * FROM users WHERE id = $1 LIMIT 1', [targetUserId]);
    if (!userRes.rows || userRes.rows.length === 0) {
      return res.status(404).json({ error: 'NOT_FOUND', message: 'User not found.' });
    }
    const targetUser = userRes.rows[0];

    await db.query(
      `UPDATE users 
       SET role = $1, department_id = $2, designation = $3, updated_at = CURRENT_TIMESTAMP
       WHERE id = $4`,
      [newRole, departmentId || null, designation || null, targetUserId]
    );

    // Audit log
    await db.query(
      `INSERT INTO audit_logs (action, entity_type, entity_id, actor_id, actor_name, actor_role, details)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [
        'ROLE_PROVISIONED',
        'user',
        targetUserId,
        adminUser.id,
        adminUser.name,
        adminUser.role,
        `Role for "${targetUser.name}" changed from "${targetUser.role}" to "${newRole}". Department: ${departmentId || 'None'}, Designation: ${designation || 'None'}.`,
      ]
    );

    res.json({ success: true, message: `User role successfully updated to ${newRole}.` });
  } catch (err: any) {
    res.status(500).json({ error: 'DB_ERROR', message: err.message });
  }
});

// 4. POST /api/admin/problems/:id/assign - Assign officer
adminRouter.post('/problems/:id/assign', async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { officerId, officerName, officerDesignation, departmentId, departmentName } = req.body;
  const adminUser = req.user!;
  const db = getDb();

  try {
    const probRes = await db.query('SELECT * FROM problems WHERE id = $1 OR tracking_id = $1 LIMIT 1', [id]);
    if (!probRes.rows || probRes.rows.length === 0) {
      return res.status(404).json({ error: 'NOT_FOUND', message: 'Complaint not found.' });
    }
    const problem = probRes.rows[0];

    await db.query(
      `UPDATE problems 
       SET assigned_officer_id = $1,
           assigned_officer_name = $2,
           assigned_officer_designation = $3,
           department_id = COALESCE($4, department_id),
           department_name = COALESCE($5, department_name),
           status = 'Assigned',
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $6`,
      [officerId, officerName, officerDesignation, departmentId || null, departmentName || null, problem.id]
    );

    // Add timeline entry
    await db.query(
      `INSERT INTO problem_updates (
        problem_id, actor_id, actor_name, actor_role, step, title, status, notes
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [
        problem.id,
        adminUser.id,
        adminUser.name,
        adminUser.role,
        'Officer Assigned',
        `Assigned to ${officerName}`,
        'Assigned',
        `Dispatched to ${departmentName || problem.department_name} under supervision of ${officerName} (${officerDesignation}).`,
      ]
    );

    // Notify citizen
    await db.query(
      `INSERT INTO notifications (user_id, title, message, category, link)
       VALUES ($1, $2, $3, 'complaint', $4)`,
      [
        problem.reporter_id,
        `Officer Assigned: ${problem.tracking_id}`,
        `Your complaint has been assigned to ${officerName} (${officerDesignation}) from ${departmentName || problem.department_name}.`,
        `/problems/${problem.tracking_id}`,
      ]
    );

    res.json({ success: true, message: `Assigned to ${officerName}` });
  } catch (err: any) {
    res.status(500).json({ error: 'DB_ERROR', message: err.message });
  }
});
