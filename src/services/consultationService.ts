import { Consultation, ConsultationQuestion } from '../types';
import { INITIAL_SEED_CONSULTATIONS } from '../data/seedConsultations';

function normalizeConsultation(c: any): Consultation {
  return {
    id: c.code || c.id,
    title: c.title,
    department: c.department_name || c.department,
    topic: c.topic,
    status: c.status || 'Active',
    summary: c.summary,
    deadline: c.deadline,
    totalResponses: Number(c.total_responses || c.totalResponses || 0),
    voters: Array.isArray(c.voters) ? c.voters : [],
    questions: Array.isArray(c.questions) ? c.questions : [],
    createdByUid: c.created_by || c.createdByUid,
    createdAt: c.created_at || c.createdAt || new Date().toISOString(),
  };
}

export const consultationService = {
  /**
   * Fetch all policy consultations
   */
  async getConsultations(): Promise<Consultation[]> {
    try {
      const res = await fetch('/api/consultations', { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.consultations) && data.consultations.length > 0) {
          return data.consultations.map(normalizeConsultation);
        }
      }
      return INITIAL_SEED_CONSULTATIONS;
    } catch (err) {
      console.warn('Consultations fetch fallback:', err);
      return INITIAL_SEED_CONSULTATIONS;
    }
  },

  /**
   * Fetch single consultation by ID
   */
  async getConsultationById(id: string): Promise<Consultation | null> {
    try {
      const res = await fetch(`/api/consultations/${encodeURIComponent(id.trim())}`, { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        if (data.consultation) {
          return normalizeConsultation(data.consultation);
        }
      }
      const all = await this.getConsultations();
      return all.find((c) => c.id.toLowerCase() === id.trim().toLowerCase()) || null;
    } catch (err) {
      console.error(`Error getting consultation ${id}:`, err);
      return null;
    }
  },

  /**
   * Create a new policy consultation (Admin / Government)
   */
  async createConsultation(data: {
    title: string;
    department: string;
    topic: string;
    summary: string;
    deadline: string;
    questions: ConsultationQuestion[];
    createdByUid?: string;
  }): Promise<Consultation> {
    const res = await fetch('/api/consultations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        title: data.title,
        departmentName: data.department,
        topic: data.topic,
        summary: data.summary,
        deadline: data.deadline,
        questions: data.questions,
      }),
    });

    const resData = await res.json();
    if (!res.ok || !resData.success) {
      throw new Error(resData.message || 'Failed to create consultation.');
    }

    return normalizeConsultation(resData.consultation);
  },

  /**
   * Submit citizen responses for multiple questions in a consultation
   */
  async submitResponse(
    consultationId: string,
    payload: {
      userName?: string;
      userRole?: string;
      ward?: string;
      answers: Record<string, any>;
      voterId?: string;
    }
  ): Promise<{ id: string }> {
    const res = await fetch(`/api/consultations/${encodeURIComponent(consultationId)}/respond`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        responses: payload.answers,
        feedback: `Submitted from ${payload.ward || 'citizen portal'}`,
      }),
    });

    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.message || 'Failed to submit consultation response.');
    }

    return { id: `RESP-${Date.now().toString().slice(-6)}` };
  },

  /**
   * Submit single citizen vote / answer on a consultation question
   */
  async submitAnswer(
    consultationId: string,
    questionId: string,
    selectedOption: string,
    voterId?: string
  ): Promise<any> {
    return this.submitResponse(consultationId, {
      answers: { [questionId]: selectedOption },
      voterId,
    });
  },

  /**
   * Delete consultation
   */
  async deleteConsultation(_id: string): Promise<void> {},
};
