import {
  BloodInventoryItem,
  BloodRequest,
  Donor,
  InventoryTransaction,
  AlertItem,
  UserAccount,
  BloodGroup
} from '../types/bloodbank';

export const INITIAL_USERS: UserAccount[] = [
  {
    id: 'USR-01',
    username: 'admin@bloodlink.org',
    fullName: 'Dr. Sarah Chen (Chief Administrator)',
    email: 'admin@bloodlink.org',
    role: 'ROLE_ADMIN',
    phone: '+1 (555) 019-2831'
  },
  {
    id: 'USR-02',
    username: 'staff@bloodlink.org',
    fullName: 'Marcus Vance (Senior Lab Technologist)',
    email: 'staff@bloodlink.org',
    role: 'ROLE_STAFF',
    phone: '+1 (555) 018-9924'
  },
  {
    id: 'USR-03',
    username: 'donor@bloodlink.org',
    fullName: 'Elena Rostova (Registered Donor)',
    email: 'donor@bloodlink.org',
    role: 'ROLE_DONOR',
    phone: '+1 (555) 014-4421',
    associatedDonorId: 'BL-D1001'
  }
];

export const INITIAL_INVENTORY: BloodInventoryItem[] = [
  {
    bloodGroup: 'A+',
    availableUnits: 34,
    minimumThreshold: 15,
    criticalThreshold: 8,
    lastUpdatedDate: '2026-10-26 18:30',
    stockStatus: 'NORMAL',
    reservedUnits: 4
  },
  {
    bloodGroup: 'A-',
    availableUnits: 12,
    minimumThreshold: 15,
    criticalThreshold: 6,
    lastUpdatedDate: '2026-10-26 14:15',
    stockStatus: 'LOW',
    reservedUnits: 2
  },
  {
    bloodGroup: 'B+',
    availableUnits: 28,
    minimumThreshold: 15,
    criticalThreshold: 8,
    lastUpdatedDate: '2026-10-26 17:00',
    stockStatus: 'NORMAL',
    reservedUnits: 3
  },
  {
    bloodGroup: 'B-',
    availableUnits: 5,
    minimumThreshold: 12,
    criticalThreshold: 6,
    lastUpdatedDate: '2026-10-26 11:20',
    stockStatus: 'CRITICAL',
    reservedUnits: 2
  },
  {
    bloodGroup: 'AB+',
    availableUnits: 19,
    minimumThreshold: 10,
    criticalThreshold: 5,
    lastUpdatedDate: '2026-10-25 19:45',
    stockStatus: 'NORMAL',
    reservedUnits: 1
  },
  {
    bloodGroup: 'AB-',
    availableUnits: 8,
    minimumThreshold: 10,
    criticalThreshold: 4,
    lastUpdatedDate: '2026-10-26 09:10',
    stockStatus: 'LOW',
    reservedUnits: 0
  },
  {
    bloodGroup: 'O+',
    availableUnits: 42,
    minimumThreshold: 20,
    criticalThreshold: 10,
    lastUpdatedDate: '2026-10-26 20:00',
    stockStatus: 'NORMAL',
    reservedUnits: 6
  },
  {
    bloodGroup: 'O-',
    availableUnits: 4,
    minimumThreshold: 18,
    criticalThreshold: 8,
    lastUpdatedDate: '2026-10-26 21:15',
    stockStatus: 'CRITICAL',
    reservedUnits: 3
  }
];

