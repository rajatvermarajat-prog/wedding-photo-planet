import type { CreateProjectInput, Project as ProjectDto, UpdateProjectInput, BackendProjectType } from '@/lib/api/projects';
import type { Project } from '@/types';

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const legacyStatus: Record<ProjectDto['status'], Project['status']> = { LEAD:'new_project', CONFIRMED:'running', PLANNING:'running', SHOOTING:'running', EDITING:'running', DELIVERY:'ready_to_deliver', COMPLETED:'completed', CANCELLED:'pending' };
const legacyService: Record<ProjectDto['type'], string> = { ROKA:'Roka', ENGAGEMENT:'Engagement', PRE_WEDDING:'Pre Wedding', WEDDING:'Wedding', COMPLETE_WEDDING_SERVICES:'Complete Wedding Services', HALDI_MEHENDI:'Haldi & Mehendi', SANGEET:'Sangeet', RECEPTION:'Reception', ANNIVERSARY:'Other', CORPORATE:'Other', OTHER:'Other' };
const typeByService: Record<string, BackendProjectType> = {
  Roka: 'ROKA',
  Engagement: 'ENGAGEMENT',
  'Pre Wedding': 'PRE_WEDDING',
  Wedding: 'WEDDING',
  'Complete Wedding Services': 'COMPLETE_WEDDING_SERVICES',
  'Haldi & Mehendi': 'HALDI_MEHENDI',
  Sangeet: 'SANGEET',
  Reception: 'RECEPTION',
  Other: 'OTHER',
};

const emptyPipeline = {
  video: { preWeddingVideo:'not_started' as const, longVideo:'not_started' as const, teaser:'not_started' as const, highlights:'not_started' as const, reels:'not_started' as const, otherVideo:'' },
  photo: { preWeddingPhotos:'not_started' as const, cullingSelection:'not_started' as const, colorGradingRetouching:'not_started' as const, albumDesigning:'not_started' as const, albumPrinting:'not_sent' as const, otherPhoto:'' },
  backup: { offloadedFromCards:false, hardDrive1:'', hardDrive1Done:false, hardDrive2:'', hardDrive2Done:false, cloudBackupDone:false, totalDataSizeGB:0, rawCleanupStatus:'not_cleaned' as const },
  delivery: { rawHandoverDone:false, teaserLinkSent:false, fullFilmSent:false, reelsSent:false, highResPhotosSent:false, albumPrintedAndDelivered:false },
};

export function isPersistedProjectId(id?: string) {
  return !!id && UUID_RE.test(id);
}

export function firstIsoDate(value?: string) {
  return value?.match(/\d{4}-\d{2}-\d{2}/)?.[0];
}

function splitVenue(venue?: string) {
  const parts = (venue || '').split(',').map((part) => part.trim()).filter(Boolean);
  if (!parts.length) return {};
  if (parts.length === 1) return { venueName: parts[0] };
  return { venueName: parts.slice(0, -1).join(', '), venueCity: parts[parts.length - 1] };
}

export function toBackendProjectType(service?: string): BackendProjectType {
  return typeByService[service || ''] || 'WEDDING';
}

/** Maps only API-provided values; unavailable legacy workflow sections stay empty. */
export function normalizeProject(dto: ProjectDto): Project {
  const budget = Number(dto.totalQuotation) || 0;
  return {
    id: dto.id,
    name: dto.name,
    projectName: dto.name,
    clientWeddingTitle: dto.client?.displayName || dto.name,
    clientContactMobile: dto.client?.primaryPhone || '',
    venueLocation: [dto.venueName, dto.venueCity].filter(Boolean).join(', '),
    primaryServiceType: dto.customServiceType ? 'Other' : (legacyService[dto.type] || 'Wedding'),
    customServiceType: dto.customServiceType || undefined,
    otherClientDetails: dto.otherClientDetails || undefined,
    weddingFunctionDates: dto.weddingDate?.slice(0, 10) ?? '',
    finalDeliveryDeadline: dto.deliveryDueDate?.slice(0, 10) ?? '',
    totalBudget: budget,
    advanceReceived: 0,
    balanceDue: budget,
    specialNotesMusicPreferences: dto.notes ?? '',
    status: legacyStatus[dto.status],
    createdAt: dto.createdAt,
    videoPipeline: { ...emptyPipeline.video },
    photoPipeline: { ...emptyPipeline.photo },
    shoots: [],
    dataBackup: { ...emptyPipeline.backup },
    payments: [],
    deliveryStatus: { ...emptyPipeline.delivery },
  };
}

export function toCreateProjectInput(project: Project, clientId: string): CreateProjectInput {
  const venue = splitVenue(project.venueLocation);
  const weddingDate = firstIsoDate(project.weddingFunctionDates);
  const deliveryDueDate = firstIsoDate(project.finalDeliveryDeadline);
  const events = (project.shoots || [])
    .filter((shoot) => firstIsoDate(shoot.date))
    .map((shoot) => ({
      name: shoot.title?.trim() || 'Shoot',
      eventDate: firstIsoDate(shoot.date) as string,
      venueName: shoot.venue || venue.venueName,
      address: shoot.location || undefined,
      notes: shoot.notes || undefined,
    }));
  return {
    clientId,
    name: (project.clientWeddingTitle || project.name || 'Untitled project').trim(),
    type: toBackendProjectType(project.primaryServiceType),
    weddingDate,
    deliveryDueDate,
    venueName: venue.venueName,
    venueCity: venue.venueCity,
    totalQuotation: Number.isFinite(project.totalBudget) ? String(project.totalBudget) : undefined,
    customServiceType: project.primaryServiceType === 'Other' ? project.customServiceType : undefined,
    otherClientDetails: project.primaryServiceType === 'Other' ? project.otherClientDetails : undefined,
    notes: project.specialNotesMusicPreferences || undefined,
    events: events.length ? events : undefined,
  };
}

export function toUpdateProjectInput(project: Project): UpdateProjectInput {
  const input = toCreateProjectInput(project, '00000000-0000-4000-8000-000000000000');
  return {
    name: input.name,
    type: input.type,
    weddingDate: input.weddingDate,
    deliveryDueDate: input.deliveryDueDate,
    venueName: input.venueName,
    venueCity: input.venueCity,
    totalQuotation: input.totalQuotation,
    notes: input.notes,
  };
}
