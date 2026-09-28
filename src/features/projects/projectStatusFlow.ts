import type { BackendProjectStatus } from '@/lib/api/projects';
import type { ProjectStatus } from '@/types';

const ACTIVE_BACKEND_STATUSES: BackendProjectStatus[] = ['CONFIRMED', 'PLANNING', 'SHOOTING', 'EDITING'];

const ALLOWED_TRANSITIONS: Record<BackendProjectStatus, BackendProjectStatus[]> = {
  UPCOMING: ['CONFIRMED', 'CANCELLED'],
  LEAD: ['CONFIRMED', 'CANCELLED'],
  CONFIRMED: ['UPCOMING', 'PLANNING', 'SHOOTING', 'CANCELLED'],
  PLANNING: ['SHOOTING', 'CANCELLED'],
  SHOOTING: ['EDITING', 'CANCELLED'],
  EDITING: ['DELIVERY', 'CANCELLED'],
  DELIVERY: ['COMPLETED', 'EDITING', 'CANCELLED'],
  COMPLETED: ['DELIVERY'],
  CANCELLED: [],
};

function targetBackendStatus(current: BackendProjectStatus, status: ProjectStatus): BackendProjectStatus {
  if (status === 'new_project') return 'UPCOMING';
  if (status === 'ready_to_deliver') return 'DELIVERY';
  if (status === 'completed') return 'COMPLETED';
  if (status === 'pending') return 'CANCELLED';
  if (status === 'running') {
    return ACTIVE_BACKEND_STATUSES.includes(current) ? current : 'CONFIRMED';
  }
  return current;
}

export function projectStatusChangeSteps(
  current: BackendProjectStatus,
  status: ProjectStatus,
): BackendProjectStatus[] {
  const target = targetBackendStatus(current, status);
  if (current === target) return [];

  const queue: Array<{ status: BackendProjectStatus; path: BackendProjectStatus[] }> = [{ status: current, path: [] }];
  const seen = new Set<BackendProjectStatus>([current]);

  for (const item of queue) {
    for (const next of ALLOWED_TRANSITIONS[item.status]) {
      if (seen.has(next)) continue;
      const path = [...item.path, next];
      if (next === target) return path;
      seen.add(next);
      queue.push({ status: next, path });
    }
  }

  return [target];
}