export const INITIAL_DONORS: Donor[] = [
  {
    id: 'BL-D1001',
    fullName: 'Elena Rostova',
    age: 28,
    dateOfBirth: '1998-04-12',
    contactNumber: '+1 (555) 234-8901',
    email: 'elena.rostova@samplemail.org',
    bloodGroup: 'O-',
    city: 'Metro Central',
    lastDonationDate: '2026-06-15',
    availabilityStatus: 'AVAILABLE',
    eligibilityStatus: 'ELIGIBLE',
    registrationDate: '2024-03-10',
    totalDonationsCount: 6,
    weightKg: 64,
    medicalClearanceNotes: 'Verified hemoglobin 13.8 g/dL. No travel restrictions.'
  },
  {
    id: 'BL-D1002',
    fullName: 'David K. Morrison',
    age: 34,
    dateOfBirth: '1992-09-22',
    contactNumber: '+1 (555) 456-1122',
    email: 'david.morrison@samplemail.org',
    bloodGroup: 'O-',
    city: 'Metro Central',
    lastDonationDate: '2026-05-10',
    availabilityStatus: 'AVAILABLE',
    eligibilityStatus: 'ELIGIBLE',
    registrationDate: '2023-11-05',
    totalDonationsCount: 9,
    weightKg: 78,
    medicalClearanceNotes: 'Regular platelet donor. Perfect blood pressure profile.'
  },
  {
    id: 'BL-D1003',
    fullName: 'Priya Narang',
    age: 29,
    dateOfBirth: '1997-01-18',
    contactNumber: '+1 (555) 789-3344',
    email: 'priya.narang@samplemail.org',
    bloodGroup: 'A+',
    city: 'Westside',
    lastDonationDate: '2026-07-20',
    availabilityStatus: 'AVAILABLE',
    eligibilityStatus: 'ELIGIBLE',
    registrationDate: '2024-08-14',
    totalDonationsCount: 4,
    weightKg: 59,
    medicalClearanceNotes: 'Eligible. Clean screening record.'
  },
  {
    id: 'BL-D1004',
    fullName: 'Julian Hayes',
    age: 41,
    dateOfBirth: '1985-11-30',
    contactNumber: '+1 (555) 321-9988',
    email: 'j.hayes@samplemail.org',
    bloodGroup: 'B-',
    city: 'Riverdale',
    lastDonationDate: '2026-03-12',
    availabilityStatus: 'AVAILABLE',
    eligibilityStatus: 'ELIGIBLE',
    registrationDate: '2022-09-01',
    totalDonationsCount: 11,
    weightKg: 82,
    medicalClearanceNotes: 'Rare negative type. Consistently available on emergency calls.'
  },
  {
    id: 'BL-D1005',
    fullName: 'Aisha Al-Mansoor',
    age: 26,
    dateOfBirth: '2000-05-09',
    contactNumber: '+1 (555) 654-7711',
    email: 'aisha.m@samplemail.org',
    bloodGroup: 'B+',
    city: 'North Valley',
    lastDonationDate: '2026-08-01',
    availabilityStatus: 'AVAILABLE',
    eligibilityStatus: 'ELIGIBLE',
    registrationDate: '2025-01-20',
    totalDonationsCount: 2,
    weightKg: 61,
    medicalClearanceNotes: 'Good vein access. Recent vitals within target bounds.'
  },
  {
    id: 'BL-D1006',
    fullName: 'Lucas Santiago',
    age: 37,
    dateOfBirth: '1989-08-14',
    contactNumber: '+1 (555) 890-4455',
    email: 'lucas.s@samplemail.org',
    bloodGroup: 'O+',
    city: 'Harbor District',
    lastDonationDate: '2026-09-28',
    availabilityStatus: 'UNAVAILABLE',
    eligibilityStatus: 'ELIGIBLE',
    registrationDate: '2023-04-18',
    totalDonationsCount: 8,
    weightKg: 75,
    medicalClearanceNotes: 'Donated 28 days ago. In waiting rest period until late Dec 2026.'
  },
  {
    id: 'BL-D1007',
    fullName: 'Sofia Lindqvist',
    age: 31,
    dateOfBirth: '1995-03-03',
    contactNumber: '+1 (555) 432-8877',
    email: 'sofia.l@samplemail.org',
    bloodGroup: 'AB-',
    city: 'Metro Central',
    lastDonationDate: '2026-04-19',
    availabilityStatus: 'AVAILABLE',
    eligibilityStatus: 'ELIGIBLE',
    registrationDate: '2024-02-11',
    totalDonationsCount: 5,
    weightKg: 66,
    medicalClearanceNotes: 'Universal plasma donor candidate.'
  },
  {
    id: 'BL-D1008',
    fullName: 'Michael O’Connor',
    age: 45,
    dateOfBirth: '1981-12-04',
    contactNumber: '+1 (555) 876-1234',
    email: 'm.oconnor@samplemail.org',
    bloodGroup: 'O-',
    city: 'Westside',
    lastDonationDate: null,
    availabilityStatus: 'AVAILABLE',
    eligibilityStatus: 'PENDING_REVIEW',
    registrationDate: '2026-10-18',
    totalDonationsCount: 0,
    weightKg: 85,
    medicalClearanceNotes: 'First-time applicant. Laboratory infectious disease panel pending.'
  },
  {
    id: 'BL-D1009',
    fullName: 'Kavita Patel',
    age: 33,
    dateOfBirth: '1993-07-25',
    contactNumber: '+1 (555) 765-2233',
    email: 'kavita.patel@samplemail.org',
    bloodGroup: 'A-',
    city: 'East Hills',
    lastDonationDate: '2026-05-30',
    availabilityStatus: 'AVAILABLE',
    eligibilityStatus: 'ELIGIBLE',
    registrationDate: '2023-08-19',
    totalDonationsCount: 7,
    weightKg: 58,
    medicalClearanceNotes: 'Confirmed eligible. High commitment donor.'
  },
  {
    id: 'BL-D1010',
    fullName: 'Grace Hopper-Tate',
    age: 39,
    dateOfBirth: '1987-10-09',
    contactNumber: '+1 (555) 901-7654',
    email: 'grace.ht@samplemail.org',
    bloodGroup: 'AB+',
    city: 'Riverdale',
    lastDonationDate: '2026-06-02',
    availabilityStatus: 'AVAILABLE',
    eligibilityStatus: 'ELIGIBLE',
    registrationDate: '2024-11-12',
    totalDonationsCount: 3,
    weightKg: 70,
    medicalClearanceNotes: 'Universal red cell recipient, prime plasma candidate.'
  },
  {
    id: 'BL-D1011',
    fullName: 'Tariq Al-Fassi',
    age: 27,
    dateOfBirth: '1999-02-14',
    contactNumber: '+1 (555) 345-6677',
    email: 'tariq.f@samplemail.org',
    bloodGroup: 'B-',
    city: 'Metro Central',
    lastDonationDate: '2026-02-10',
    availabilityStatus: 'ON_HOLD',
    eligibilityStatus: 'PENDING_REVIEW',
    registrationDate: '2025-06-01',
    totalDonationsCount: 2,
    weightKg: 74,
    medicalClearanceNotes: 'Mild dental procedure last week. Clearance check required.'
  },
  {
    id: 'BL-D1012',
    fullName: 'Chloe Dupont',
    age: 24,
    dateOfBirth: '2002-09-08',
    contactNumber: '+1 (555) 210-9988',
    email: 'chloe.dupont@samplemail.org',
    bloodGroup: 'O+',
    city: 'Metro Central',
    lastDonationDate: '2026-07-14',
    availabilityStatus: 'AVAILABLE',
    eligibilityStatus: 'ELIGIBLE',
    registrationDate: '2025-03-15',
    totalDonationsCount: 3,
    weightKg: 62,
    medicalClearanceNotes: 'Eligible. Rapid recovery verified.'
  }
];

