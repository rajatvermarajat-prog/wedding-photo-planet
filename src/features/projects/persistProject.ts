import { ApiError } from '@/lib/api/client';
import { clientsApi } from '@/lib/api/clients';
import { projectsApi } from '@/lib/api/projects';
import type { Project, TeamMember } from '@/types';
import { FREELANCER_ASSIGNEE, UNASSIGNED_ASSIGNEE } from './assigneeOptions';
import { isPersistedProjectId, toCreateProjectInput, toUpdateProjectInput } from './projectViewModel';
import { usersApi } from '@/lib/api/users';
import { normalizeTeamMember } from '@/features/team/teamViewModel';

function digits(value: string) {
  return value.replace(/\D/g, '');
}

function assignedTaskPayloads(project: Project, team: TeamMember[]) {
  return (project.tasks || [])
    .filter((task) => task.taskName?.trim())
    .map((task) => {
      const name = (task.assignedTo || '').trim();
      const member = team.find((row) => row.id === task.assignedToId || row.name === name);
      return {
        title: task.taskName.trim(),
        quantity: task.quantity || 1,
        unit: task.unit || undefined,
        assigneeId: (task.assignedToId && isPersistedProjectId(task.assignedToId) && task.assignedToId)
          || (member && isPersistedProjectId(member.id) ? member.id : undefined),
      };
    });
}

export function assignedNames(project: Project) {
  return [...new Set(
    (project.tasks || [])
      .map((task) => (task.assignedTo || '').trim())
      .filter((name) => name && name !== UNASSIGNED_ASSIGNEE && name !== FREELANCER_ASSIGNEE),
  )];
}

async function ensureClientId(project: Project): Promise<string> {
  const displayName = project.clientWeddingTitle.trim();
  const primaryPhone = project.clientContactMobile.trim();
  if (!displayName) throw new Error('Enter the client / wedding title.');
  if (!primaryPhone) throw new Error('Enter the client mobile number so the project can be saved.');

  try {
    const listed = await clientsApi.list({ search: primaryPhone, limit: 50 });
    const match = listed.data.find((client) => {
      const phoneMatch = digits(client.primaryPhone) === digits(primaryPhone) && digits(primaryPhone).length >= 6;
      return phoneMatch || client.displayName.trim().toLowerCase() === displayName.toLowerCase();
    });
    if (match) return match.id;
  } catch (error) {
    if (!(error instanceof ApiError) || (error.status !== 403 && error.status !== 401)) throw error;
  }

  return (await clientsApi.create({ displayName, primaryPhone })).id;
}

export async function persistStudioProject(project: Project, team: TeamMember[] = []): Promise<Project> {
  let roster = team;
  if (!roster.length) {
    try {
      const listed = await usersApi.list({ page: 1, limit: 100 });
      roster = listed.items.map(normalizeTeamMember);
    } catch {
      roster = [];
    }
  }
  if (isPersistedProjectId(project.id)) {
    const dto = await projectsApi.update(project.id, toUpdateProjectInput(project));
    return { ...project, id: dto.id, name: dto.name };
  }
  const clientId = await ensureClientId(project);
  const input = toCreateProjectInput(project, clientId);
  const tasks = assignedTaskPayloads(project, roster);
  const dto = await projectsApi.create({ ...input, tasks: tasks.length ? tasks : undefined });
  return { ...project, id: dto.id, name: dto.name };
}
