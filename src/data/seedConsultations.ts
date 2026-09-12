import { Consultation } from '../types';

export const INITIAL_SEED_CONSULTATIONS: Consultation[] = [
  {
    id: 'pol-2026-01',
    title: 'Ward Mobility Policy 2026: Protected Cycle Tracks vs. Curbside Parking',
    department: 'Urban Development & Traffic Engineering',
    topic: 'Sustainable Mobility & Road Space Reallocation',
    status: 'Active',
    summary:
      'The Municipal Corporation proposes reallocating 2.5 meters of curbside vehicle parking on 5 arterial corridors to dedicated, barricaded two-way cycle and EV micro-mobility tracks.',
    deadline: '2026-04-30T23:59:59.000Z',
    totalResponses: 384,
    voters: ['user-seed-1', 'user-seed-2'],
    createdAt: '2026-02-01T08:00:00.000Z',
    questions: [
      {
        id: 'q1',
        prompt: 'Do you support converting one lane of curbside car parking into a dedicated protected bicycle track?',
        type: 'single_choice',
        options: ['Strongly Support', 'Support with Off-Street Parking Alternatives', 'Neutral', 'Oppose (Keep Car Parking)'],
        liveDistribution: {
          'Strongly Support': 214,
          'Support with Off-Street Parking Alternatives': 112,
          'Neutral': 24,
          'Oppose (Keep Car Parking)': 34,
        },
      },
      {
        id: 'q2',
        prompt: 'Which arterial stretch should receive pilot implementation first?',
        type: 'single_choice',
        options: ['FC Road & JM Road Corridor', 'Kothrud Karve Road', 'Baner High Street', 'Hadapsar Magarpatta Link'],
        liveDistribution: {
          'FC Road & JM Road Corridor': 188,
          'Kothrud Karve Road': 96,
          'Baner High Street': 62,
          'Hadapsar Magarpatta Link': 38,
        },
      },
    ],
  },
  {
    id: 'pol-2026-02',
    title: 'Decentralized Organic Waste Mandate for Bulk Generators (>50kg/day)',
    department: 'Solid Waste Management & Public Sanitation',
    topic: 'Circular Economy & Source Segregation Bylaws',
    status: 'Active',
    summary:
      'Proposed municipal bylaw mandating on-site composting or bio-methanation for all residential societies exceeding 50 units and commercial food establishments, backed by a 15% property tax rebate.',
    deadline: '2026-05-15T23:59:59.000Z',
    totalResponses: 256,
    voters: ['user-seed-1'],
    createdAt: '2026-02-10T10:30:00.000Z',
    questions: [
      {
        id: 'q1',
        prompt: 'Should the Municipal Corporation enforce on-site composting with penalty clauses for non-compliance?',
        type: 'single_choice',
        options: ['Yes, with property tax rebates as incentives', 'Yes, strictly mandatory immediately', 'No, municipal trucks should handle all processing', 'Need 6-month grace period first'],
        liveDistribution: {
          'Yes, with property tax rebates as incentives': 158,
          'Yes, strictly mandatory immediately': 42,
          'No, municipal trucks should handle all processing': 21,
          'Need 6-month grace period first': 35,
        },
      },
    ],
  },
  {
    id: 'pol-2026-03',
    title: 'Public Street Vending Zones & Hawking Regulations',
    department: 'Revenue, Licenses & City Planning',
    topic: 'Livelihood Protection and Pedestrian Rights of Way',
    status: 'Under Deliberation',
    summary:
      'Demarcating designated digital hawking plazas with uniform solar canopies and QR payments to prevent footpath encroachments while protecting vendor livelihoods under the Street Vendors Act.',
    deadline: '2026-03-31T23:59:59.000Z',
    totalResponses: 512,
    voters: [],
    createdAt: '2026-01-15T12:00:00.000Z',
    questions: [
      {
        id: 'q1',
        prompt: 'Do you agree with fixed operating hours (6:00 AM - 10:00 PM) for designated street vending zones?',
        type: 'single_choice',
        options: ['Fully Agree', 'Agree with Weekend Extension', 'Disagree (Allow 24/7 in commercial areas)', 'No Opinion'],
        liveDistribution: {
          'Fully Agree': 310,
          'Agree with Weekend Extension': 142,
          'Disagree (Allow 24/7 in commercial areas)': 45,
          'No Opinion': 15,
        },
      },
    ],
  },
];