export const INITIAL_REQUESTS: BloodRequest[] = [
  {
    id: 'BL-REQ-8901',
    hospitalName: 'St. Jude Metropolitan Trauma Center',
    bloodGroup: 'O-',
    unitsRequired: 6,
    unitsDispatched: 2,
    city: 'Metro Central',
    requestDateTime: '2026-10-26 20:45',
    priority: 'CRITICAL',
    status: 'PROCESSING',
    contactPerson: 'Dr. Arthur Sterling (Emergency Surgeon)',
    contactPhone: '+1 (555) 890-1200',
    patientCondition: 'Multiple vehicular trauma, severe hemorrhaging in OR 3.',
    notes: '2 units dispatched from cold bank; emergency donor alert triggered for remainder.'
  },
  {
    id: 'BL-REQ-8902',
    hospitalName: 'City General Children Hospital',
    bloodGroup: 'B-',
    unitsRequired: 3,
    unitsDispatched: 0,
    city: 'Riverdale',
    requestDateTime: '2026-10-26 19:15',
    priority: 'URGENT',
    status: 'PENDING',
    contactPerson: 'Nurse Supervisor Karen Holt',
    contactPhone: '+1 (555) 456-7890',
    patientCondition: 'Pediatric sickle cell crisis with acute chest syndrome.',
    notes: 'Immediate B- or O- units urgently requested.'
  },
  {
    id: 'BL-REQ-8903',
    hospitalName: 'Memorial Cardiovascular Institute',
    bloodGroup: 'A+',
    unitsRequired: 4,
    unitsDispatched: 4,
    city: 'Westside',
    requestDateTime: '2026-10-26 14:00',
    priority: 'NORMAL',
    status: 'FULFILLED',
    contactPerson: 'Dr. Raymond Zhao (Perfusionist)',
    contactPhone: '+1 (555) 678-2345',
    patientCondition: 'Scheduled bypass graft surgery tomorrow morning.',
    fulfilledAt: '2026-10-26 16:30',
    notes: 'Units crossmatched, packed in cold-chain container, released to courier.'
  },
  {
    id: 'BL-REQ-8904',
    hospitalName: 'North Valley Regional Medical Center',
    bloodGroup: 'O+',
    unitsRequired: 5,
    unitsDispatched: 5,
    city: 'North Valley',
    requestDateTime: '2026-10-25 11:20',
    priority: 'URGENT',
    status: 'FULFILLED',
    contactPerson: 'Dr. Cynthia Morales',
    contactPhone: '+1 (555) 789-0123',
    patientCondition: 'Obstetric post-partum hemorrhage complication.',
    fulfilledAt: '2026-10-25 13:00',
    notes: 'Emergency dispatch completed in 40 minutes.'
  },
  {
    id: 'BL-REQ-8905',
    hospitalName: 'Harbor Community Hospital',
    bloodGroup: 'AB-',
    unitsRequired: 2,
    unitsDispatched: 0,
    city: 'Harbor District',
    requestDateTime: '2026-10-26 17:50',
    priority: 'NORMAL',
    status: 'PENDING',
    contactPerson: 'Charge Nurse Brenda Vance',
    contactPhone: '+1 (555) 234-5678',
    patientCondition: 'Elective orthopedic hip arthroplasty anticipated blood reserve.',
    notes: 'Awaiting laboratory crossmatch validation.'
  }
];

