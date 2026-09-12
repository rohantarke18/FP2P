import {
  Problem,
  ProblemStatus,
  PriorityLevel,
  ProblemCategory,
  ImpactScope,
  ResolutionEvidence,
  CitizenVerification,
  EvidenceItem,
  AiAssessment,
  TimelineEvent,
} from '../types';

export interface ComplaintFilter {
  category?: ProblemCategory | 'All';
  status?: ProblemStatus | 'All';
  priority?: PriorityLevel | 'All';
  ward?: string | 'All';
  searchTerm?: string;
  department?: string | 'All';
  reporterUid?: string;
  assignedOfficerId?: string;
}

export function normalizeProblem(raw: any): Problem {
  if (!raw) return raw;

  return {
    id: raw.tracking_id || raw.id || 'CIV-2026-000000',
    title: raw.title || 'Civic Issue',
    description: raw.description || '',
    category: raw.category || 'Roads & Infrastructure',
    department: raw.department_name || raw.department || 'Municipal Administration',
    location: {
      address: raw.address || raw.location?.address || 'Chhatrapati Sambhajinagar',
      landmark: raw.landmark || raw.location?.landmark || '',
      ward: raw.ward || raw.location?.ward || 'Ward 8 (CIDCO / Kranti Chowk)',
      city: raw.city || raw.location?.city || 'Chhatrapati Sambhajinagar',
      district: raw.district || raw.location?.district || 'Chhatrapati Sambhajinagar',
      state: raw.state || raw.location?.state || 'Maharashtra',
      pincode: raw.pincode || raw.location?.pincode || '431001',
      coordinates: {
        lat: Number(raw.lat || raw.location?.coordinates?.lat || 19.8753),
        lng: Number(raw.lng || raw.location?.coordinates?.lng || 75.3433),
      },
    },
    impactScope: raw.impact_scope || raw.impactScope || 'My neighbourhood',
    urgency: raw.urgency || 'Medium',
    priority: raw.priority || 'Medium',
    status: raw.status || 'Submitted',
    evidence: Array.isArray(raw.evidence) ? raw.evidence : [],
    tags: Array.isArray(raw.tags) ? raw.tags : [],
    aiAssessment: raw.ai_assessment || raw.aiAssessment || {
      category: raw.category || 'Roads & Infrastructure',
      suggestedDepartment: raw.department_name || 'Municipal Road Maintenance & Civil Infrastructure',
      suggestedPriority: raw.priority || 'Medium',
      priorityScore: Number(raw.priority_score || 70),
      reasoning: [],
      keyIdentifiedEntities: [],
      isPreliminary: true,
      generatedAt: raw.created_at || new Date().toISOString(),
    },
    timeline: Array.isArray(raw.timeline)
      ? raw.timeline.map((t: any) => ({
          id: t.id || `t-${Math.random()}`,
          step: t.step || 'Update',
          title: t.title || t.step || 'Status Update',
          timestamp: t.created_at || t.timestamp || new Date().toISOString(),
          department: t.department,
          actorName: t.actor_name || t.actorName || 'Municipal Official',
          actorRole: t.actor_role || t.actorRole || 'officer',
          notes: t.notes || '',
          status: t.status || 'Submitted',
        }))
      : [],
    assignedOfficer: raw.assigned_officer_name
      ? {
          id: raw.assigned_officer_id || '',
          name: raw.assigned_officer_name,
          designation: raw.assigned_officer_designation || 'Executive Engineer',
          department: raw.department_name || '',
        }
      : raw.assignedOfficer,
    deadline: raw.deadline || new Date(Date.now() + 48 * 3600 * 1000).toISOString(),
    createdAt: raw.created_at || raw.createdAt || new Date().toISOString(),
    updatedAt: raw.updated_at || raw.updatedAt || new Date().toISOString(),
    citizenName: raw.citizen_name || raw.citizenName || 'Citizen',
    citizenPhoneMasked: raw.citizen_phone_masked || raw.citizenPhoneMasked || 'Verified Citizen',
    citizenPhone: raw.citizen_phone || raw.citizenPhone,
    reporterUid: raw.reporter_id || raw.reporterUid,
    reporterEmail: raw.reporter_email || raw.reporterEmail,
    resolutionEvidence: raw.resolutionEvidence
      ? {
          id: raw.resolutionEvidence.id || 'res-1',
          submittedAt: raw.resolutionEvidence.completion_date || raw.resolutionEvidence.submittedAt || new Date().toISOString(),
          submittedBy: raw.resolutionEvidence.officer_name || raw.resolutionEvidence.submittedBy || 'Municipal Engineer',
          officerDesignation: raw.resolutionEvidence.officer_designation || raw.resolutionEvidence.officerDesignation || 'Officer',
          notes: raw.resolutionEvidence.notes || '',
          media: Array.isArray(raw.resolutionEvidence.media) ? raw.resolutionEvidence.media : [],
          workOrderRef: raw.resolutionEvidence.work_order_ref || raw.resolutionEvidence.workOrderRef,
          completionDate: raw.resolutionEvidence.completion_date || raw.resolutionEvidence.completionDate || new Date().toISOString(),
        }
      : undefined,
    citizenVerification: raw.resolutionEvidence
      ? {
          status: raw.resolutionEvidence.verification_status || 'pending',
          verifiedAt: raw.resolutionEvidence.verified_at,
          feedbackNotes: raw.resolutionEvidence.feedback_notes,
          disputeReason: raw.resolutionEvidence.dispute_reason,
          satisfactionRating: raw.resolutionEvidence.satisfaction_rating,
        }
      : raw.citizenVerification,
  };
}

