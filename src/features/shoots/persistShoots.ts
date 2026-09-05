import { ApiError } from '@/lib/api/client';
import { shootsApi, type BackendCrewRole, type BackendShoot, type BackendShootStatus } from '@/lib/api/shoots';
import type { CrewMemberAssignment, DataBackup, Project, ShootEvent, TeamMember } from '@/types';
import { firstIsoDate, isPersistedProjectId } from '@/features/projects/projectViewModel';

export function toCrewRole(role: string): BackendCrewRole {
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

function toIsoDateTime(date: string, time?: string): string | undefined {
  if (!time?.trim()) return undefined;
  const twentyFourHour = time.trim().match(/^(\d{1,2}):(\d{2})$/);
  if (twentyFourHour) {
    const hour = Number(twentyFourHour[1]);
    const minute = Number(twentyFourHour[2]);
    if (hour <= 23 && minute <= 59) {
      return `${date}T${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}:00.000Z`;
    }
  }
  const match = time.trim().toUpperCase().match(/^(\d{1,2})(?::|\s+)(\d{2})\s*(AM|PM)$/);
  if (!match) return undefined;
  let hour = Number(match[1]);
  if (hour < 1 || hour > 12 || Number(match[2]) > 59) return undefined;
  if (match[3] === 'PM' && hour !== 12) hour += 12;
  if (match[3] === 'AM' && hour === 12) hour = 0;
  return `${date}T${String(hour).padStart(2, '0')}:${match[2]}:00.000Z`;
}

/**
 * The Shoot table correctly rejects an end timestamp that is not after the
 * start timestamp. Validate the Project form's existing time fields before
 * any project write starts, so a bad shoot cannot leave a newly-created
 * project only partially persisted.
 */
export function assertProjectShootTimes(shoots: ShootEvent[]) {
  for (const shoot of shoots) {
    const date = firstIsoDate(shoot.date);
    if (!date) continue;
    const startTime = toIsoDateTime(date, shoot.startTime);
    const endTime = toIsoDateTime(date, shoot.endTime);
    if (startTime && endTime && new Date(endTime).getTime() <= new Date(startTime).getTime()) {
      throw new Error(`End time must be later than start time for shoot \"${shoot.title?.trim() || 'Shoot'}\".`);
    }
  }
}

function fromIsoDateTime(value?: string | null): string | undefined {
  if (!value) return undefined;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return undefined;
  const hours = date.getUTCHours();
  const suffix = hours >= 12 ? 'PM' : 'AM';
  return `${String(hours % 12 || 12).padStart(2, '0')}:${String(date.getUTCMinutes()).padStart(2, '0')} ${suffix}`;
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
  let customRows = [...(shoot.crewAssignments || [])];
  const coreRows: CrewMemberAssignment[] = [];
  // The original modal stores its four core choices in dedicated fields and
  // additional members in crewAssignments. Adapt that unchanged shape here
  // before calling the API, so replacing a core member removes the old DB row.
  ([
    ['Photographer', shoot.leadPhotographer],
    ['Cinematographer', shoot.cinematographer],
    ['Drone Operator', shoot.droneOperator],
    ['Assistant', shoot.assistant],
  ] as const).forEach(([role, name]) => {
    const matching = customRows.filter((row) => row.role.trim().toLowerCase() === role.toLowerCase());
    customRows = customRows.filter((row) => row.role.trim().toLowerCase() !== role.toLowerCase());
    if (!name?.trim()) return;
    const existing = matching.find((row) => row.name.trim().toLowerCase() === name.trim().toLowerCase());
    coreRows.push(existing || { id: `named-${role}`, name: name.trim(), role });
  });
  return [...coreRows, ...customRows].filter((row) => row.name?.trim());
}

export function toPlannedRoleSlots(shoot: ShootEvent, team: TeamMember[]) {
  return (shoot.crewAssignments || []).flatMap((row) => {
    const role = row.role?.trim();
    if (!role || memberId(row, team)) return [];
    return [{
      role,
      requiredCount: 1,
      ...(row.name?.trim() ? { name: row.name.trim() } : {}),
      ...(row.mobile?.trim() ? { mobile: row.mobile.trim() } : {}),
      ...(row.dataReceived ? { dataReceived: true } : {}),
      ...(row.dataSizeGB ? { dataSizeGb: String(row.dataSizeGB) } : {}),
      ...((row.copyInHD || row.hardDriveName)?.trim() ? { copyInHD: (row.copyInHD || row.hardDriveName || '').trim() } : {}),
      ...(row.backupInHD?.trim() ? { backupInHD: row.backupInHD.trim() } : {}),
    }];
  });
}

function memberId(crew: CrewMemberAssignment, team: TeamMember[]) {
  if (crew.userId && isPersistedProjectId(crew.userId)) return crew.userId;
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
    userId: row.user?.id || undefined,
    name: row.user?.fullName || row.freelancer?.fullName || '',
    role: fromCrewRole(row.role),
    mobile: row.user?.phone || row.freelancer?.phone || '',
    dataReceived: !!row.dataReceived,
    dataSizeGB: num(row.dataSizeGb),
    copyInHD: row.storageReference || '',
    hardDriveName: row.storageReference || '',
    backupInHD: row.notes || '',
  }));
  const planned = Array.isArray(dto.plannedRoleSlots) ? dto.plannedRoleSlots.flatMap((slot, index) =>
    Array.from({ length: slot.requiredCount || 0 }, (_, count) => ({
      id: `slot-${slot.role}-${index}-${count}`,
      name: slot.name || '',
      mobile: slot.mobile || '',
      role: slot.role,
      dataReceived: !!slot.dataReceived,
      dataSizeGB: num(slot.dataSizeGb),
      copyInHD: slot.copyInHD || '',
      hardDriveName: slot.copyInHD || '',
      backupInHD: slot.backupInHD || '',
    })),
  ) : [];
  const photographer = crew.find((row) => /photo/i.test(row.role))?.name;
  const cinematographer = crew.find((row) => /cinema|video/i.test(row.role))?.name;
  const drone = crew.find((row) => /drone/i.test(row.role))?.name;
  const assistant = crew.find((row) => /assist/i.test(row.role))?.name;
  const date = String(dto.shootDate || '').slice(0, 10);
  return {
    id: dto.id,
    title: dto.title,
    date,
    time: fromIsoDateTime(dto.startTime) || '',
    startTime: fromIsoDateTime(dto.startTime),
    endTime: fromIsoDateTime(dto.endTime),
    venue: dto.location || dto.city || '',
    location: dto.location || '',
    leadPhotographer: photographer,
    cinematographer,
    droneOperator: drone,
    assistant,
    crewAssignments: [...crew, ...planned],
    plannedRoleSlots: dto.plannedRoleSlots || undefined,
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
    const rawShoots = byProject.get(project.id) || [];
    const savedCrewData = project.dataBackup?.crewDataByShoot || {};
    const nextShoots = rawShoots.map((shoot) => ({
      ...shoot,
      crewAssignments: (shoot.crewAssignments || []).map((crew) => ({
        ...crew,
        ...(savedCrewData[shoot.id]?.[crew.id] || {}),
      })),
    }));
    return { ...project, shoots: nextShoots, dataBackup: backupFromShoots(nextShoots, project.dataBackup) };
  });
}

