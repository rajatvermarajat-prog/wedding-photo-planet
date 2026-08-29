import type { BackendTask, BackendTaskCategory, BackendTaskPriority, BackendTaskStatus, CreateTaskInput } from '@/lib/api/tasks';
import type { TeamTask } from '@/types';

const categoryMap: Record<string, BackendTaskCategory> = {
  editing_photo: 'PHOTO_EDITING',
  editing_video: 'VIDEO_EDITING',
  sales_lead: 'CLIENT_MEETING',
  sales_target: 'ADMIN',
  social_media: 'OTHER',
  management: 'ADMIN',
};

const priorityMap: Record<TeamTask['priority'], BackendTaskPriority> = {
  low: 'LOW', medium: 'MEDIUM', high: 'HIGH',
};

const statusMap: Record<TeamTask['status'], BackendTaskStatus> = {
  not_started: 'ASSIGNED', in_progress: 'IN_PROGRESS', review: 'IN_REVIEW', completed: 'COMPLETED',
};

const teamStatusMap: Record<BackendTaskStatus, TeamTask['status']> = {
  TODO: 'not_started', ASSIGNED: 'not_started', IN_PROGRESS: 'in_progress', PAUSED: 'not_started', IN_REVIEW: 'review', COMPLETED: 'completed', CANCELLED: 'completed',
};

export function normalizeTask(task: BackendTask): TeamTask {
  return {
    id: task.id,
    title: task.title,
    assignedToId: task.assigneeId ?? '',
    assignedToName: task.assignee?.fullName ?? 'Unassigned',
    assignedRole: 'other',
    projectId: task.projectId ?? undefined,
    projectTitle: task.project?.name,
    category: task.category.toLowerCase(),
    dueDate: task.dueDate?.slice(0, 10) ?? '',
    priority: task.priority.toLowerCase() as TeamTask['priority'],
    status: teamStatusMap[task.status],
    notes: task.description ?? undefined,
  };
}

export function taskCreateInput(task: TeamTask): CreateTaskInput {
  return {
    title: task.title.trim(),
    description: task.notes?.trim() || undefined,
    category: categoryMap[task.category] ?? 'OTHER',
    priority: priorityMap[task.priority],
    dueDate: task.dueDate || undefined,
    assigneeId: task.assignedToId || undefined,
    projectId: task.projectId || undefined,
  };
}

export function taskStatusInput(task: TeamTask): BackendTaskStatus {
  return statusMap[task.status];
}
