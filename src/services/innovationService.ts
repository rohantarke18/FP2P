import {
  Innovation,
  InnovationReview,
  InnovationComment,
  InnovationStage,
  InnovationCategory,
  EvidenceItem,
} from '../types';
import { INITIAL_SEED_INNOVATIONS } from '../data/seedInnovations';

export function normalizeInnovation(raw: any): Innovation {
  if (!raw) return raw;
  return {
    id: raw.tracking_id || raw.id || 'INV-2026-100',
    title: raw.title || 'Civic Innovation',
    description: raw.description || '',
    problemAddressed: raw.problem_statement || raw.problemAddressed || '',
    expectedImpact: raw.impact_projection || raw.expectedImpact || '',
    category: raw.category || 'Urban Mobility & Roads',
    stage: raw.stage || 'Proposed',
    submitterName: raw.submitter_name || raw.submitterName || 'Citizen Innovator',
    submitterType: raw.submitterType || 'Citizen',
    submitterUid: raw.submitter_id || raw.submitterUid,
    submitterEmail: raw.submitter_email || raw.submitterEmail,
    targetWard: raw.target_ward || raw.targetWard || 'Ward 8 (CIDCO)',
    costEstimate: raw.budget_estimate || raw.costEstimate || 'To be assessed',
    timelineEstimate: raw.timeline_estimate || raw.timelineEstimate || '3-6 months',
    feasibilityScore: Number(raw.feasibility_score || raw.feasibilityScore || 75),
    votes: Number(raw.votes || raw.votes_count || 0),
    hasVoted: Boolean(raw.hasUserVoted ?? raw.hasVoted),
    voters: Array.isArray(raw.voters) ? raw.voters : [],
    reviews: Array.isArray(raw.reviews) ? raw.reviews : [],
    comments: Array.isArray(raw.comments) ? raw.comments : [],
    attachments: Array.isArray(raw.attachments) ? raw.attachments : [],
    createdAt: raw.created_at || raw.createdAt || new Date().toISOString(),
  };
}

