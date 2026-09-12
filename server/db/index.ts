import pg from 'pg';
import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';

const { Pool } = pg;

export interface DbClient {
  query: (text: string, params?: any[]) => Promise<{ rows: any[]; rowCount: number }>;
}

let pool: pg.Pool | null = null;
let isConnected = false;
let connectionError: string | null = null;

// In-memory relational emulation store for development when DATABASE_URL is not yet configured
class DevFallbackDb implements DbClient {
  private tables: Record<string, any[]> = {
    departments: [],
    users: [],
    problems: [],
    problem_updates: [],
    problem_evidence: [],
    resolutions: [],
    innovations: [],
    innovation_reviews: [],
    innovation_votes: [],
    consultations: [],
    consultation_responses: [],
    notifications: [],
    audit_logs: [],
  };

  constructor() {
    this.seedInitialDevData();
  }

  private seedInitialDevData() {
    // Seed standard municipal departments
    const defaultDepts = [
      { id: '11111111-1111-1111-1111-111111111101', name: 'Municipal Road Maintenance & Civil Infrastructure', code: 'RMI', description: 'Road repairs, potholes, sidewalks and flyovers', contact_email: 'roads@civicbridge.gov.in', is_active: true },
      { id: '11111111-1111-1111-1111-111111111102', name: 'Water Supply & Sewerage Board', code: 'WSSB', description: 'Water pipelines, leaks, drainage and sewage overflows', contact_email: 'water@civicbridge.gov.in', is_active: true },
      { id: '11111111-1111-1111-1111-111111111103', name: 'Solid Waste Management & Public Sanitation', code: 'SWM', description: 'Garbage disposal, street sweeping and public toilets', contact_email: 'sanitation@civicbridge.gov.in', is_active: true },
      { id: '11111111-1111-1111-1111-111111111104', name: 'Electrical Works & Streetlighting Department', code: 'EWD', description: 'Street lights, electrical poles, dark spots', contact_email: 'lights@civicbridge.gov.in', is_active: true },
      { id: '11111111-1111-1111-1111-111111111105', name: 'Public Health & Vector Control', code: 'PHD', description: 'Mosquito spraying, sanitary inspections, health centers', contact_email: 'health@civicbridge.gov.in', is_active: true },
      { id: '11111111-1111-1111-1111-111111111106', name: 'Town Planning & Traffic Engineering', code: 'TPTE', description: 'Signals, road markings, zoning and public transport', contact_email: 'traffic@civicbridge.gov.in', is_active: true },
    ];
    this.tables.departments = defaultDepts;

    // Seed sample seed problems
    const now = new Date();
    const seedProblems = [
      {
        id: '22222222-2222-2222-2222-222222222201',
        tracking_id: 'CIV-2026-001024',
        title: 'Severe crater potholes near Kranti Chowk flyover descent',
        description: 'Large cluster of deep potholes on the westbound carriageway causing vehicle damage and traffic bottlenecks during evening peak hours.',
        category: 'Roads & Infrastructure',
        department_name: 'Municipal Road Maintenance & Civil Infrastructure',
        department_id: defaultDepts[0].id,
        address: 'Kranti Chowk, Jalna Road, Ward 4',
        landmark: 'Near Shivaji Maharaj Statue & Flyover Pillar 14',
        ward: 'Ward 4 (Kranti Chowk / Station Rd)',
        city: 'Chhatrapati Sambhajinagar',
        district: 'Chhatrapati Sambhajinagar',
        state: 'Maharashtra',
        pincode: '431001',
        lat: 19.8735,
        lng: 75.3262,
        impact_scope: 'Large community',
        urgency: 'High',
        priority: 'High',
        priority_score: 88,
        status: 'In Progress',
        deadline: new Date(now.getTime() + 2 * 24 * 3600 * 1000).toISOString(),
        reporter_id: '00000000-0000-0000-0000-000000000001',
        citizen_name: 'Rohan Deshmukh',
        citizen_phone: '9822012345',
        citizen_phone_masked: '9822****45',
        assigned_officer_id: '33333333-3333-3333-3333-333333333301',
        assigned_officer_name: 'Er. Rajesh Kadam',
        assigned_officer_designation: 'Executive Engineer (Civil)',
        ai_assessment: {
          category: 'Roads & Infrastructure',
          suggestedDepartment: 'Municipal Road Maintenance & Civil Infrastructure',
          suggestedPriority: 'High',
          priorityScore: 88,
          reasoning: ['Major arterial junction', 'Accident hazard on flyover descent'],
          keyIdentifiedEntities: ['Kranti Chowk', 'flyover', 'potholes'],
          isPreliminary: false,
          generatedAt: now.toISOString(),
        },
        tags: ['pothole', 'flyover', 'traffic-hazard'],
        is_duplicate: false,
        created_at: new Date(now.getTime() - 24 * 3600 * 1000).toISOString(),
        updated_at: now.toISOString(),
      },
      {
        id: '22222222-2222-2222-2222-222222222202',
        tracking_id: 'CIV-2026-001089',
        title: 'Drinking water pipeline rupture leaking into open storm drain',
        description: 'Clean municipal water main has burst near N-5 CIDCO garden, submerging the sidewalk and wasting thousands of liters.',
        category: 'Water & Drainage',
        department_name: 'Water Supply & Sewerage Board',
        department_id: defaultDepts[1].id,
        address: 'N-5 CIDCO, Sector B, Ward 8',
        landmark: 'Opposite Town Center Garden Gate 3',
        ward: 'Ward 8 (CIDCO N-5 / Cannaught)',
        city: 'Chhatrapati Sambhajinagar',
        district: 'Chhatrapati Sambhajinagar',
        state: 'Maharashtra',
        pincode: '431003',
        lat: 19.8824,
        lng: 75.3621,
        impact_scope: 'Large community',
        urgency: 'Critical',
        priority: 'Critical',
        priority_score: 95,
        status: 'Assigned',
        deadline: new Date(now.getTime() + 12 * 3600 * 1000).toISOString(),
        reporter_id: '00000000-0000-0000-0000-000000000002',
        citizen_name: 'Pooja Patil',
        citizen_phone: '9422054321',
        citizen_phone_masked: '9422****21',
        assigned_officer_id: '33333333-3333-3333-3333-333333333302',
        assigned_officer_name: 'Er. S. M. Kulkarni',
        assigned_officer_designation: 'Assistant Engineer (Water Supply)',
        ai_assessment: {
          category: 'Water & Drainage',
          suggestedDepartment: 'Water Supply & Sewerage Board',
          suggestedPriority: 'Critical',
          priorityScore: 95,
          reasoning: ['Clean water loss', 'Disruption to sector drinking water'],
          keyIdentifiedEntities: ['N-5 CIDCO', 'pipeline rupture', 'water waste'],
          isPreliminary: false,
          generatedAt: now.toISOString(),
        },
        tags: ['water-leak', 'pipeline', 'urgent'],
        is_duplicate: false,
        created_at: new Date(now.getTime() - 8 * 3600 * 1000).toISOString(),
        updated_at: now.toISOString(),
      },
      {
        id: '22222222-2222-2222-2222-222222222203',
        tracking_id: 'CIV-2026-000955',
        title: 'Non-functional high-mast lighting along Baba Petrol Pump junction',
        description: 'Entire intersection plunged in darkness for three consecutive nights, raising safety concerns for pedestrian crossings.',
        category: 'Public Safety & Streetlighting',
        department_name: 'Electrical Works & Streetlighting Department',
        department_id: defaultDepts[3].id,
        address: 'Baba Petrol Pump Junction, Jalna Road',
        landmark: 'Jalna Road Cross',
        ward: 'Ward 5 (Railway Station / Padampura)',
        city: 'Chhatrapati Sambhajinagar',
        district: 'Chhatrapati Sambhajinagar',
        state: 'Maharashtra',
        pincode: '431005',
        lat: 19.8631,
        lng: 75.3183,
        impact_scope: 'Multiple areas',
        urgency: 'Medium',
        priority: 'Medium',
        priority_score: 72,
        status: 'Resolved',
        deadline: new Date(now.getTime() - 24 * 3600 * 1000).toISOString(),
        reporter_id: '00000000-0000-0000-0000-000000000003',
        citizen_name: 'Amit Shinde',
        citizen_phone: '9890123456',
        citizen_phone_masked: '9890****56',
        assigned_officer_id: '33333333-3333-3333-3333-333333333303',
        assigned_officer_name: 'Shri Vinod Jadhav',
        assigned_officer_designation: 'Sub-Divisional Officer (Electrical)',
        ai_assessment: {
          category: 'Public Safety & Streetlighting',
          suggestedDepartment: 'Electrical Works & Streetlighting Department',
          suggestedPriority: 'Medium',
          priorityScore: 72,
          reasoning: ['Public night safety', 'Major signal crossing'],
          keyIdentifiedEntities: ['high-mast', 'Baba Petrol Pump', 'streetlights'],
          isPreliminary: false,
          generatedAt: now.toISOString(),
        },
        tags: ['lighting', 'public-safety'],
        is_duplicate: false,
        created_at: new Date(now.getTime() - 4 * 24 * 3600 * 1000).toISOString(),
        updated_at: new Date(now.getTime() - 24 * 3600 * 1000).toISOString(),
      },
    ];
    this.tables.problems = seedProblems;

    // Add timeline updates for seed problems
    this.tables.problem_updates = [
      {
        id: '44444444-4444-4444-4444-444444444401',
        problem_id: seedProblems[0].id,
        actor_name: 'CivicBridge System',
        actor_role: 'system',
        step: 'Grievance Submitted',
        title: 'Complaint Registered',
        status: 'Submitted',
        notes: 'Complaint registered and preliminary AI triage completed.',
        created_at: seedProblems[0].created_at,
      },
      {
        id: '44444444-4444-4444-4444-444444444402',
        problem_id: seedProblems[0].id,
        actor_name: 'Er. Rajesh Kadam',
        actor_role: 'officer',
        step: 'Field Inspection Dispatched',
        title: 'Assigned to Ward Junior Engineer',
        status: 'In Progress',
        notes: 'Cold mix asphalt batch allocated for patch filling starting 23:00 hrs.',
        created_at: now.toISOString(),
      },
    ];

    // Seed initial consultations
    this.tables.consultations = [
      {
        id: '55555555-5555-5555-5555-555555555501',
        code: 'POL-2026-01',
        title: 'Comprehensive Cycling Corridor & Pedestrian Walkway Masterplan',
        department_name: 'Town Planning & Traffic Engineering',
        topic: 'Urban Mobility & Non-Motorized Transport',
        summary: 'Citizen consultation on the proposed 14-kilometer dedicated bicycle track connecting Kranti Chowk, CIDCO N-1 through N-6, and the Sports Complex.',
        status: 'Active',
        deadline: new Date(now.getTime() + 18 * 24 * 3600 * 1000).toISOString(),
        total_responses: 342,
        questions: [
          { id: 'q1', type: 'choice', questionText: 'Would you use dedicated, physically separated cycle tracks for daily commuting?', options: ['Yes, definitely', 'Occasionally on weekends', 'Unlikely', 'Prefer improved public buses'] },
          { id: 'q2', type: 'rating', questionText: 'Rate current pedestrian safety and sidewalk continuity in CIDCO wards (1 to 5 stars)' },
          { id: 'q3', type: 'text', questionText: 'What key arterial stretch requires the most urgent sidewalk rehabilitation?' },
        ],
        created_at: new Date(now.getTime() - 5 * 24 * 3600 * 1000).toISOString(),
        updated_at: now.toISOString(),
      },
    ];

    // Seed initial innovations
    this.tables.innovations = [
      {
        id: '66666666-6666-6666-6666-666666666601',
        tracking_id: 'INN-2026-01',
        title: 'Decentralized Organic Waste Biomethanation Pods for Vegetable Markets',
        description: 'Modular 500kg/day anaerobic digestion units placed at Jadhavmandi wholesale market turning rotting produce into biogas for local street vendor lighting.',
        problem_statement: 'Open dump heaps in APMC and daily vegetable markets create odor, leachate, and stray cattle hazards.',
        proposed_solution: 'Compact, odor-sealed digestor units with slurry separation for urban composting.',
        category: 'Waste Management',
        target_ward: 'Ward 2 (Town Hall / Bhadkal Gate)',
        stage: 'Shortlisted',
        budget_estimate: '₹ 8,50,000 per unit',
        impact_projection: 'Diverts 1.5 tons daily wet waste from dumping ground',
        timeline_estimate: '3 months pilot',
        submitter_id: '00000000-0000-0000-0000-000000000001',
        submitter_name: 'Dr. Shruti Joshi & Team GreenTech',
        submitter_email: 'shruti@greentech.org',
        votes_count: 89,
        feasibility_score: 84,
        attachments: [],
        created_at: new Date(now.getTime() - 10 * 24 * 3600 * 1000).toISOString(),
        updated_at: now.toISOString(),
      },
    ];

    // Seed default administrative, officer, and citizen users for instant local and demo authentication
    const defaultPasswordHash = bcrypt.hashSync('civicbridge123', 10);
    this.tables.users = [
      {
        id: '00000000-0000-0000-0000-000000000001',
        name: 'Smt. Radhika Deshpande (IAS)',
        email: 'admin@civicbridge.gov.in',
        password_hash: defaultPasswordHash,
        phone: '9822001100',
        role: 'super_admin',
        designation: 'Municipal Commissioner',
        ward_or_district: 'Municipal Headquarters',
        is_active: true,
        created_at: now.toISOString(),
        updated_at: now.toISOString(),
      },
      {
        id: '33333333-3333-3333-3333-333333333301',
        name: 'Er. Rajesh Kadam',
        email: 'officer@civicbridge.gov.in',
        password_hash: defaultPasswordHash,
        phone: '9822002200',
        role: 'officer',
        department_id: defaultDepts[0].id,
        designation: 'Executive Engineer (Civil)',
        ward_or_district: 'Ward 4 (Kranti Chowk / Station Rd)',
        is_active: true,
        created_at: now.toISOString(),
        updated_at: now.toISOString(),
      },
      {
        id: '33333333-3333-3333-3333-333333333302',
        name: 'Shri Sunil Patil',
        email: 'deptadmin@civicbridge.gov.in',
        password_hash: defaultPasswordHash,
        phone: '9822003300',
        role: 'department_admin',
        department_id: defaultDepts[0].id,
        designation: 'Superintending Engineer (Roads)',
        ward_or_district: 'Zone 1 Head Office',
        is_active: true,
        created_at: now.toISOString(),
        updated_at: now.toISOString(),
      },
      {
        id: '00000000-0000-0000-0000-000000000002',
        name: 'Rohan Deshmukh',
        email: 'citizen@civicbridge.gov.in',
        password_hash: defaultPasswordHash,
        phone: '9822004400',
        role: 'citizen',
        ward_or_district: 'Ward 8 (CIDCO / Kranti Chowk)',
        is_active: true,
        created_at: now.toISOString(),
        updated_at: now.toISOString(),
      },
    ];
  }

