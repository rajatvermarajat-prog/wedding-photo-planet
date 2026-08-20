import { 
  Freelancer, 
  FreelancerCategory, 
  FreelancerAssignment, 
  FreelancerPayment, 
  FreelancerAttendance, 
  FreelancerDataReceived, 
  FreelancerActivityLog 
} from '@/types';

export const INITIAL_FREELANCER_CATEGORIES: FreelancerCategory[] = [
  {
    id: 'cat-1',
    name: 'Photographer',
    subCategories: ['Candid Photographer', 'Traditional Photographer', 'Portrait Specialist'],
    isActive: true,
    description: 'Still photography experts for wedding rituals, portraits, and traditional coverage.'
  },
  {
    id: 'cat-2',
    name: 'Videographer',
    subCategories: ['Traditional Videographer', 'Candid Cinematographer', 'Video Operator'],
    isActive: true,
    description: 'High definition video camera operators, teasers and film creators.'
  },
  {
    id: 'cat-3',
    name: 'Drone Operator',
    subCategories: ['FPV Drone Pilot', 'Standard 4K Drone Operator'],
    isActive: true,
    description: 'Aerial videographers and FPV action pilots for grand venues and couple entries.'
  },
  {
    id: 'cat-4',
    name: 'Assistant',
    subCategories: ['Lighting Assistant', 'Gimbal Assistant', 'General Helper', 'Technical Support'],
    isActive: true,
    description: 'Lighting crew, camera assistants, gimbal helpers and on-site support.'
  },
  {
    id: 'cat-5',
    name: 'Other',
    subCategories: ['On-Location Editor', 'Reels Maker', 'Album Designer', 'Misc Crew'],
    isActive: true,
    description: 'Editors, reels makers, album designers, and miscellaneous production roles.'
  }
];

export const INITIAL_FREELANCERS: Freelancer[] = [];

export const INITIAL_FREELANCER_ASSIGNMENTS: FreelancerAssignment[] = [];

export const INITIAL_FREELANCER_PAYMENTS: FreelancerPayment[] = [];

export const INITIAL_FREELANCER_ATTENDANCE: FreelancerAttendance[] = [];

export const INITIAL_FREELANCER_DATA_RECEIVED: FreelancerDataReceived[] = [];

export const INITIAL_FREELANCER_LOGS: FreelancerActivityLog[] = [];
