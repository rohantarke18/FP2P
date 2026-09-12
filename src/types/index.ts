export type Language = 'en' | 'mr' | 'hi';

export type UserRole = 'citizen' | 'officer' | 'department_admin' | 'super_admin' | 'expert';

export interface User {
  id: string;
  uid?: string;
  name: string;
  email: string;
  phone?: string;
  role: UserRole;
  department?: string;
  designation?: string;
  wardOrDistrict?: string;
  avatar?: string;
}

export type ProblemStatus =
  | 'Submitted'
  | 'Under Review'
  | 'Assigned'
  | 'In Progress'
  | 'Awaiting Information'
  | 'Resolution Submitted'
  | 'Citizen Verification'
  | 'Resolved'
  | 'Closed'
  | 'Reopened'
  | 'Rejected';

export type PriorityLevel = 'Low' | 'Medium' | 'High' | 'Critical';

export type ProblemCategory =
  | 'Roads & Infrastructure'
  | 'Water & Drainage'
  | 'Sanitation & Solid Waste'
  | 'Public Transport & Traffic'
  | 'Education & Facilities'
  | 'Healthcare & Sanitation'
  | 'Public Safety & Streetlighting'
  | 'Environment & Green Spaces'
  | 'Civic & Revenue Services'
  | 'Other Civic Issues';

export type ImpactScope = 'Me' | 'My neighbourhood' | 'Large community' | 'Multiple areas';

export interface EvidenceItem {
  id: string;
  name: string;
  type: 'image' | 'video' | 'document';
  url: string;
  size: number;
  uploadedAt: string;
}

export interface AiAssessment {
  category: ProblemCategory;
  suggestedDepartment: string;
  suggestedPriority: PriorityLevel;
  priorityScore: number; // 0 - 100
  reasoning: string[];
  keyIdentifiedEntities: string[];
  isPreliminary: boolean;
  generatedAt: string;
}

export interface TimelineEvent {
  id: string;
  step: string;
  title: string;
  timestamp: string;
  department?: string;
  actorName?: string;
  actorRole?: string;
  notes?: string;
  status: ProblemStatus;
}

export interface ResolutionEvidence {
  id: string;
  submittedAt: string;
  submittedBy: string;
  officerDesignation: string;
  notes: string;
  media: EvidenceItem[];
  workOrderRef?: string;
  completionDate: string;
}

export interface CitizenVerification {
  status: 'pending' | 'verified' | 'disputed';
  verifiedAt?: string;
  feedbackNotes?: string;
  disputeReason?: string;
  satisfactionRating?: number; // 1 to 5
}

export interface Problem {
  id: string; // e.g. CIV-2026-001024
  title: string;
  description: string;
  category: ProblemCategory;
  department: string;
  location: {
    address: string;
    landmark?: string;
    ward: string;
    city: string;
    district: string;
    state: string;
    pincode: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
  };
  impactScope: ImpactScope;
  urgency: PriorityLevel;
  priority: PriorityLevel;
  status: ProblemStatus;
  evidence: EvidenceItem[];
  tags?: string[];
  aiAssessment: AiAssessment;
  timeline: TimelineEvent[];
  assignedOfficer?: {
    id: string;
    name: string;
    designation: string;
    department: string;
  };
  deadline: string;
  createdAt: string;
  updatedAt: string;
  citizenName: string;
  citizenPhoneMasked: string;
  citizenPhone?: string;
  reporterUid?: string;
  reporterEmail?: string;
  resolutionEvidence?: ResolutionEvidence;
  citizenVerification?: CitizenVerification;
  internalNotes?: {
    id: string;
    author: string;
    note: string;
    timestamp: string;
  }[];
}

export interface InnovationChallenge {
  id: string;
  title: string;
  department: string;
  category: string;
  problemStatement: string;
  currentSituation: string;
  expectedOutcomes: string[];
  submissionDeadline: string;
  evaluationCriteria: {
    criterion: string;
    weight: number;
    description: string;
  }[];
  submissionsCount: number;
  status: 'Open' | 'Under Review' | 'Completed';
  focusArea: string;
}

