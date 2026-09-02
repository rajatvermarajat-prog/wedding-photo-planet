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

type ProjectMetadata = {
  customDetails?: string;
  quotationLink?: string;
  weddingFunctionDates?: string;
  videoPipeline?: Project['videoPipeline'];
  photoPipeline?: Project['photoPipeline'];
  dataBackup?: Project['dataBackup'];
  deliveryStatus?: Project['deliveryStatus'];
};

function readMetadata(value?: string | null): ProjectMetadata {
  if (!value) return {};
  try {
    const parsed = JSON.parse(value);
    return parsed && typeof parsed === 'object' ? parsed : { customDetails: value };
  } catch {
    return { customDetails: value };
  }
}

function writeMetadata(project: Project): string | undefined {
  const metadata: ProjectMetadata = {
    ...readMetadata(project.otherClientDetails),
    customDetails: project.primaryServiceType === 'Other' ? project.otherClientDetails?.trim() || undefined : undefined,
    quotationLink: project.quotationLink?.trim() || undefined,
    weddingFunctionDates: project.weddingFunctionDates?.trim() || undefined,
    videoPipeline: project.videoPipeline,
    photoPipeline: project.photoPipeline,
    dataBackup: project.dataBackup,
    deliveryStatus: project.deliveryStatus,
  };
  return Object.values(metadata).some((value) => value !== undefined) ? JSON.stringify(metadata) : undefined;
}

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
export function normalizeProject(dto: any): Project {
  const budget = Number(dto.totalQuotation) || 0;
  const parsedMeta = readMetadata(dto.otherClientDetails);

  const payments = (dto.payments || []).map((p: any) => ({
    id: p.id,
    paymentDate: p.paymentDate?.slice(0, 10) || '',
    amount: Number(p.amount || 0),
    paymentMode: p.paymentMethod || 'Bank Transfer',
    notes: p.notes || '',
    receiptScreenshot: p.receiptFileId ? `/files/${p.receiptFileId}` : undefined,
  }));

  const received = payments.reduce((sum: number, p: any) => sum + p.amount, 0);

  return {
    id: dto.id,
    clientId: dto.client?.id,
    name: dto.name,
    projectName: dto.name,
    clientWeddingTitle: dto.client?.displayName || dto.name,
    clientContactMobile: dto.client?.primaryPhone || '',
    venueLocation: [dto.venueName, dto.venueCity].filter(Boolean).join(', '),
    primaryServiceType: dto.customServiceType ? 'Other' : (legacyService[dto.type as keyof typeof legacyService] || 'Wedding'),
    customServiceType: dto.customServiceType || undefined,
    otherClientDetails: parsedMeta.customDetails || undefined,
    quotationLink: parsedMeta.quotationLink || undefined,
    weddingFunctionDates: parsedMeta.weddingFunctionDates || dto.weddingDate?.slice(0, 10) || '',
    finalDeliveryDeadline: dto.deliveryDueDate?.slice(0, 10) ?? '',
    totalBudget: budget,
    advanceReceived: received,
    balanceDue: Math.max(0, budget - received),
    specialNotesMusicPreferences: dto.notes ?? '',
    status: legacyStatus[dto.status as keyof typeof legacyStatus] || 'running',
    createdAt: dto.createdAt,
    videoPipeline: parsedMeta.videoPipeline || { ...emptyPipeline.video },
    photoPipeline: parsedMeta.photoPipeline || { ...emptyPipeline.photo },
    shoots: (dto.shoots || []).map((s: any) => ({
      id: s.id,
      title: s.title || s.name || 'Shoot',
      date: s.shootDate?.slice(0, 10) || s.eventDate?.slice(0, 10) || '',
      time: s.startTime?.slice(11, 16) || '',
      venue: s.venueName || s.venue || '',
      notes: s.notes || '',
      status: s.status?.toLowerCase() || 'scheduled',
      crewAssignments: (s.assignments || []).map((a: any) => ({
        id: a.id,
        role: a.role,
        name: a.user?.fullName || a.freelancer?.fullName || '',
        mobile: '',
        dataReceived: Boolean(a.dataReceived),
        dataSizeGB: Number(a.dataSizeGb || 0),
        copyInHD: a.storageReference || '',
        backupInHD: '',
      })),
    })),
    tasks: (dto.tasks || []).map((t: any) => ({
      id: t.id,
      taskName: t.title || '',
      quantity: t.quantity || 1,
      unit: t.unit || '',
      assignedTo: t.assignee?.fullName || '',
      assignedToId: t.assigneeId || undefined,
      status: t.status === 'COMPLETED' ? 'completed' : t.status === 'IN_PROGRESS' ? 'in_progress' : 'not_started',
    })),
    dataBackup: parsedMeta.dataBackup || dto.dataBackup || { ...emptyPipeline.backup },
    payments,
    deliveryStatus: parsedMeta.deliveryStatus || dto.deliveryStatus || { ...emptyPipeline.delivery },
  };
}

export function toCreateProjectInput(project: Project, clientId: string): CreateProjectInput {
  const venue = splitVenue(project.venueLocation);
  const weddingDate = firstIsoDate(project.weddingFunctionDates);
  const deliveryDueDate = firstIsoDate(project.finalDeliveryDeadline);
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
    otherClientDetails: writeMetadata(project),
    notes: project.specialNotesMusicPreferences || undefined,
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
    customServiceType: input.customServiceType,
    otherClientDetails: input.otherClientDetails,
    notes: input.notes,
  };
}
