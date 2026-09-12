export interface AuditLogEntry {
  id: string;
  action:
    | 'OFFICER_ASSIGNED'
    | 'STATUS_CHANGED'
    | 'ROLE_PROVISIONED'
    | 'RESOLUTION_SUBMITTED'
    | 'CASE_REOPENED'
    | 'CASE_RESOLVED'
    | 'INNOVATION_EVALUATED'
    | 'CONSULTATION_CREATED'
    | 'ADMIN_CONFIG_UPDATED'
    | 'COMPLAINT_SUBMITTED';
  entityType: 'problem' | 'user' | 'innovation' | 'consultation' | 'system';
  entityId: string;
  performedBy: {
    uid: string;
    name: string;
    role: string;
  };
  details: string;
  timestamp: string;
}

export const auditLogService = {
  /**
   * Client-side logging helper (audit logs are also written automatically by backend controllers)
   */
  async logAction(
    _action: AuditLogEntry['action'],
    _entityType: AuditLogEntry['entityType'],
    _entityId: string,
    _details: string,
    _actorOverride?: { uid: string; name: string; role: string }
  ): Promise<void> {
    // Actions are automatically persisted to PostgreSQL audit_logs table via backend API controllers.
  },

  /**
   * Retrieve recent audit records from PostgreSQL for authorized administrators
   */
  async getRecentLogs(_maxCount = 50): Promise<AuditLogEntry[]> {
    try {
      const res = await fetch('/api/admin/audit-logs', { credentials: 'include' });
      if (!res.ok) return [];
      const data = await res.json();
      return (data.logs || []).map((l: any) => ({
        id: l.id,
        action: l.action,
        entityType: l.entity_type,
        entityId: l.entity_id,
        performedBy: {
          uid: l.actor_id || '',
          name: l.actor_name || 'Authorized Official',
          role: l.actor_role || 'official',
        },
        details: l.details || '',
        timestamp: l.created_at || new Date().toISOString(),
      }));
    } catch (err) {
      console.warn('Audit logs query notice:', err);
      return [];
    }
  },
};
