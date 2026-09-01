import { ApiError } from '@/lib/api/client';
import { shootsApi, type BackendCrewRole, type BackendShoot, type BackendShootStatus } from '@/lib/api/shoots';
import type { CrewMemberAssignment, DataBackup, Project, ShootEvent, TeamMember } from '@/types';
import { firstIsoDate, isPersistedProjectId } from '@/features/projects/projectViewModel';

function toCrewRole(role: string): BackendCrewRole {
  const value = role.toLowerCase();
  if (value.includes('drone')) return 'DRONE_OPERATOR';
  if (value.includes('cinema')) return 'CINEMATOGRAPHER';
  if (value.includes('video') || value.includes('videograph')) return 'TRADITIONAL_VIDEOGRAPHER';
  if (value.includes('candid')) return 'CANDID_PHOTOGRAPHER';
  if (value.includes('light')) return 'LIGHT_ASSISTANT';
  if (value.includes('assist')) return 'ASSISTANT';
  if (value.includes('editor') || value.includes('live')) return 'LIVE_EDITOR';
  if (value.includes('coord')) return 'COORDINATOR';
  if (value.includes('photo')) return 'LEAD_PHOTOGRAPHER';
  return 'OTHER';
}

function fromCrewRole(role: string): string {
  const labels: Record<string, string> = {
    LEAD_PHOTOGRAPHER: 'Photographer',
    CANDID_PHOTOGRAPHER: 'Candid Photographer',
    TRADITIONAL_PHOTOGRAPHER: 'Photographer',
    CINEMATOGRAPHER: 'Cinematographer',
    TRADITIONAL_VIDEOGRAPHER: 'Videographer',
    DRONE_OPERATOR: 'Drone Operator',
    ASSISTANT: 'Assistant',
    LIGHT_ASSISTANT: 'Assistant',
    LIVE_EDITOR: 'Editor / Live',
    COORDINATOR: 'Coordinator',
    OTHER: 'Team Member',
  };
  return labels[role] || role;
}

function toShootStatus(status?: ShootEvent['status']): BackendShootStatus {
  if (status === 'completed') return 'COMPLETED';
  if (status === 'cancelled') return 'CANCELLED';
  return 'SCHEDULED';
}

function fromShootStatus(status: BackendShoot['status']): ShootEvent['status'] {
  if (status === 'COMPLETED') return 'completed';
  if (status === 'CANCELLED') return 'cancelled';
  return 'scheduled';
}