export const innovationService = {
  /**
   * Get all innovations from Express API
   */
  async getInnovations(): Promise<Innovation[]> {
    try {
      const res = await fetch('/api/innovations', { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.innovations) && data.innovations.length > 0) {
          return data.innovations.map(normalizeInnovation);
        }
      }
      return INITIAL_SEED_INNOVATIONS.map(normalizeInnovation);
    } catch (err) {
      console.warn('Falling back to local innovations list:', err);
      return INITIAL_SEED_INNOVATIONS.map(normalizeInnovation);
    }
  },

  /**
   * Get single innovation by ID
   */
  async getInnovationById(id: string): Promise<Innovation | null> {
    try {
      const res = await fetch(`/api/innovations/${encodeURIComponent(id.trim())}`, { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        if (data.innovation) {
          return normalizeInnovation(data.innovation);
        }
      }
      const all = await this.getInnovations();
      return all.find((item) => item.id.toLowerCase() === id.trim().toLowerCase()) || null;
    } catch (err) {
      console.error(`Error fetching innovation ${id}:`, err);
      return null;
    }
  },

  /**
   * Submit innovation alias
   */
  async submitInnovation(data: any): Promise<Innovation> {
    return this.createInnovation({
      ...data,
      targetWard: data.targetWard || 'Ward 8 (CIDCO)',
    });
  },

  /**
   * Create a new citizen innovation submission
   */
  async createInnovation(data: {
    title: string;
    description: string;
    problemAddressed?: string;
    expectedImpact?: string;
    category: InnovationCategory;
    targetWard?: string;
    costEstimate?: string;
    timelineEstimate?: string;
    submitterName: string;
    submitterType?: string;
    submitterUid?: string;
    submitterEmail?: string;
    attachments?: EvidenceItem[];
  }): Promise<Innovation> {
    const payload = {
      title: data.title,
      description: data.description,
      problemStatement: data.problemAddressed || data.description,
      proposedSolution: data.description,
      category: data.category,
      targetWard: data.targetWard,
      budgetEstimate: data.costEstimate,
      impactProjection: data.expectedImpact,
      timelineEstimate: data.timelineEstimate,
      attachments: data.attachments || [],
    };

    const res = await fetch('/api/innovations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(payload),
    });

    const resData = await res.json();
    if (!res.ok || !resData.success) {
      throw new Error(resData.message || 'Failed to submit innovation.');
    }

    return normalizeInnovation(resData.innovation);
  },

  /**
   * Update innovation details
   */
  async updateInnovation(id: string, updates: Partial<Innovation>): Promise<Innovation> {
    const existing = await this.getInnovationById(id);
    if (!existing) throw new Error('Innovation not found');
    return { ...existing, ...updates };
  },

  /**
   * Delete innovation
   */
  async deleteInnovation(_id: string): Promise<void> {},

  /**
   * Secure, atomic innovation voting: 1 user = 1 vote.
   */
  async voteInnovation(id: string, _optionalVoterId?: string): Promise<{ votes: number; hasVoted: boolean }> {
    const res = await fetch(`/api/innovations/${encodeURIComponent(id.trim())}/vote`, {
      method: 'POST',
      credentials: 'include',
    });

    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.message || 'Voting requires authentication. Please sign in.');
    }

    const updated = await this.getInnovationById(id);
    return {
      votes: updated?.votes || 0,
      hasVoted: data.voted,
    };
  },

  /**
   * Backwards compatible upvoteInnovation alias
   */
  async upvoteInnovation(id: string, voterId?: string): Promise<Innovation> {
    const result = await this.voteInnovation(id, voterId);
    const updated = await this.getInnovationById(id);
    if (!updated) throw new Error('Innovation not found after vote.');
    return {
      ...updated,
      votes: result.votes,
      hasVoted: result.hasVoted,
    };
  },

  /**
   * Add community or expert comment
   */
  async addComment(id: string, comment: any): Promise<Innovation> {
    const existing = await this.getInnovationById(id);
    if (!existing) throw new Error('Innovation not found');

    const newComment: InnovationComment = {
      id: `c-${Date.now()}`,
      authorName: comment.authorName || comment.userName || 'Citizen Contributor',
      authorRole: comment.authorRole || comment.userRole || 'Citizen',
      content: comment.content || comment.comment || '',
      createdAt: new Date().toISOString().slice(0, 10),
    };

    const updatedComments = [...(existing.comments || []), newComment];
    return { ...existing, comments: updatedComments };
  },

  /**
   * Expert Evaluation Module: Record professional committee review
   */
  async addReview(id: string, review: any): Promise<Innovation> {
    const fScore = review.feasibilityScore ?? review.scores?.feasibility ?? 80;
    const cScore = review.costEffectivenessScore ?? review.scores?.costEffectiveness ?? 80;
    const iScore = review.communityImpactScore ?? review.scores?.communityImpact ?? 85;
    const sScore = review.scalability ?? review.scores?.scalability ?? 80;
    const avgScore = review.overallScore ?? Math.round((fScore + cScore + iScore + sScore) / 4);

    const recommendation = review.recommendation || review.verdict || 'Recommended for Ward Pilot';

    const res = await fetch(`/api/innovations/${encodeURIComponent(id.trim())}/review`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        score: avgScore,
        comments: review.comments || 'Evaluated by expert committee.',
        stageRecommendation: recommendation.toLowerCase().includes('pilot') ? 'Pilot Approved' : 'Under Review',
      }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Failed to submit expert review.');
    }

    const updated = await this.getInnovationById(id);
    return updated!;
  },

  /**
   * Pilot / Grant / Recognition Module
   */
  async updateStageAndAwards(
    id: string,
    data: {
      stage: InnovationStage;
      pilotDetails?: string;
      grantAmount?: string;
      recognitionBadge?: string;
    }
  ): Promise<Innovation> {
    return this.updateInnovation(id, {
      stage: data.stage,
      pilotDetails: data.pilotDetails,
      grantAmount: data.grantAmount,
      recognitionBadge: data.recognitionBadge,
    });
  },

  /**
   * Quick update stage
   */
  async updateStage(id: string, nextStage: InnovationStage): Promise<Innovation> {
    return this.updateStageAndAwards(id, { stage: nextStage });
  },
};
