import { Freelancer } from '@/types';
import {
  BackendCrewRole,
  BackendFreelancer,
  BackendFreelancerStatus,
  BackendPaymentMethod,
  BackendRateType,
  FreelancerInput,
} from '@/lib/api/freelancers';

const roleLabels: Record<BackendCrewRole, { category: string; subCategory: string }> = {
  LEAD_PHOTOGRAPHER: { category: 'Photographer', subCategory: 'Lead Photographer' },
  CANDID_PHOTOGRAPHER: { category: 'Photographer', subCategory: 'Candid Photographer' },
  TRADITIONAL_PHOTOGRAPHER: { category: 'Photographer', subCategory: 'Traditional Photographer' },
  CINEMATOGRAPHER: { category: 'Videographer', subCategory: 'Cinematographer' },
  TRADITIONAL_VIDEOGRAPHER: { category: 'Videographer', subCategory: 'Traditional Videographer' },
  DRONE_OPERATOR: { category: 'Drone Operator', subCategory: 'Drone Operator' },
  ASSISTANT: { category: 'Assistant', subCategory: 'Production Assistant' },
  LIGHT_ASSISTANT: { category: 'Assistant', subCategory: 'Light Assistant' },
  LIVE_EDITOR: { category: 'Editor', subCategory: 'Live Editor' },
  COORDINATOR: { category: 'Assistant', subCategory: 'Coordinator' },
  OTHER: { category: 'Other', subCategory: 'Other' },
};

const toNumber = (value: string | number | null | undefined) => {
  const next = Number(value ?? 0);
  return Number.isFinite(next) ? next : 0;
};

function backendStatusToWorking(status: BackendFreelancerStatus): Freelancer['workingStatus'] {
  if (status === 'ACTIVE') return 'active';
  if (status === 'UNAVAILABLE') return 'unavailable';
  if (status === 'SUSPENDED') return 'suspended';
  return 'inactive';
}

function frontendStatusToBackend(freelancer: Freelancer): BackendFreelancerStatus {
  const working = freelancer.workingStatus;
  if (working === 'unavailable') return 'UNAVAILABLE';
  if (working === 'suspended') return 'SUSPENDED';
  if (freelancer.status === 'active' || working === 'active') return 'ACTIVE';
  return 'INACTIVE';
}

function paymentMethodFromBackend(method?: BackendPaymentMethod | null): Freelancer['paymentMethod'] {
  if (method === 'BANK_TRANSFER' || method === 'CREDIT_CARD' || method === 'DEBIT_CARD' || method === 'CHEQUE') return 'Bank Transfer';
  if (method === 'CASH') return 'Cash';
  if (method === 'UPI') return 'UPI';
  return 'Other';
}

function paymentMethodToBackend(method: Freelancer['paymentMethod']): BackendPaymentMethod {
  if (method === 'Bank Transfer') return 'BANK_TRANSFER';
  if (method === 'Cash') return 'CASH';
  if (method === 'UPI') return 'UPI';
  return 'OTHER';
}

function rateTypeFor(freelancer: Freelancer): BackendRateType {
  if (freelancer.perDayCharges > 0) return 'PER_DAY';
  if (freelancer.halfDayCharges > 0) return 'PER_HALF_DAY';
  if (freelancer.eventCharges > 0) return 'PER_EVENT';
  if (freelancer.extraHourCharges > 0 || freelancer.overtimeCharges > 0) return 'PER_HOUR';
  return 'FIXED';
}

function rateValueFor(freelancer: Freelancer): number | undefined {
  return (
    freelancer.perDayCharges ||
    freelancer.halfDayCharges ||
    freelancer.eventCharges ||
    freelancer.extraHourCharges ||
    freelancer.overtimeCharges ||
    freelancer.otherCharges ||
    undefined
  );
}

function crewRoleFor(freelancer: Freelancer): BackendCrewRole {
  const value = `${freelancer.mainCategory} ${freelancer.subCategory}`.toLowerCase();
  if (value.includes('candid')) return 'CANDID_PHOTOGRAPHER';
  if (value.includes('traditional') && value.includes('photo')) return 'TRADITIONAL_PHOTOGRAPHER';
  if (value.includes('lead') && value.includes('photo')) return 'LEAD_PHOTOGRAPHER';
  if (value.includes('photo')) return 'CANDID_PHOTOGRAPHER';
  if (value.includes('drone') || value.includes('fpv')) return 'DRONE_OPERATOR';
  if (value.includes('cinema')) return 'CINEMATOGRAPHER';
  if (value.includes('traditional') && value.includes('video')) return 'TRADITIONAL_VIDEOGRAPHER';
  if (value.includes('video')) return 'TRADITIONAL_VIDEOGRAPHER';
  if (value.includes('light')) return 'LIGHT_ASSISTANT';
  if (value.includes('assist')) return 'ASSISTANT';
  if (value.includes('edit')) return 'LIVE_EDITOR';
  if (value.includes('coordinator')) return 'COORDINATOR';
  return 'OTHER';
}