function num(value: string | number | null | undefined) {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

function mainCrew(rows: CrewMemberAssignment[]) {
  return rows.filter((row) => !row.role?.toLowerCase().includes('assistant'));
}

function crewRows(shoot: ShootEvent): CrewMemberAssignment[] {
  const rows = [...(shoot.crewAssignments || [])];
  ([
    ['Photographer', shoot.leadPhotographer],
    ['Cinematographer', shoot.cinematographer],
    ['Drone Operator', shoot.droneOperator],
    ['Assistant', shoot.assistant],
  ] as const).forEach(([role, name]) => {
    if (!name?.trim()) return;
    if (rows.some((row) => row.name.trim().toLowerCase() === name.trim().toLowerCase())) return;
    rows.push({ id: `named-${role}`, name: name.trim(), role });
  });
  return rows.filter((row) => row.name?.trim());
}

function memberId(crew: CrewMemberAssignment, team: TeamMember[]) {
  if (isPersistedProjectId(crew.id) && team.some((row) => row.id === crew.id)) return crew.id;
  const name = crew.name.trim().toLowerCase();
  return team.find((row) => row.name.trim().toLowerCase() === name)?.id;
}

export function backupFromShoots(shoots: ShootEvent[], existing?: DataBackup): DataBackup {
  const crew = mainCrew(shoots.flatMap((shoot) => shoot.crewAssignments || []));
  const copies = [...new Set(crew.map((row) => (row.copyInHD || row.hardDriveName || '').trim()).filter(Boolean))];
  const backups = [...new Set(crew.map((row) => (row.backupInHD || '').trim()).filter(Boolean))];
  const received = crew.length > 0 && crew.every((row) => row.dataReceived);
  const total = crew.reduce((sum, row) => sum + (row.dataSizeGB || 0), 0);
  const shootReceived = shoots.some((shoot) => shoot.dataReceivedAt);
  const shootBackedUp = shoots.length > 0 && shoots.every((shoot) => shoot.backupDoneAt);
  return {
    offloadedFromCards: received || shootReceived,
    hardDrive1: copies.join(', ') || existing?.hardDrive1 || '',
    hardDrive1Done: received || shootReceived,
    hardDrive2: backups.join(', ') || existing?.hardDrive2 || '',
    hardDrive2Done: shootBackedUp,
    cloudBackupDone: !!existing?.cloudBackupDone,
    cloudBackupLink: existing?.cloudBackupLink,
    totalDataSizeGB: total || existing?.totalDataSizeGB || 0,
    rawCleanupStatus: existing?.rawCleanupStatus || 'not_cleaned',
  };
}

export function toShootEvent(dto: BackendShoot): ShootEvent {
  const assignments = dto.assignments || [];
  const crew = assignments.map((row) => ({
    id: row.id,
    name: row.user?.fullName || row.freelancer?.fullName || '',
    role: fromCrewRole(row.role),
    dataReceived: !!row.dataReceived,
    dataSizeGB: num(row.dataSizeGb),
    copyInHD: row.storageReference || '',
    hardDriveName: row.storageReference || '',
    backupInHD: row.notes || '',
  }));
  const photographer = crew.find((row) => /photo/i.test(row.role))?.name;
  const cinematographer = crew.find((row) => /cinema|video/i.test(row.role))?.name;
  const drone = crew.find((row) => /drone/i.test(row.role))?.name;
  const assistant = crew.find((row) => /assist/i.test(row.role))?.name;
  const date = String(dto.shootDate || '').slice(0, 10);
  return {
    id: dto.id,
    title: dto.title,
    date,
    time: '',
    venue: dto.location || dto.city || '',
    location: dto.location || '',
    leadPhotographer: photographer,
    cinematographer,
    droneOperator: drone,
    assistant,
    crewAssignments: crew,
    status: fromShootStatus(dto.status),
    notes: dto.notes || undefined,
    dataReceivedAt: dto.dataReceivedAt || undefined,
    backupDoneAt: dto.backupDoneAt || undefined,
  };
}

export function attachShoots(projects: Project[], shoots: BackendShoot[]): Project[] {
  const byProject = new Map<string, ShootEvent[]>();
  shoots.forEach((shoot) => {
    const list = byProject.get(shoot.projectId) || [];
    list.push(toShootEvent(shoot));
    byProject.set(shoot.projectId, list);
  });
  return projects.map((project) => {
    // API is authoritative: an empty list must clear a previously deleted
    // shoot instead of retaining stale project-local data.
    const nextShoots = byProject.get(project.id) || [];
    return { ...project, shoots: nextShoots, dataBackup: backupFromShoots(nextShoots, project.dataBackup) };
  });
}

async function syncAssignments(shootId: string, shoot: ShootEvent, previous: ShootEvent | undefined, team: TeamMember[]) {
  const next = crewRows(shoot);
  const prev = previous ? crewRows(previous) : [];
  const keep = new Set(next.map((row) => row.id).filter((id) => isPersistedProjectId(id)));

  for (const row of prev) {
    if (!isPersistedProjectId(row.id) || keep.has(row.id)) continue;
    try {
      await shootsApi.removeAssignment(shootId, row.id);
    } catch (error) {
      if (!(error instanceof ApiError) || error.status !== 403) throw error;
    }
  }

  for (const row of next) {
    if (isPersistedProjectId(row.id)) continue;
    const userId = memberId(row, team);
    if (!userId) continue;
    try {
      await shootsApi.assign(shootId, { userId, role: toCrewRole(row.role) });
    } catch (error) {
      if (!(error instanceof ApiError) || (error.status !== 409 && error.status !== 403)) throw error;
    }
  }
}

async function syncAssignmentData(shootId: string, shoot: ShootEvent, backup?: DataBackup) {
  const rows = crewRows(shoot).filter((row) => isPersistedProjectId(row.id));
  for (const row of rows) {
    try {
      await shootsApi.updateAssignment(shootId, row.id, {
        dataReceived: !!row.dataReceived,
        dataSizeGb: String(row.dataSizeGB || 0),
        storageReference: (row.copyInHD || row.hardDriveName || '').slice(0, 160),
        notes: (row.backupInHD || '').slice(0, 2000),
      });
    } catch (error) {
      if (!(error instanceof ApiError) || error.status !== 403) throw error;
    }
  }
  const received = rows.length > 0 && mainCrew(rows).every((row) => row.dataReceived);
  const totalGb = mainCrew(rows).reduce((sum, row) => sum + (row.dataSizeGB || 0), 0);
  try {
    await shootsApi.update(shootId, {
      dataSizeGb: String(totalGb),
      ...(received ? { dataReceivedAt: shoot.dataReceivedAt || new Date().toISOString() } : {}),
      ...(backup?.hardDrive2Done ? { backupDoneAt: shoot.backupDoneAt || new Date().toISOString() } : {}),
    });
  } catch (error) {
    if (!(error instanceof ApiError) || error.status !== 403) throw error;
  }
}

async function reloadProjectShoots(project: Project, fallback: ShootEvent[]): Promise<Project> {
  try {
    const listed = await shootsApi.list({ projectId: project.id, page: 1, limit: 100 });
    const shoots = listed.items.map(toShootEvent);
    return { ...project, shoots, dataBackup: backupFromShoots(shoots, project.dataBackup) };
  } catch {
    return { ...project, shoots: fallback, dataBackup: backupFromShoots(fallback, project.dataBackup) };
  }
}

export async function persistShootDataHandover(project: Project): Promise<Project> {
  if (!isPersistedProjectId(project.id)) return project;
  const nextShoots: ShootEvent[] = [];
  for (const shoot of project.shoots || []) {
    if (!isPersistedProjectId(shoot.id)) {
      nextShoots.push(shoot);
      continue;
    }
    await syncAssignmentData(shoot.id, shoot, project.dataBackup);
    nextShoots.push(shoot);
  }
  return reloadProjectShoots(project, nextShoots);
}

export async function persistProjectShoots(
  project: Project,
  previous: Project | undefined,
  team: TeamMember[],
): Promise<Project> {
  if (!isPersistedProjectId(project.id)) return project;
  const nextShoots: ShootEvent[] = [];
  const previousById = new Map((previous?.shoots || []).map((shoot) => [shoot.id, shoot]));
  const nextIds = new Set((project.shoots || []).map((shoot) => shoot.id));

  for (const shoot of previous?.shoots || []) {
    if (nextIds.has(shoot.id) || !isPersistedProjectId(shoot.id)) continue;
    try {
      await shootsApi.remove(shoot.id);
    } catch (error) {
      if (!(error instanceof ApiError) || error.status !== 403) throw error;
    }
  }

  for (const shoot of project.shoots || []) {
    const date = firstIsoDate(shoot.date);
    if (!date) {
      nextShoots.push(shoot);
      continue;
    }
    const payload = {
      title: shoot.title?.trim() || 'Shoot',
      shootDate: date,
      location: shoot.venue || shoot.location || undefined,
      notes: shoot.notes || undefined,
    };
    let shootId = shoot.id;
    if (!isPersistedProjectId(shootId)) {
      const created = await shootsApi.create({ projectId: project.id, ...payload, shootType: 'PHOTO_AND_VIDEO' });
      shootId = created.id;
    } else {
      try {
        await shootsApi.update(shootId, { ...payload, status: toShootStatus(shoot.status) });
      } catch (error) {
        if (!(error instanceof ApiError) || error.status !== 403) throw error;
      }
    }
    await syncAssignments(shootId, shoot, previousById.get(shoot.id), team);
    nextShoots.push({ ...shoot, id: shootId });
  }

  return reloadProjectShoots(project, nextShoots);
}
