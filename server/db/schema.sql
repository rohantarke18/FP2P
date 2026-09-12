-- CivicBridge Database Schema for Neon PostgreSQL
-- Fully relational, UUID primary keys, foreign keys, timestamps, indexes

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Municipal Departments
CREATE TABLE IF NOT EXISTS departments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL UNIQUE,
  code VARCHAR(50) NOT NULL UNIQUE,
  description TEXT,
  contact_email VARCHAR(255),
  head_officer_name VARCHAR(255),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 2. Users Table
-- Roles: citizen, officer, department_admin, expert, super_admin
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  phone VARCHAR(50),
  role VARCHAR(50) NOT NULL DEFAULT 'citizen' CHECK (role IN ('citizen', 'officer', 'department_admin', 'expert', 'super_admin')),
  department_id UUID REFERENCES departments(id) ON DELETE SET NULL,
  designation VARCHAR(255),
  ward_or_district VARCHAR(255) DEFAULT 'Ward 8 (CIDCO / Kranti Chowk)',
  avatar TEXT,
  language VARCHAR(10) DEFAULT 'en' CHECK (language IN ('en', 'hi', 'mr')),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_dept ON users(department_id);

-- 3. Problems / Complaints
CREATE TABLE IF NOT EXISTS problems (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tracking_id VARCHAR(50) NOT NULL UNIQUE,
  title VARCHAR(300) NOT NULL,
  description TEXT NOT NULL,
  category VARCHAR(100) NOT NULL,
  department_id UUID REFERENCES departments(id) ON DELETE SET NULL,
  department_name VARCHAR(255) NOT NULL,
  
  -- Location Details
  address TEXT NOT NULL,
  landmark VARCHAR(255),
  ward VARCHAR(100) NOT NULL,
  city VARCHAR(100) NOT NULL DEFAULT 'Chhatrapati Sambhajinagar',
  district VARCHAR(100) NOT NULL DEFAULT 'Chhatrapati Sambhajinagar',
  state VARCHAR(100) NOT NULL DEFAULT 'Maharashtra',
  pincode VARCHAR(20) NOT NULL DEFAULT '431001',
  lat NUMERIC(10, 7) NOT NULL DEFAULT 19.8753,
  lng NUMERIC(10, 7) NOT NULL DEFAULT 75.3433,
  
  -- Civic Attributes
  impact_scope VARCHAR(50) NOT NULL DEFAULT 'My neighbourhood',
  urgency VARCHAR(50) NOT NULL DEFAULT 'Medium',
  priority VARCHAR(50) NOT NULL DEFAULT 'Medium',
  priority_score INT DEFAULT 65 CHECK (priority_score >= 0 AND priority_score <= 100),
  status VARCHAR(50) NOT NULL DEFAULT 'Submitted' CHECK (status IN (
    'Submitted', 'Under Review', 'Assigned', 'In Progress', 
    'Awaiting Information', 'Resolution Submitted', 'Citizen Verification', 
    'Resolved', 'Closed', 'Reopened', 'Rejected'
  )),
  deadline TIMESTAMPTZ NOT NULL,
  
  -- Citizen & Officer Links
  reporter_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  citizen_name VARCHAR(255) NOT NULL,
  citizen_phone VARCHAR(50),
  citizen_phone_masked VARCHAR(50),
  assigned_officer_id UUID REFERENCES users(id) ON DELETE SET NULL,
  assigned_officer_name VARCHAR(255),
  assigned_officer_designation VARCHAR(255),
  
  -- AI Triage Fields
  ai_assessment JSONB,
  tags TEXT[] DEFAULT '{}',
  is_duplicate BOOLEAN DEFAULT FALSE,
  duplicate_reason TEXT,
  
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_problems_tracking_id ON problems(tracking_id);
CREATE INDEX IF NOT EXISTS idx_problems_status ON problems(status);
CREATE INDEX IF NOT EXISTS idx_problems_reporter ON problems(reporter_id);
CREATE INDEX IF NOT EXISTS idx_problems_assigned ON problems(assigned_officer_id);
CREATE INDEX IF NOT EXISTS idx_problems_dept ON problems(department_id);
CREATE INDEX IF NOT EXISTS idx_problems_category ON problems(category);
CREATE INDEX IF NOT EXISTS idx_problems_ward ON problems(ward);

-- 4. Problem Updates (Timeline)
CREATE TABLE IF NOT EXISTS problem_updates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  problem_id UUID NOT NULL REFERENCES problems(id) ON DELETE CASCADE,
  actor_id UUID REFERENCES users(id) ON DELETE SET NULL,
  actor_name VARCHAR(255) NOT NULL,
  actor_role VARCHAR(50) NOT NULL,
  step VARCHAR(100) NOT NULL,
  title VARCHAR(255) NOT NULL,
  status VARCHAR(50) NOT NULL,
  department VARCHAR(255),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_problem_updates_problem_id ON problem_updates(problem_id);

-- 5. Problem Evidence (Files)
CREATE TABLE IF NOT EXISTS problem_evidence (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  problem_id UUID NOT NULL REFERENCES problems(id) ON DELETE CASCADE,
  uploaded_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  storage_path TEXT NOT NULL,
  file_name VARCHAR(255) NOT NULL,
  file_type VARCHAR(50) NOT NULL CHECK (file_type IN ('image', 'video', 'document')),
  file_size BIGINT NOT NULL,
  mime_type VARCHAR(100),
  url TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_evidence_problem ON problem_evidence(problem_id);

-- 6. Problem Resolutions
CREATE TABLE IF NOT EXISTS resolutions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  problem_id UUID NOT NULL UNIQUE REFERENCES problems(id) ON DELETE CASCADE,
  officer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  officer_name VARCHAR(255) NOT NULL,
  officer_designation VARCHAR(255),
  notes TEXT NOT NULL,
  work_order_ref VARCHAR(100),
  completion_date TIMESTAMPTZ NOT NULL,
  media JSONB DEFAULT '[]'::jsonb,
  
  -- Citizen Verification
  verification_status VARCHAR(50) DEFAULT 'pending' CHECK (verification_status IN ('pending', 'verified', 'disputed')),
  verified_at TIMESTAMPTZ,
  feedback_notes TEXT,
  dispute_reason TEXT,
  satisfaction_rating INT CHECK (satisfaction_rating >= 1 AND satisfaction_rating <= 5),
  
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_resolutions_problem ON resolutions(problem_id);

-- 7. Innovations & Citizen Solutions
CREATE TABLE IF NOT EXISTS innovations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tracking_id VARCHAR(50) NOT NULL UNIQUE,
  title VARCHAR(300) NOT NULL,
  description TEXT NOT NULL,
  problem_statement TEXT NOT NULL,
  proposed_solution TEXT NOT NULL,
  category VARCHAR(100) NOT NULL,
  target_ward VARCHAR(100) NOT NULL,
  stage VARCHAR(50) NOT NULL DEFAULT 'Submitted' CHECK (stage IN (
    'Submitted', 'Under Review', 'Shortlisted', 'Pilot', 'Grant Approved', 'Recognized', 'Implemented', 'Rejected'
  )),
  budget_estimate VARCHAR(100),
  impact_projection VARCHAR(255),
  timeline_estimate VARCHAR(100),
  submitter_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  submitter_name VARCHAR(255) NOT NULL,
  submitter_email VARCHAR(255),
  votes_count INT DEFAULT 0,
  feasibility_score INT DEFAULT 70 CHECK (feasibility_score >= 0 AND feasibility_score <= 100),
  attachments JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_innovations_tracking ON innovations(tracking_id);
CREATE INDEX IF NOT EXISTS idx_innovations_stage ON innovations(stage);
CREATE INDEX IF NOT EXISTS idx_innovations_submitter ON innovations(submitter_id);

-- 8. Innovation Reviews (Experts)
CREATE TABLE IF NOT EXISTS innovation_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  innovation_id UUID NOT NULL REFERENCES innovations(id) ON DELETE CASCADE,
  expert_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  expert_name VARCHAR(255) NOT NULL,
  expert_designation VARCHAR(255),
  score INT NOT NULL CHECK (score >= 0 AND score <= 100),
  comments TEXT NOT NULL,
  stage_recommendation VARCHAR(50),
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_innovation_reviews_innov ON innovation_reviews(innovation_id);

-- 9. Innovation Votes (Enforcing 1 user = 1 vote)
CREATE TABLE IF NOT EXISTS innovation_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  innovation_id UUID NOT NULL REFERENCES innovations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT unique_innovation_user_vote UNIQUE (innovation_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_innovation_votes_innov ON innovation_votes(innovation_id);
CREATE INDEX IF NOT EXISTS idx_innovation_votes_user ON innovation_votes(user_id);

-- 10. Consultations (Policy & Urban Planning)
CREATE TABLE IF NOT EXISTS consultations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(50) NOT NULL UNIQUE,
  title VARCHAR(300) NOT NULL,
  department_name VARCHAR(255) NOT NULL,
  topic VARCHAR(200) NOT NULL,
  summary TEXT NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'Active' CHECK (status IN ('Draft', 'Active', 'Under Review', 'Completed', 'Closed')),
  deadline TIMESTAMPTZ NOT NULL,
  total_responses INT DEFAULT 0,
  questions JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_consultations_code ON consultations(code);
CREATE INDEX IF NOT EXISTS idx_consultations_status ON consultations(status);

-- 11. Consultation Responses (Enforcing 1 response per user)
CREATE TABLE IF NOT EXISTS consultation_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  consultation_id UUID NOT NULL REFERENCES consultations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  responses JSONB NOT NULL,
  feedback TEXT,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT unique_consultation_user_response UNIQUE (consultation_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_consultation_resp_cons ON consultation_responses(consultation_id);
CREATE INDEX IF NOT EXISTS idx_consultation_resp_user ON consultation_responses(user_id);

-- 12. In-App Notifications
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  category VARCHAR(50) NOT NULL DEFAULT 'complaint',
  link VARCHAR(255),
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(user_id, read);

-- 13. Audit Logs (Immutable)
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  action VARCHAR(100) NOT NULL,
  entity_type VARCHAR(50) NOT NULL,
  entity_id VARCHAR(100) NOT NULL,
  actor_id UUID REFERENCES users(id) ON DELETE SET NULL,
  actor_name VARCHAR(255) NOT NULL,
  actor_role VARCHAR(50) NOT NULL,
  details TEXT NOT NULL,
  ip_address VARCHAR(100),
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_timestamp ON audit_logs(created_at DESC);