async function syncAssignments(shootId: string, shoot: ShootEvent, previous: ShootEvent | undefined, team: TeamMember[]) {
  const next = crewRows(shoot);
  const prev = previous ? crewRows(previous) : [];
  const nextById = new Map(next.map((row) => [row.id, row]));
  const replacementIds = new Set<string>();

  for (const row of prev) {
    if (!isPersistedProjectId(row.id)) continue;
    const replacement = nextById.get(row.id);
    const previousMemberId = memberId(row, team);
    const nextMemberId = replacement ? memberId(replacement, team) : undefined;
    // The assignment API intentionally never changes its userId.  When an
    // existing slot is given to a different employee, remove its owned row
    // and create the new employee assignment below; do not touch User records.
    const changedMember = Boolean(replacement && previousMemberId && nextMemberId && previousMemberId !== nextMemberId);
    if (replacement && !changedMember) continue;
    try {
      await shootsApi.removeAssignment(shootId, row.id);
      if (replacement && changedMember) replacementIds.add(row.id);
    } catch (error) {
      if (!(error instanceof ApiError) || error.status !== 403) throw error;
    }
  }

  for (const row of next) {
    if (isPersistedProjectId(row.id) && !replacementIds.has(row.id)) continue;
    const userId = memberId(row, team);
    if (!userId) continue;
    try {
      await shootsApi.assign(shootId, { userId, role: toCrewRole(row.role) });
    } catch (error) {
      // A duplicate assignee is a form error the user must resolve.  Do not
      // swallow the API's 409 here: ProjectFormModal surfaces its exact
      // message in an error toast.
      if (!(error instanceof ApiError) || error.status !== 403) throw error;
    }
  }
}

