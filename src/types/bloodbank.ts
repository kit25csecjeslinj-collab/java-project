export type BloodGroup = 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';

export type UserRole = 'ROLE_ADMIN' | 'ROLE_STAFF' | 'ROLE_DONOR';

export interface UserAccount {
  id: string;
  username: string;
  fullName: string;
  email: string;
  role: UserRole;
  phone?: string;
  associatedDonorId?: string;
}

export type AvailabilityStatus = 'AVAILABLE' | 'UNAVAILABLE' | 'ON_HOLD';
export type EligibilityStatus = 'ELIGIBLE' | 'PENDING_REVIEW' | 'INELIGIBLE';

export interface Donor {
  id: string;
  fullName: string;
  age: number;
  dateOfBirth: string;
  contactNumber: string;
  email: string;
  bloodGroup: BloodGroup;
  city: string;
  lastDonationDate: string | null;
  availabilityStatus: AvailabilityStatus;
  eligibilityStatus: EligibilityStatus;
  registrationDate: string;
  totalDonationsCount: number;
  weightKg?: number;
  medicalClearanceNotes?: string;
}

export type StockStatus = 'NORMAL' | 'LOW' | 'CRITICAL';

export interface BloodInventoryItem {
  bloodGroup: BloodGroup;
  availableUnits: number;
  minimumThreshold: number;
  criticalThreshold: number;
  lastUpdatedDate: string;
  stockStatus: StockStatus;
  reservedUnits: number;
}

export type TransactionType = 'COLLECTION' | 'DISPATCH' | 'ADJUSTMENT' | 'DISPOSAL';

export interface InventoryTransaction {
  id: string;
  bloodGroup: BloodGroup;
  units: number;
  type: TransactionType;
  date: string;
  performedBy: string;
  reason: string;
  referenceId?: string;
  batchNumber: string;
}

export type RequestPriority = 'NORMAL' | 'URGENT' | 'CRITICAL';
export type RequestStatus = 'PENDING' | 'PROCESSING' | 'FULFILLED' | 'CANCELLED';

export interface BloodRequest {
  id: string;
  hospitalName: string;
  bloodGroup: BloodGroup;
  unitsRequired: number;
  unitsDispatched: number;
  city: string;
  requestDateTime: string;
  priority: RequestPriority;
  status: RequestStatus;
  contactPerson: string;
  contactPhone: string;
  patientCondition?: string;
  fulfilledAt?: string;
  notes?: string;
}

export interface DonorMatchCandidate {
  donor: Donor;
  matchScore: number; // 0 - 100
  isDirectMatch: boolean;
  isUniversalDonor: boolean;
  distanceCityMatch: boolean;
  availabilityScore: number;
  eligibilityScore: number;
  matchReasons: string[];
  recommendedPriority: 'HIGH' | 'MEDIUM' | 'LOW';
}

export type AlertType = 'CRITICAL_SHORTAGE' | 'LOW_STOCK' | 'EMERGENCY_REQUEST' | 'INVENTORY_UPDATE' | 'EXPIRY_WARNING';
export type AlertSeverity = 'critical' | 'warning' | 'info';

export interface AlertItem {
  id: string;
  title: string;
  message: string;
  type: AlertType;
  severity: AlertSeverity;
  timestamp: string;
  isRead: boolean;
  linkTab?: string;
  referenceId?: string;
}

export interface ForecastItem {
  bloodGroup: BloodGroup;
  currentStock: number;
  predictedDemand7Days: number;
  predictedDemand14Days: number;
  predictedDemand30Days: number;
  predictedDemand90Days: number;
  confidenceScore: number;
  shortageRisk: 'CRITICAL' | 'MODERATE' | 'LOW' | 'SAFE';
  recommendedSafetyStock: number;
  urgencyPriority: 'IMMEDIATE' | 'MONITOR' | 'STABLE';
}