export const INITIAL_TRANSACTIONS: InventoryTransaction[] = [
  {
    id: 'TXN-9041',
    bloodGroup: 'O-',
    units: 2,
    type: 'DISPATCH',
    date: '2026-10-26 21:00',
    performedBy: 'Marcus Vance (Staff)',
    reason: 'Emergency dispatch to St. Jude Trauma Center for REQ-8901',
    referenceId: 'BL-REQ-8901',
    batchNumber: 'O-NEG-B2026-102'
  },
  {
    id: 'TXN-9040',
    bloodGroup: 'O+',
    units: 3,
    type: 'COLLECTION',
    date: '2026-10-26 19:40',
    performedBy: 'Marcus Vance (Staff)',
    reason: 'Scheduled blood drive mobile unit collection',
    referenceId: 'BL-D1012',
    batchNumber: 'O-POS-B2026-098'
  },
  {
    id: 'TXN-9039',
    bloodGroup: 'A+',
    units: 4,
    type: 'DISPATCH',
    date: '2026-10-26 16:30',
    performedBy: 'Dr. Sarah Chen (Admin)',
    reason: 'Fulfillment of scheduled surgery order REQ-8903',
    referenceId: 'BL-REQ-8903',
    batchNumber: 'A-POS-B2026-077'
  },
  {
    id: 'TXN-9038',
    bloodGroup: 'B+',
    units: 2,
    type: 'COLLECTION',
    date: '2026-10-26 12:15',
    performedBy: 'Marcus Vance (Staff)',
    reason: 'Voluntary walk-in donor collection',
    referenceId: 'BL-D1005',
    batchNumber: 'B-POS-B2026-044'
  },
  {
    id: 'TXN-9037',
    bloodGroup: 'B-',
    units: 1,
    type: 'DISPOSAL',
    date: '2026-10-26 09:30',
    performedBy: 'Dr. Sarah Chen (Admin)',
    reason: 'Exceeded maximum standard RBC shelf life (42 days) in reserve lot',
    batchNumber: 'B-NEG-B2026-011'
  }
];

export const INITIAL_ALERTS: AlertItem[] = [
  {
    id: 'ALT-101',
    title: 'CRITICAL SHORTAGE: O- Negative Blood Reserve',
    message: 'Only 4 units of O- remaining in central bank. Minimum threshold is 18. Immediate donor callout recommended.',
    type: 'CRITICAL_SHORTAGE',
    severity: 'critical',
    timestamp: '2026-10-26 21:15',
    isRead: false,
    linkTab: 'inventory',
    referenceId: 'O-'
  },
  {
    id: 'ALT-102',
    title: 'NEW CRITICAL REQUEST: St. Jude Trauma Center',
    message: 'Trauma OR requires 6 units of O- urgently for vehicular accident patient.',
    type: 'EMERGENCY_REQUEST',
    severity: 'critical',
    timestamp: '2026-10-26 20:45',
    isRead: false,
    linkTab: 'requests',
    referenceId: 'BL-REQ-8901'
  },
  {
    id: 'ALT-103',
    title: 'LOW STOCK ALERT: B- Negative Units',
    message: 'Available B- stock has dipped to 5 units (threshold: 12).',
    type: 'LOW_STOCK',
    severity: 'warning',
    timestamp: '2026-10-26 11:20',
    isRead: false,
    linkTab: 'inventory',
    referenceId: 'B-'
  },
  {
    id: 'ALT-104',
    title: 'Inventory Dispatch Verified: 4 Units A+',
    message: 'Memorial Cardiovascular dispatch logged and cold-chain sealed by Dr. Sarah Chen.',
    type: 'INVENTORY_UPDATE',
    severity: 'info',
    timestamp: '2026-10-26 16:30',
    isRead: true,
    linkTab: 'inventory',
    referenceId: 'TXN-9039'
  }
];

export const MONTHLY_COLLECTION_DATA = [
  { month: 'May 2026', collections: 142, dispatches: 128 },
  { month: 'Jun 2026', collections: 165, dispatches: 154 },
  { month: 'Jul 2026', collections: 180, dispatches: 172 },
  { month: 'Aug 2026', collections: 152, dispatches: 160 },
  { month: 'Sep 2026', collections: 174, dispatches: 168 },
  { month: 'Oct 2026 (MTD)', collections: 191, dispatches: 184 },
];

export const CITIES_LIST = [
  'Metro Central',
  'Westside',
  'North Valley',
  'Riverdale',
  'Harbor District',
  'East Hills'
];