async function syncAssignmentData(shootId: string, shoot: ShootEvent, backup?: DataBackup) {
  const rows = crewRows(shoot).filter((row) => isPersistedProjectId(row.id));
  for (const row of rows) {
    try {
      await shootsApi.updateAssignment(shootId, row.id, {
        role: toCrewRole(row.role || ''),
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
    const listed = await shootsApi.list({ projectId: project.id, page: 1, limit: 100, sortBy: 'createdAt', sortOrder: 'asc' });
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

/** Persist one crew handover row. Used by the RAW Data editor so one row edit
 * does not re-save every assignment in every shoot. */
export async function persistSingleCrewDataHandover(project: Project, shootId: string, crewId: string): Promise<Project> {
  if (!isPersistedProjectId(project.id) || !isPersistedProjectId(shootId)) return project;
  const shoot = (project.shoots || []).find((row) => row.id === shootId);
  const crew = shoot?.crewAssignments?.find((row) => row.id === crewId);
  if (!shoot || !crew) return project;
  // Planned/local slots have no assignment record yet.  They still need a
  // single request (rather than being silently skipped), so save their shoot
  // total until an assignment ID exists.
  if (!isPersistedProjectId(crewId)) {
    const totalGb = mainCrew(shoot.crewAssignments || []).reduce((sum, row) => sum + (row.dataSizeGB || 0), 0);
    const plannedRoleSlots = (shoot.crewAssignments || [])
      .filter((row) => !isPersistedProjectId(row.id))
      .map((row) => ({
        role: row.role || 'Team Member',
        requiredCount: 1,
        name: row.name || undefined,
        mobile: row.mobile || undefined,
        dataReceived: !!row.dataReceived,
        dataSizeGb: String(row.dataSizeGB || 0),
        copyInHD: (row.copyInHD || row.hardDriveName || '').slice(0, 160) || undefined,
        backupInHD: (row.backupInHD || '').slice(0, 2000) || undefined,
      }));
    await shootsApi.update(shootId, { dataSizeGb: String(totalGb), plannedRoleSlots });
    return project;
  }
  await shootsApi.updateAssignment(shootId, crewId, {
    role: toCrewRole(crew.role || ''),
    dataReceived: !!crew.dataReceived,
    dataSizeGb: String(crew.dataSizeGB || 0),
    storageReference: (crew.copyInHD || crew.hardDriveName || '').slice(0, 160),
    notes: (crew.backupInHD || '').slice(0, 2000),
  });
  return project;
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
      startTime: toIsoDateTime(date, shoot.startTime),
      location: shoot.venue || shoot.location || undefined,
      notes: shoot.notes || undefined,
      plannedRoleSlots: toPlannedRoleSlots(shoot, team),
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
    await syncAssignmentData(shootId, shoot, project.dataBackup);
    nextShoots.push({ ...shoot, id: shootId });
  }

  return reloadProjectShoots(project, nextShoots);
}
