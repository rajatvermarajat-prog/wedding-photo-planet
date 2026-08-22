/**
 * Contract for a future Freelancer Portal (separate app).
 * Admin CRM remains the source of truth. Do not invent a messaging UI here.
 */
import { Freelancer, FreelancerAssignment, FreelancerPayment } from '@/types';

export type FreelancerPortalAuth = {
  freelancerId: string;
  mobile: string;
  email: string;
};

export type FreelancerRegistrationDraft = Pick<
  Freelancer,
  'name' | 'mobile' | 'email' | 'city' | 'mainCategory' | 'subCategory' | 'skills' | 'experienceYears' | 'bio'
> & {
  passwordOrOtp?: string;
};

export type FreelancerPortalDashboard = {
  upcoming: FreelancerAssignment[];
  today: FreelancerAssignment[];
  invitations: FreelancerAssignment[];
  pendingPayments: number;
  recentPayments: FreelancerPayment[];
};

export type FreelancerNotificationType =
  | 'invitation'
  | 'assignment_confirmed'
  | 'rescheduled'
  | 'cancelled'
  | 'payment_released'
  | 'payment_pending'
  | 'verification'
  | 'document_required'
  | 'availability_conflict';

export type FreelancerMatchQuery = {
  role?: string;
  city?: string;
  dateKey?: string;
  minExperience?: number;
  minRating?: number;
  maxBudget?: number;
};
