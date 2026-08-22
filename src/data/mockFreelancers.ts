import { 
  Freelancer, 
  FreelancerCategory, 
  FreelancerAssignment, 
  FreelancerPayment, 
  FreelancerAttendance, 
  FreelancerDataReceived, 
  FreelancerActivityLog 
} from '@/types';
import { DEFAULT_FREELANCER_CATEGORIES } from '@/features/freelancers/freelancerDomain';

export const INITIAL_FREELANCER_CATEGORIES: FreelancerCategory[] = DEFAULT_FREELANCER_CATEGORIES;

export const INITIAL_FREELANCERS: Freelancer[] = [];

export const INITIAL_FREELANCER_ASSIGNMENTS: FreelancerAssignment[] = [];

export const INITIAL_FREELANCER_PAYMENTS: FreelancerPayment[] = [];

export const INITIAL_FREELANCER_ATTENDANCE: FreelancerAttendance[] = [];

export const INITIAL_FREELANCER_DATA_RECEIVED: FreelancerDataReceived[] = [];

export const INITIAL_FREELANCER_LOGS: FreelancerActivityLog[] = [];