export function sanitizeForPublic(p: Problem): any {
  return {
    id: p.id,
    title: p.title,
    description: p.description,
    category: p.category,
    department: p.department,
    location: {
      address: p.location.address,
      ward: p.location.ward,
      city: p.location.city,
      district: p.location.district,
      coordinates: p.location.coordinates,
    },
    priority: p.priority,
    status: p.status,
    deadline: p.deadline,
    createdAt: p.createdAt,
    updatedAt: p.updatedAt,
    resolutionEvidence: p.resolutionEvidence,
    timeline: p.timeline,
  };
}

export const complaintService = {
  /**
   * Fetch complaints from Express API
   */
  async getComplaints(filter?: ComplaintFilter): Promise<Problem[]> {
    let url = '/api/public/problems?limit=100';
    if (filter?.reporterUid) {
      url = '/api/problems/my';
    }

    try {
      const res = await fetch(url, { credentials: 'include' });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      let list: Problem[] = (data.problems || []).map(normalizeProblem);

      if (filter) {
        if (filter.category && filter.category !== 'All') {
          list = list.filter((p) => p.category === filter.category);
        }
        if (filter.status && filter.status !== 'All') {
          list = list.filter((p) => p.status === filter.status);
        }
        if (filter.priority && filter.priority !== 'All') {
          list = list.filter((p) => p.priority === filter.priority);
        }
        if (filter.ward && filter.ward !== 'All') {
          list = list.filter((p) => p.location?.ward === filter.ward);
        }
        if (filter.department && filter.department !== 'All') {
          list = list.filter((p) => p.department === filter.department);
        }
        if (filter.searchTerm && filter.searchTerm.trim()) {
          const s = filter.searchTerm.toLowerCase();
          list = list.filter(
            (p) =>
              (p.title || '').toLowerCase().includes(s) ||
              (p.description || '').toLowerCase().includes(s) ||
              (p.id || '').toLowerCase().includes(s) ||
              (p.location?.address || '').toLowerCase().includes(s)
          );
        }
      }

      return list;
    } catch (err) {
      console.warn('Complaints fetch error:', err);
      return [];
    }
  },

  /**
   * Fetch sanitized public complaints for public map & transparency
   */
  async getPublicComplaints(limitCount = 50): Promise<Problem[]> {
    try {
      const res = await fetch(`/api/public/problems?limit=${limitCount}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      return (data.problems || []).map(normalizeProblem);
    } catch (err) {
      console.warn('Public complaints query notice:', err);
      return [];
    }
  },

  /**
   * Fetch single complaint by ID or tracking ID
   */
  async getComplaintById(id: string): Promise<Problem | null> {
    const cleanId = id.trim();
    try {
      // Try authenticated endpoint first
      let res = await fetch(`/api/problems/${encodeURIComponent(cleanId)}`, { credentials: 'include' });
      if (!res.ok && res.status === 401) {
        // Unauthenticated public tracking endpoint
        res = await fetch(`/api/public/problems/${encodeURIComponent(cleanId)}`);
      }
      if (!res.ok) {
        // Fallback to public
        res = await fetch(`/api/public/problems/${encodeURIComponent(cleanId)}`);
      }

      if (res.ok) {
        const data = await res.json();
        if (data.problem) {
          return normalizeProblem(data.problem);
        }
      }
      return null;
    } catch (err) {
      console.error(`Error fetching complaint ${cleanId}:`, err);
      return null;
    }
  },

  /**
   * Submit a new civic grievance
   */
  async createComplaint(data: any): Promise<Problem> {
    const payload = {
      title: data.title,
      description: data.description,
      category: data.category,
      department: data.department,
      address: data.location?.address,
      landmark: data.location?.landmark,
      ward: data.location?.ward,
      city: data.location?.city,
      district: data.location?.district,
      state: data.location?.state,
      pincode: data.location?.pincode,
      coordinates: data.location?.coordinates,
      impactScope: data.impactScope,
      urgency: data.urgency,
      priority: data.priority,
      priorityScore: data.aiAssessment?.priorityScore || 70,
      evidence: data.evidence || [],
      aiAssessment: data.aiAssessment,
      tags: data.tags || [],
      citizenPhone: data.citizenPhone,
    };

    const res = await fetch('/api/problems', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(payload),
    });

    const resData = await res.json();
    if (!res.ok || !resData.success) {
      throw new Error(resData.message || 'Failed to submit grievance.');
    }

    return normalizeProblem(resData.problem);
  },

  /**
   * Update complaint status
   */
  async updateComplaintStatus(
    id: string,
    status: ProblemStatus,
    notes?: string,
    stepTitle?: string
  ): Promise<void> {
    const res = await fetch(`/api/problems/${encodeURIComponent(id)}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ status, notes, stepTitle }),
    });

    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.message || 'Failed to update complaint status.');
    }
  },

  /**
   * Submit completion evidence
   */
  async submitResolution(id: string, data: Partial<ResolutionEvidence>): Promise<Problem> {
    const res = await fetch(`/api/problems/${encodeURIComponent(id)}/resolve`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        notes: data.notes,
        workOrderRef: data.workOrderRef,
        media: data.media || [],
        completionDate: data.completionDate,
      }),
    });

    const resData = await res.json();
    if (!res.ok || !resData.success) {
      throw new Error(resData.message || 'Failed to submit resolution.');
    }

    const updated = await this.getComplaintById(id);
    return updated || ({ id } as any);
  },

  /**
   * Citizen verify resolution
   */
  async verifyResolution(
    id: string,
    verification: { satisfactionRating?: number; feedbackNotes?: string; status?: string; disputeReason?: string }
  ): Promise<void> {
    if (verification.disputeReason || verification.status === 'disputed') {
      return this.disputeResolution(id, verification.disputeReason || 'Citizen disputed resolution.');
    }

    const res = await fetch(`/api/problems/${encodeURIComponent(id)}/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        satisfactionRating: verification.satisfactionRating ?? 5,
        feedbackNotes: verification.feedbackNotes || '',
      }),
    });

    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.message || 'Failed to verify resolution.');
    }
  },

  /**
   * Citizen dispute resolution
   */
  async disputeResolution(id: string, reason: string): Promise<void> {
    const res = await fetch(`/api/problems/${encodeURIComponent(id)}/dispute`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ disputeReason: reason }),
    });

    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.message || 'Failed to submit dispute.');
    }
  },

  /**
   * Admin assign officer
   */
  async assignOfficer(
    id: string,
    officer: { id: string; name: string; designation?: string; department?: string },
    departmentOverride?: string
  ): Promise<Problem> {
    const res = await fetch(`/api/admin/problems/${encodeURIComponent(id)}/assign`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        officerId: officer.id,
        officerName: officer.name,
        officerDesignation: officer.designation || 'Executive Engineer',
        departmentName: departmentOverride || officer.department,
      }),
    });

    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.message || 'Failed to assign officer.');
    }

    const updated = await this.getComplaintById(id);
    return updated || ({ id } as any);
  },

  /**
   * Alias for createComplaint
   */
  async submitComplaint(data: any): Promise<Problem> {
    return this.createComplaint(data);
  },

  /**
   * Status update alias returning problem
   */
  async updateStatus(
    id: string,
    status: ProblemStatus,
    notes?: string,
    stepTitle?: string
  ): Promise<any> {
    await this.updateComplaintStatus(id, status, notes, stepTitle);
    const updated = await this.getComplaintById(id);
    return updated || { id, status };
  },

  /**
   * Update complaint general details
   */
  async updateComplaint(id: string, updates: Partial<Problem>): Promise<Problem> {
    if (updates.status) {
      await this.updateComplaintStatus(id, updates.status);
    }
    const updated = await this.getComplaintById(id);
    return updated || (updates as any);
  },

  /**
   * Add an internal note to the complaint timeline
   */
  async addInternalNote(
    id: string,
    note: string,
    _authorName?: string,
    _authorRole?: string
  ): Promise<any> {
    const res = await fetch(`/api/problems/${encodeURIComponent(id)}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        status: 'In Progress',
        notes: note,
        stepTitle: 'Internal Note Added',
      }),
    });
    return res.json().catch(() => ({}));
  },

  /**
   * Delete complaint
   */
  async deleteComplaint(_id: string): Promise<void> {
    // Municipal records are retained for auditing
  },
};