  async query(text: string, params: any[] = []): Promise<{ rows: any[]; rowCount: number }> {
    const trimmed = text.trim();
    const upper = trimmed.toUpperCase();

    // SELECT
    if (upper.startsWith('SELECT')) {
      for (const [table, rows] of Object.entries(this.tables)) {
        if (new RegExp(`\\bFROM\\s+${table}\\b`, 'i').test(trimmed)) {
          let result = [...rows];

          // WHERE filtering heuristics
          if (trimmed.includes('WHERE')) {
            if (/\breporter_id\s*=\s*\$1\b/i.test(trimmed)) {
              const rid = String(params[0] || '').trim();
              result = result.filter((r) => r.reporter_id === rid);
            } else if (/\bassigned_officer_id\s*=\s*\$1\b/i.test(trimmed)) {
              const oid = String(params[0] || '').trim();
              result = result.filter((r) => r.assigned_officer_id === oid);
            } else if (/\buser_id\s*=\s*\$1\b/i.test(trimmed)) {
              const uid = String(params[0] || '').trim();
              result = result.filter((r) => r.user_id === uid);
            } else if (/\bemail\s*=\s*\$1\b/i.test(trimmed)) {
              const email = String(params[0] || '').toLowerCase().trim();
              result = result.filter((r) => (r.email || '').toLowerCase() === email);
            } else if (/\b(tracking_id|id)\s*=\s*\$1\b/i.test(trimmed)) {
              const val = String(params[0] || '').trim();
              result = result.filter((r) => r.id === val || r.tracking_id === val || r.code === val);
            }
          }

          // ORDER BY
          if (trimmed.includes('ORDER BY created_at DESC') || trimmed.includes('ORDER BY timestamp DESC')) {
            result.sort((a, b) => new Date(b.created_at || b.timestamp || 0).getTime() - new Date(a.created_at || a.timestamp || 0).getTime());
          }

          // LIMIT
          if (trimmed.includes('LIMIT 1')) {
            result = result.slice(0, 1);
          }

          return { rows: result, rowCount: result.length };
        }
      }
      return { rows: [], rowCount: 0 };
    }

    // INSERT
    if (upper.startsWith('INSERT INTO')) {
      for (const [table, rows] of Object.entries(this.tables)) {
        if (new RegExp(`\\bINSERT\\s+INTO\\s+${table}\\b`, 'i').test(trimmed)) {
          const newRow: any = {
            id: `id-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          };

          // Dynamically map column list from query
          const colMatch = trimmed.match(/INSERT\s+INTO\s+[a-z0-9_]+\s*\(([^)]+)\)/i);
          if (colMatch) {
            const cols = colMatch[1].split(',').map((c) => c.trim().toLowerCase());
            cols.forEach((col, idx) => {
              if (idx < params.length) {
                newRow[col] = params[idx];
              }
            });
          }

          rows.unshift(newRow);
          return { rows: [newRow], rowCount: 1 };
        }
      }
      return { rows: [], rowCount: 0 };
    }

    // UPDATE
    if (upper.startsWith('UPDATE')) {
      for (const [table, rows] of Object.entries(this.tables)) {
        if (new RegExp(`\\bUPDATE\\s+${table}\\b`, 'i').test(trimmed)) {
          if (trimmed.includes('status = $1') && params[1]) {
            const target = rows.find((r) => r.id === params[1] || r.tracking_id === params[1]);
            if (target) {
              target.status = params[0];
              target.updated_at = new Date().toISOString();
              return { rows: [target], rowCount: 1 };
            }
          }
          return { rows, rowCount: rows.length };
        }
      }
    }

    return { rows: [], rowCount: 0 };
  }
}

const fallbackDb = new DevFallbackDb();

export function getDb(): DbClient {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    if (!connectionError) {
      console.warn('⚠️  [CivicBridge Database]: DATABASE_URL is not set. Running in development mode with resilient memory-backed store. To enable cloud persistence, add your Neon PostgreSQL connection string in Settings > Secrets or .env as DATABASE_URL.');
      connectionError = 'DATABASE_URL_NOT_CONFIGURED';
    }
    return fallbackDb;
  }

  if (!pool) {
    try {
      pool = new Pool({
        connectionString: databaseUrl,
        ssl: {
          rejectUnauthorized: false,
        },
        max: 10,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 10000,
      });

      pool.on('error', (err) => {
        console.error('Unexpected error on idle PostgreSQL client:', err);
      });

      // Initialize schema asynchronously
      initPostgresSchema(pool).catch((err) => {
        console.error('Failed to run initial PostgreSQL migrations:', err);
      });

      isConnected = true;
    } catch (err: any) {
      console.error('Failed to create PostgreSQL connection pool:', err);
      return fallbackDb;
    }
  }

  return pool;
}

async function initPostgresSchema(p: pg.Pool) {
  try {
    const schemaPath = path.join(process.cwd(), 'server', 'db', 'schema.sql');
    if (fs.existsSync(schemaPath)) {
      const sql = fs.readFileSync(schemaPath, 'utf8');
      await p.query(sql);
      console.log('✅ [CivicBridge Database]: Neon PostgreSQL schema initialized successfully.');
    }
  } catch (err) {
    console.error('Error applying schema to Neon PostgreSQL:', err);
  }
}

export function getDbStatus() {
  return {
    isConfigured: !!process.env.DATABASE_URL,
    provider: process.env.DATABASE_URL ? 'Neon PostgreSQL' : 'Development Store (Pending DATABASE_URL)',
    connectionError,
  };
}
