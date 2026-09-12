export interface MunicipalOfficer {
  id: string;
  name: string;
  designation: string;
  department: string;
  ward: string;
  phone: string;
  email: string;
  avatar: string;
  activeCasesCount: number;
  maxCapacity: number;
  specialization: string;
  experienceYears: number;
}

export const MUNICIPAL_OFFICERS: MunicipalOfficer[] = [
  {
    id: 'off-001',
    name: 'Er. Rajesh Salvi',
    designation: 'Executive Engineer',
    department: 'Municipal Road Maintenance & Civil Infrastructure',
    ward: 'Ward 4 (Kranti Chowk / Station Rd)',
    phone: '+91 98220 14820',
    email: 'rajesh.salvi@civicbridge.gov.in',
    avatar: 'RS',
    activeCasesCount: 2,
    maxCapacity: 6,
    specialization: 'Asphalt paving, bridge joints, arterial road repair',
    experienceYears: 14,
  },
  {
    id: 'off-002',
    name: 'Er. Suresh Patil',
    designation: 'Assistant Engineer',
    department: 'Water Supply, Reservoirs & Drainage Networks',
    ward: 'Ward 8 (CIDCO N-5 / Cannaught)',
    phone: '+91 98221 44910',
    email: 'suresh.patil@civicbridge.gov.in',
    avatar: 'SP',
    activeCasesCount: 3,
    maxCapacity: 6,
    specialization: 'Pipeline hydraulics, wastewater overflow, booster pumps',
    experienceYears: 11,
  },
  {
    id: 'off-003',
    name: 'Er. Priya Jadhav',
    designation: 'Sanitation Officer',
    department: 'Solid Waste Management & Public Sanitation',
    ward: 'Ward 2 (Town Hall / Bhadkal Gate)',
    phone: '+91 98224 81923',
    email: 'priya.jadhav@civicbridge.gov.in',
    avatar: 'PJ',
    activeCasesCount: 1,
    maxCapacity: 5,
    specialization: 'Dump clearances, bio-medical waste segregation, compactor trucks',
    experienceYears: 8,
  },
  {
    id: 'off-004',
    name: 'Er. Vikas Kulkarni',
    designation: 'Junior Engineer',
    department: 'Municipal Road Maintenance & Civil Infrastructure',
    ward: 'Ward 7 (Adalat Road / Samarthnagar)',
    phone: '+91 98229 33019',
    email: 'vikas.kulkarni@civicbridge.gov.in',
    avatar: 'VK',
    activeCasesCount: 1,
    maxCapacity: 5,
    specialization: 'Stormwater drains, footpath slabs, pothole hot-mix patches',
    experienceYears: 5,
  },
  {
    id: 'off-005',
    name: 'Er. Aniket Deshmukh',
    designation: 'Senior Electrical Engineer',
    department: 'Public Safety, Streetlighting & Power Grid',
    ward: 'Ward 12 (Chikalthana / Prozone)',
    phone: '+91 98230 77112',
    email: 'aniket.deshmukh@civicbridge.gov.in',
    avatar: 'AD',
    activeCasesCount: 2,
    maxCapacity: 6,
    specialization: 'LED smart luminaire circuits, high-mast towers, transformer earthing',
    experienceYears: 12,
  },
  {
    id: 'off-006',
    name: 'Dr. Sunita Sharma, IAS',
    designation: 'Additional Commissioner',
    department: 'Central Municipal Administration & Grievance Redressal',
    ward: 'All Municipal Zones',
    phone: '+91 98200 11000',
    email: 'sunita.sharma@civicbridge.gov.in',
    avatar: 'SS',
    activeCasesCount: 0,
    maxCapacity: 10,
    specialization: 'SLA policy enforcement, inter-departmental arbitration, public audit',
    experienceYears: 19,
  },
];
