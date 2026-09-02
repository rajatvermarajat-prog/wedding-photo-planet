import { ApiError } from '@/lib/api/client';
import { clientsApi } from '@/lib/api/clients';
import { projectsApi } from '@/lib/api/projects';
import type { Project, TeamMember } from '@/types';
import { FREELANCER_ASSIGNEE, UNASSIGNED_ASSIGNEE } from './assigneeOptions';
import { isPersistedProjectId, toCreateProjectInput, toUpdateProjectInput } from './projectViewModel';
import { usersApi } from '@/lib/api/users';
import { normalizeTeamMember } from '@/features/team/teamViewModel';
import { indianMobileError } from '@/lib/validation/indianMobile';
import { loadProjectTasks, persistProjectTasks } from './persistProjectTasks';
import { assertProjectShootTimes, persistProjectShoots, toShootEvent } from '@/features/shoots/persistShoots';
import { shootsApi } from '@/lib/api/shoots';
import type { BackendProjectStatus } from '@/lib/api/projects';

function backendStatus(status: Project['status']): BackendProjectStatus {
  return status === 'completed' ? 'COMPLETED'
    : status === 'ready_to_deliver' ? 'DELIVERY'
    : status === 'pending' ? 'CANCELLED'
    : status === 'running' ? 'CONFIRMED'
    : 'LEAD';
}

function digits(value: string) {
  return value.replace(/\D/g, '');
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
  const mobileError = indianMobileError(primaryPhone, true);
  if (mobileError) throw new Error(mobileError);

  try {
    const listed = await clientsApi.list({ search: primaryPhone, limit: 50 });
    const match = listed.data.find((client) => {
      const phoneMatch = digits(client.primaryPhone) === primaryPhone;
      return phoneMatch || client.displayName.trim().toLowerCase() === displayName.toLowerCase();
    });
    if (match) return match.id;
  } catch (error) {
    if (!(error instanceof ApiError) || (error.status !== 403 && error.status !== 401)) throw error;
  }

  return (await clientsApi.create({ displayName, primaryPhone })).id;
}

export async function persistStudioProject(project: Project, team: TeamMember[] = []): Promise<Project> {
  // Do this before client/project creation. The database enforces the same
  // invariant; checking here avoids a partial Project create followed by a
  // generic 422 from POST /shoots.
  assertProjectShootTimes(project.shoots || []);
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
    const [previousTasks, previousShoots] = await Promise.all([
      loadProjectTasks(project.id),
      shootsApi.list({ projectId: project.id, page: 1, limit: 100, sortBy: 'createdAt', sortOrder: 'asc' }).then((result) => result.items.map(toShootEvent)),
    ]);
    const dto = await projectsApi.update(project.id, toUpdateProjectInput(project));
    const base = { ...project, id: dto.id, name: dto.name, clientId: dto.client?.id ?? project.clientId };
    if (base.clientId) {
      await clientsApi.update(base.clientId, {
        displayName: project.clientWeddingTitle.trim(),
        primaryPhone: project.clientContactMobile.trim(),
      });
    }
    const targetStatus = backendStatus(project.status);
    if (dto.status !== targetStatus) await projectsApi.changeStatus(base.id, { status: targetStatus });
    // Both existing endpoints merge into the same metadata column. Run them
    // in order so neither can overwrite custom-service details or quotation
    // metadata read by the other request.
    await projectsApi.updateDataBackup(base.id, project.dataBackup);
    await projectsApi.updateDeliveries(base.id, project.deliveryStatus);
    const [tasks, shoots] = await Promise.all([
      persistProjectTasks(base.id, project.tasks || [], previousTasks, roster),
      persistProjectShoots(base, { ...base, shoots: previousShoots }, roster),
    ]);
    return { ...base, tasks, shoots: shoots.shoots, dataBackup: shoots.dataBackup };
  }
  const clientId = await ensureClientId(project);
  const input = toCreateProjectInput(project, clientId);
  const dto = await projectsApi.create(input);
  // The caller needs the client id to record the booking advance against the
  // new project, so hand it back rather than making it look it up again.
  const base = { ...project, id: dto.id, name: dto.name, clientId: dto.client?.id ?? clientId };
  const targetStatus = backendStatus(project.status);
  if (dto.status !== targetStatus) await projectsApi.changeStatus(base.id, { status: targetStatus });
  await projectsApi.updateDataBackup(base.id, project.dataBackup);
  await projectsApi.updateDeliveries(base.id, project.deliveryStatus);
  const [tasks, shoots] = await Promise.all([
    persistProjectTasks(base.id, project.tasks || [], [], roster),
    persistProjectShoots(base, undefined, roster),
  ]);
  return { ...base, tasks, shoots: shoots.shoots, dataBackup: shoots.dataBackup };
}