function equipmentNotesFrom(freelancer: Freelancer): string | undefined {
  const parts = [
    freelancer.equipmentAvailable && `Equipment: ${freelancer.equipmentAvailable}`,
    freelancer.cameraDetails && `Camera: ${freelancer.cameraDetails}`,
    freelancer.lensDetails && `Lens: ${freelancer.lensDetails}`,
    freelancer.otherEquipment && `Other: ${freelancer.otherEquipment}`,
  ].filter(Boolean);
  return parts.length ? parts.join('\n') : undefined;
}

export function backendFreelancerToView(row: BackendFreelancer): Freelancer {
  const role = row.primarySkill ? roleLabels[row.primarySkill] : roleLabels.OTHER;
  const rate = toNumber(row.rate);
  const workingStatus = backendStatusToWorking(row.status);
  return {
    id: row.id,
    freelancerId: row.code,
    name: row.fullName,
    mobile: row.phone,
    whatsapp: row.whatsapp || row.phone,
    email: row.email || '',
    address: row.addressLine || '',
    city: row.city || '',
    emergencyContact: '',
    joiningDate: row.createdAt?.slice(0, 10) || new Date().toISOString().slice(0, 10),
    status: row.status === 'ACTIVE' ? 'active' : 'inactive',
    applicationStatus: 'approved',
    workingStatus,
    preferredTier: 'new',
    rating: toNumber(row.rating) || undefined,
    travelAvailability: row.travelAvailable ?? false,
    maxShootsPerDay: row.maxShootsPerDay ?? 1,
    gstNumber: row.gstNumber || '',
    panNumber: row.panNumber || '',
    mainCategory: role.category,
    subCategory: role.subCategory,
    experienceYears: row.experienceYears ?? 0,
    skills: row.skills || [],
    equipmentAvailable: row.equipmentNotes || '',
    cameraDetails: '',
    lensDetails: '',
    otherEquipment: '',
    perDayCharges: row.rateType === 'PER_DAY' ? rate : 0,
    halfDayCharges: row.rateType === 'PER_HALF_DAY' ? rate : 0,
    eventCharges: row.rateType === 'PER_EVENT' || row.rateType === 'FIXED' ? rate : 0,
    overtimeCharges: row.rateType === 'PER_HOUR' ? rate : 0,
    extraHourCharges: 0,
    travelCharges: 0,
    otherCharges: 0,
    notes: row.notes || '',
    paymentMethod: paymentMethodFromBackend(row.paymentMethod),
    upiId: row.upiId || '',
    bankName: row.bankName || '',
    accountHolderName: row.accountHolder || '',
    accountNumber: row.accountNumber || '',
    ifsc: row.ifsc || '',
    paymentNotes: '',
    availabilityStatus: workingStatus === 'unavailable' ? 'Unavailable' : workingStatus === 'active' ? 'Available' : undefined,
    documents: [],
  };
}

export function viewFreelancerToBackend(freelancer: Freelancer): FreelancerInput {
  return {
    fullName: freelancer.name.trim(),
    phone: freelancer.mobile.trim(),
    whatsapp: freelancer.whatsapp?.trim() || undefined,
    email: freelancer.email?.trim() || undefined,
    city: freelancer.city?.trim() || undefined,
    addressLine: freelancer.address?.trim() || undefined,
    primarySkill: crewRoleFor(freelancer),
    skills: freelancer.skills || [],
    experienceYears: freelancer.experienceYears,
    rate: rateValueFor(freelancer),
    rateType: rateTypeFor(freelancer),
    travelAvailable: freelancer.travelAvailability,
    maxShootsPerDay: freelancer.maxShootsPerDay,
    equipmentNotes: equipmentNotesFrom(freelancer),
    paymentMethod: paymentMethodToBackend(freelancer.paymentMethod),
    upiId: freelancer.upiId?.trim() || undefined,
    bankName: freelancer.bankName?.trim() || undefined,
    accountHolder: freelancer.accountHolderName?.trim() || undefined,
    accountNumber: freelancer.accountNumber?.trim() || undefined,
    ifsc: freelancer.ifsc?.trim() || undefined,
    panNumber: freelancer.panNumber?.trim() || undefined,
    gstNumber: freelancer.gstNumber?.trim() || undefined,
    notes: freelancer.notes?.trim() || undefined,
    status: frontendStatusToBackend(freelancer),
  };
}
