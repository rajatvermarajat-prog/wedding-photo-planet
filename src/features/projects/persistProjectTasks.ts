import { ApiError } from '@/lib/api/client';
import { tasksApi, type BackendTask, type BackendTaskStatus } from '@/lib/api/tasks';
import type { EditingStatus, ProjectTask, TeamMember } from '@/types';
import { isPersistedProjectId } from './projectViewModel';
import { FREELANCER_ASSIGNEE, UNASSIGNED_ASSIGNEE } from './assigneeOptions';

/**
 * The project workspace speaks `ProjectTask`; the API speaks `BackendTask`.
 * Only the statuses the tasks tab can actually produce are mapped — the
 * backend's PAUSED / IN_REVIEW / CANCELLED are preserved on read rather than
 * being flattened into `not_started` on the next save.
 */
const TO_BACKEND: Record<string, BackendTaskStatus> = {
  not_started: 'TODO',
  in_progress: 'IN_PROGRESS',
  client_review: 'IN_REVIEW',
  revision: 'IN_PROGRESS',
  completed: 'COMPLETED',
};

const FROM_BACKEND: Record<BackendTaskStatus, EditingStatus> = {
  TODO: 'not_started',
  ASSIGNED: 'not_started',
  IN_PROGRESS: 'in_progress',
  PAUSED: 'in_progress',
  IN_REVIEW: 'client_review',
  COMPLETED: 'completed',
  CANCELLED: 'not_started',
};

export function toProjectTask(dto: BackendTask): ProjectTask {
  return {
    id: dto.id,
    taskName: dto.title,
    quantity: dto.quantity ?? 1,
    unit: dto.unit ?? undefined,
    assignedTo: dto.assignee?.fullName || UNASSIGNED_ASSIGNEE,
    assignedToId: dto.assigneeId ?? undefined,
    status: FROM_BACKEND[dto.status] ?? 'not_started',
    notes: dto.description ?? undefined,
    category: dto.category,
    completedAt: dto.completedAt ?? undefined,
  };
}

/** Reads the tasks that actually belong to this project. */
export async function loadProjectTasks(projectId: string): Promise<ProjectTask[]> {
  const listed = await tasksApi.list({ projectId, page: 1, limit: 100 });
  return listed.items.map(toProjectTask);
}

/** Resolves the row's assignee to a real user id, or undefined when unassigned. */
function assigneeIdFor(task: ProjectTask, team: TeamMember[]): string | undefined {
  if (task.assignedToId && isPersistedProjectId(task.assignedToId)) return task.assignedToId;
  const name = (task.assignedTo || '').trim();
  if (!name || name === UNASSIGNED_ASSIGNEE || name === FREELANCER_ASSIGNEE) return undefined;
  const member = team.find((row) => row.name.trim().toLowerCase() === name.toLowerCase());
  return member && isPersistedProjectId(member.id) ? member.id : undefined;
}

const statusOf = (task: ProjectTask) => TO_BACKEND[task.status] ?? 'TODO';

/**
 * Diffs the edited rows against what the API already holds: rows the user
 * removed are deleted, new rows are created, and changed rows are patched.
 * A row whose only change is its assignee goes through the dedicated reassign
 * route, because `updateTaskSchema` deliberately omits `assigneeId`.
 */
export async function persistProjectTasks(
  projectId: string,
  rows: ProjectTask[],
  previous: ProjectTask[],
  team: TeamMember[] = [],
): Promise<ProjectTask[]> {
  if (!isPersistedProjectId(projectId)) return rows;

  const keep = new Set(rows.map((row) => row.id).filter(isPersistedProjectId));
  for (const row of previous) {
    if (!isPersistedProjectId(row.id) || keep.has(row.id)) continue;
    try {
      await tasksApi.remove(row.id);
    } catch (error) {
      if (!(error instanceof ApiError) || error.status !== 403) throw error;
    }
  }

  const previousById = new Map(previous.map((row) => [row.id, row]));

  for (const row of rows) {
    const title = row.taskName?.trim();
    if (!title) continue;
    const assigneeId = assigneeIdFor(row, team);

    if (!isPersistedProjectId(row.id)) {
      const created = await tasksApi.create({
        title,
        projectId,
        quantity: row.quantity || 1,
        unit: row.unit || undefined,
        description: row.notes || undefined,
        ...(assigneeId ? { assigneeId } : {}),
      });
      if (statusOf(row) !== 'TODO') await tasksApi.changeStatus(created.id, statusOf(row));
      continue;
    }

    const before = previousById.get(row.id);
    const fieldsChanged =
      !before ||
      before.taskName !== title ||
      (before.quantity || 1) !== (row.quantity || 1) ||
      (before.unit || '') !== (row.unit || '') ||
      (before.notes || '') !== (row.notes || '');
    if (fieldsChanged) {
      await tasksApi.update(row.id, { title, quantity: row.quantity || 1, unit: row.unit || undefined, description: row.notes || undefined });
    }
    if (before && before.status !== row.status) {
      await tasksApi.changeStatus(row.id, statusOf(row));
    }
    if (assigneeId && before?.assignedToId !== assigneeId) {
      try {
        await tasksApi.reassign(row.id, assigneeId, 'Reassigned from the project workspace');
      } catch (error) {
        if (!(error instanceof ApiError) || error.status !== 403) throw error;
      }
    }
  }

  return loadProjectTasks(projectId);
}