export interface InnovationSubmission {
  id: string;
  challengeId: string;
  challengeTitle: string;
  title: string;
  problemAddressed: string;
  description: string;
  expectedImpact: string;
  estimatedCost: string;
  implementationApproach: string;
  demoLink?: string;
  documents: EvidenceItem[];
  submittedBy: {
    id: string;
    name: string;
    affiliation?: string;
  };
  submittedAt: string;
  status: 'Draft' | 'Submitted' | 'Under Evaluation' | 'Shortlisted' | 'Pilot Approved';
  evaluationScores?: {
    publicNeed: number; // max 20
    innovation: number; // max 20
    feasibility: number; // max 20
    implementationCapacity: number; // max 15
    potentialImpact: number; // max 15
    costEffectiveness: number; // max 10
    comments: string;
    evaluatedBy?: string;
    totalScore: number; // 0 - 100
  };
}

export interface ConsultationOption {
  id: 'agree' | 'partially_agree' | 'disagree';
  label: string;
}

export interface PolicyConsultation {
  id: string;
  title: string;
  department: string;
  publishedDate: string;
  deadline: string;
  status: 'Active' | 'Closing Soon' | 'Closed for Review' | 'Policy Adopted';
  background: string;
  proposal: string;
  keyQuestions: {
    id: string;
    question: string;
    context: string;
  }[];
  documents: {
    title: string;
    fileSize: string;
    url: string;
  }[];
  responsesCount: number;
  resultsAggregate: {
    agreeCount: number;
    partiallyAgreeCount: number;
    disagreeCount: number;
    totalVotes: number;
  };
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  category: 'complaint' | 'innovation' | 'consultation' | 'system';
  link: string;
  read: boolean;
  timestamp: string;
}

export interface PublicMetrics {
  totalReported: number;
  totalResolved: number;
  underReview?: number;
  inProgress?: number;
  slaComplianceRate?: number;
  hotspotsIdentified?: number;
  verificationRate: number; // e.g. 78%
  averageResolutionDays: number; // e.g. 3.2
  activeInResolution: number;
  overdueCount: number;
}

export type InnovationCategory =
  | 'Waste Management'
  | 'Traffic & Mobility'
  | 'Water Conservation'
  | 'Digital Governance'
  | 'Green Urban Spaces'
  | 'Renewable Energy & Lighting'
  | 'Waste Management & Circular Economy'
  | 'Mobility & Pedestrian Safety'
  | 'Water Security & Conservation'
  | 'Clean Energy & Micro-Grids'
  | 'Digital Civic Infrastructure'
  | 'Green Spaces & Urban Forestry';

export type InnovationStage =
  | 'Proposed'
  | 'Under Review'
  | 'Community Discussion'
  | 'Pilot Approved'
  | 'Implemented';

export interface InnovationReview {
  id: string;
  reviewerName: string;
  reviewerTitle: string;
  feasibilityScore?: number;
  costEffectivenessScore?: number;
  communityImpactScore?: number;
  overallScore?: number;
  recommendation?: string;
  scores?: {
    feasibility: number;
    costEffectiveness: number;
    communityImpact: number;
    scalability: number;
  };
  verdict?: 'Recommended for Ward Pilot' | 'Revision Required' | 'Not Feasible' | string;
  comments: string;
  createdAt?: string;
  reviewedAt?: string;
}

export interface InnovationComment {
  id: string;
  userName?: string;
  userRole?: string;
  comment?: string;
  authorName?: string;
  authorRole?: string;
  content?: string;
  createdAt: string;
}

export interface Innovation {
  id: string;
  title: string;
  description: string;
  problemAddressed?: string;
  expectedImpact?: string;
  category: InnovationCategory;
  stage: InnovationStage;
  submitterName: string;
  submitterType: string;
  targetWard: string;
  costEstimate: string;
  timelineEstimate?: string;
  feasibilityScore: number;
  votes: number;
  hasVoted?: boolean;
  submitterUid?: string;
  submitterEmail?: string;
  voters?: string[];
  pilotDetails?: string;
  grantAmount?: string;
  recognitionBadge?: string;
  createdAt: string;
  reviews: InnovationReview[];
  comments: InnovationComment[];
  attachments?: EvidenceItem[];
}

export type ConsultationStatus = 'Active' | 'Under Deliberation' | 'Concluded' | 'Draft';

export interface ConsultationQuestion {
  id: string;
  prompt: string;
  type: 'single_choice' | 'rating_scale' | 'open_text';
  options?: string[];
  liveDistribution?: Record<string, number>;
}

export interface Consultation {
  id: string;
  title: string;
  department: string;
  topic: string;
  status: ConsultationStatus;
  summary: string;
  deadline: string;
  totalResponses: number;
  createdByUid?: string;
  createdAt?: string;
  voters?: string[];
  questions: ConsultationQuestion[];
}

