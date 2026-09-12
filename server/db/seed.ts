import bcrypt from 'bcryptjs';
import { getDb } from './index';

export async function runDbSeed() {
  const db = getDb();
  console.log('Seeding initial municipal departments and consultations...');

  const departments = [
    { name: 'Municipal Road Maintenance & Civil Infrastructure', code: 'RMI', description: 'Road repairs, potholes, sidewalks and flyovers', email: 'roads@civicbridge.gov.in' },
    { name: 'Water Supply & Sewerage Board', code: 'WSSB', description: 'Water pipelines, leaks, drainage and sewage overflows', email: 'water@civicbridge.gov.in' },
    { name: 'Solid Waste Management & Public Sanitation', code: 'SWM', description: 'Garbage disposal, street sweeping and public toilets', email: 'sanitation@civicbridge.gov.in' },
    { name: 'Electrical Works & Streetlighting Department', code: 'EWD', description: 'Street lights, electrical poles, dark spots', email: 'lights@civicbridge.gov.in' },
    { name: 'Public Health & Vector Control', code: 'PHD', description: 'Mosquito spraying, sanitary inspections, health centers', email: 'health@civicbridge.gov.in' },
    { name: 'Town Planning & Traffic Engineering', code: 'TPTE', description: 'Signals, road markings, zoning and public transport', email: 'traffic@civicbridge.gov.in' },
  ];

  for (const dept of departments) {
    try {
      await db.query(
        `INSERT INTO departments (name, code, description, contact_email, is_active)
         VALUES ($1, $2, $3, $4, true)
         ON CONFLICT (code) DO NOTHING;`,
        [dept.name, dept.code, dept.description, dept.email]
      );
    } catch (e) {
      // Ignore conflict
    }
  }

  // Seed default admin, officer, and citizen accounts with bcrypt hash
  const defaultPasswordHash = bcrypt.hashSync('civicbridge123', 10);
  const seedUsers = [
    {
      name: 'Smt. Radhika Deshpande (IAS)',
      email: 'admin@civicbridge.gov.in',
      role: 'super_admin',
      designation: 'Municipal Commissioner',
      phone: '9822001100',
    },
    {
      name: 'Er. Rajesh Kadam',
      email: 'officer@civicbridge.gov.in',
      role: 'officer',
      designation: 'Executive Engineer (Civil)',
      phone: '9822002200',
    },
    {
      name: 'Shri Sunil Patil',
      email: 'deptadmin@civicbridge.gov.in',
      role: 'department_admin',
      designation: 'Superintending Engineer (Roads)',
      phone: '9822003300',
    },
    {
      name: 'Rohan Deshmukh',
      email: 'citizen@civicbridge.gov.in',
      role: 'citizen',
      designation: 'Citizen Resident',
      phone: '9822004400',
    },
  ];

  for (const u of seedUsers) {
    try {
      await db.query(
        `INSERT INTO users (name, email, password_hash, role, designation, phone, is_active)
         VALUES ($1, $2, $3, $4, $5, $6, true)
         ON CONFLICT (email) DO NOTHING;`,
        [u.name, u.email, defaultPasswordHash, u.role, u.designation, u.phone]
      );
    } catch (e) {
      // Ignore conflict
    }
  }

  console.log('✅ Seed completed successfully.');
}
