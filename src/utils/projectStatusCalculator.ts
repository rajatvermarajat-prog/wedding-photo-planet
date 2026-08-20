import { Project, ProjectStatus } from '@/types';

export interface ProjectWorkBreakdown {
  totalItems: number;
  completedItems: number;
  inProgressItems: number;
  pendingItems: number;
  completionPercent: number;
  autoStatus: ProjectStatus;
  statusLabel: string;
  hindiLabel: string;
  badgeClass: string;
}

/**
 * Automatically calculates project work status based on tasks, editing pipelines, and delivery checklist
 */
export function computeAutoProjectStatus(project: Project): ProjectWorkBreakdown {
  let totalItems = 0;
  let completedItems = 0;
  let inProgressItems = 0;
  let pendingItems = 0;

  const hasCustomTasks = Boolean(project.tasks && project.tasks.length > 0);
  let customTasksTotal = 0;
  let customTasksCompleted = 0;

  // 1. Custom Tasks (project.tasks)
  if (hasCustomTasks && project.tasks) {
    project.tasks.forEach((t) => {
      customTasksTotal += 1;
      totalItems += 1;
      if (t.status === 'completed') {
        customTasksCompleted += 1;
        completedItems += 1;
      } else if (t.status === 'in_progress' || t.status === 'client_review' || t.status === 'revision') {
        inProgressItems += 1;
      } else {
        pendingItems += 1;
      }
    });
  }

  // 2. Video Pipeline (project.videoPipeline)
  if (project.videoPipeline) {
    const vp = project.videoPipeline;
    const vKeys: (keyof typeof vp)[] = ['preWeddingVideo', 'longVideo', 'teaser', 'reels'];
    vKeys.forEach((key) => {
      const val = vp[key];
      if (val && typeof val === 'string') {
        // Only count unstarted default pipeline items if there are no custom tasks defined
        if (!hasCustomTasks || val !== 'not_started') {
          totalItems += 1;
          if (val === 'completed') {
            completedItems += 1;
          } else if (val === 'in_progress' || val === 'client_review' || val === 'revision') {
            inProgressItems += 1;
          } else {
            pendingItems += 1;
          }
        }
      }
    });
  }

  // 3. Photo Pipeline (project.photoPipeline)
  if (project.photoPipeline) {
    const pp = project.photoPipeline;
    const pKeys: (keyof typeof pp)[] = ['preWeddingPhotos', 'cullingSelection', 'colorGradingRetouching', 'albumDesigning'];
    pKeys.forEach((key) => {
      const val = pp[key];
      if (val && typeof val === 'string') {
        if (!hasCustomTasks || val !== 'not_started') {
          totalItems += 1;
          if (val === 'completed') {
            completedItems += 1;
          } else if (val === 'in_progress' || val === 'client_review' || val === 'revision') {
            inProgressItems += 1;
          } else {
            pendingItems += 1;
          }
        }
      }
    });
    if (pp.albumPrinting) {
      if (!hasCustomTasks || pp.albumPrinting !== 'not_sent') {
        totalItems += 1;
        if (pp.albumPrinting === 'delivered' || pp.albumPrinting === 'proof_approved') {
          completedItems += 1;
        } else if (pp.albumPrinting === 'printing' || pp.albumPrinting === 'design_sent') {
          inProgressItems += 1;
        } else {
          pendingItems += 1;
        }
      }
    }
  }

  // 4. Delivery Status (project.deliveryStatus)
  const ds = project.deliveryStatus;
  const isAllDelivered = Boolean(ds && (
    (ds.rawHandoverDone && ds.teaserLinkSent && ds.fullFilmSent && ds.reelsSent && ds.highResPhotosSent && ds.albumPrintedAndDelivered) ||
    (ds.albumPrintedAndDelivered && ds.highResPhotosSent && (ds.fullFilmSent || ds.teaserLinkSent))
  ));

  // Calculate percentages
  const completionPercent = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;

  // Determine Auto Status
  let autoStatus: ProjectStatus = 'running';

  const allCustomTasksCompleted = hasCustomTasks && customTasksTotal > 0 && customTasksCompleted === customTasksTotal;
  const allItemsCompleted = totalItems > 0 && completedItems === totalItems;

  if (isAllDelivered) {
    autoStatus = 'ready_to_deliver';
  } else if (allCustomTasksCompleted || allItemsCompleted) {
    autoStatus = 'completed';
  } else {
    autoStatus = 'running';
  }

  let statusLabel = 'RUNNING';
  let hindiLabel = '';
  let badgeClass = 'bg-indigo-100 text-indigo-800 border-indigo-300';

  if (autoStatus === 'ready_to_deliver') {
    statusLabel = 'DELIVERED';
    hindiLabel = '';
    badgeClass = 'bg-emerald-100 text-emerald-800 border-emerald-300';
  } else if (autoStatus === 'completed') {
    statusLabel = 'COMPLETED';
    hindiLabel = '';
    badgeClass = 'bg-purple-100 text-purple-800 border-purple-300';
  }

  return {
    totalItems,
    completedItems,
    inProgressItems,
    pendingItems,
    completionPercent,
    autoStatus,
    statusLabel,
    hindiLabel,
    badgeClass,
  };
}
