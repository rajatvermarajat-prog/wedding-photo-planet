import { PortalFreelancer } from '@/lib/api/freelancerPortal';

export interface CompletionResult {
  percentage: number;
  completed: string[];
  missing: string[];
}

const checks: Array<[label: string, isComplete: (profile: PortalFreelancer) => boolean]> = [
  ['Basic contact details', (p) => Boolean(p.fullName && p.phone && p.email)],
  ['City or service location', (p) => Boolean(p.city)],
  ['Specialization', (p) => Boolean(p.primarySkill)],
  ['Experience', (p) => typeof p.experienceYears === 'number' && p.experienceYears >= 0],
  ['Skills', (p) => Array.isArray(p.skills) && p.skills.length > 0],
  ['Equipment notes', (p) => Boolean(p.equipmentNotes)],
  ['Portfolio', (p) => p.portfolioItems.some((item) => item.isPublished)],
  ['Availability', (p) => p.availability.length > 0],
];

export function getFreelancerProfileCompletion(profile: PortalFreelancer): CompletionResult {
  const completed = checks.filter(([, check]) => check(profile)).map(([label]) => label);
  const missing = checks.filter(([, check]) => !check(profile)).map(([label]) => label);
  return {
    completed,
    missing,
    percentage: Math.round((completed.length / checks.length) * 100),
  };
}
