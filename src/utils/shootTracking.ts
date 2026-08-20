import { ShootEvent } from '@/types';

/**
 * Formats YYYY-MM-DD date strings into DD-MM-YYYY format (e.g. 2026-11-18 -> 18-11-2026)
 */
export function formatDateDDMMYYYY(dateStr?: string): string {
  if (!dateStr) return '';
  return dateStr.replace(/\b(\d{4})-(\d{2})-(\d{2})\b/g, '$3-$2-$1');
}

/**
 * Returns today's date formatted as YYYY-MM-DD in local time zone
 */
export function getTodayDateString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export interface ShootDateInfo {
  isDone: boolean;
  isToday: boolean;
  isUpcoming: boolean;
  isPast: boolean;
  daysDiff: number; // negative = past, 0 = today, positive = future
  statusCategory: 'completed' | 'today' | 'pending' | 'cancelled';
  statusLabel: string;
  hindiLabel: string;
  badgeClass: string;
  badgeDotColor: string;
  dateBadgeText: string;
}

/**
 * Calculates date-based tracking status for a shoot event
 */
export function getShootDateInfo(dateStr: string | undefined, currentStatus?: string): ShootDateInfo {
  const todayStr = getTodayDateString();
  const isExplicitCompleted = currentStatus === 'completed';
  const isCancelled = currentStatus === 'cancelled';

  if (!dateStr) {
    if (isExplicitCompleted) {
      return {
        isDone: true,
        isToday: false,
        isUpcoming: false,
        isPast: false,
        daysDiff: 0,
        statusCategory: 'completed',
        statusLabel: 'Shoot Done',
        hindiLabel: '',
        badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-300',
        badgeDotColor: 'bg-emerald-500',
        dateBadgeText: 'Done',
      };
    }
    return {
      isDone: false,
      isToday: false,
      isUpcoming: true,
      isPast: false,
      daysDiff: 0,
      statusCategory: 'pending',
      statusLabel: 'Scheduled',
      hindiLabel: '',
      badgeClass: 'bg-amber-100 text-amber-800 border-amber-300',
      badgeDotColor: 'bg-amber-500',
      dateBadgeText: 'Pending',
    };
  }

  // Parse dates
  const today = new Date(todayStr);
  const shootDate = new Date(dateStr);
  
  // Calculate day difference (ignoring time)
  const diffTime = shootDate.getTime() - today.getTime();
  const daysDiff = Math.round(diffTime / (1000 * 3600 * 24));

  const isPast = daysDiff < 0;
  const isToday = daysDiff === 0;
  const isUpcoming = daysDiff > 0;

  // If explicitly completed OR date has passed (and not cancelled), treat as Shoot Done
  const isDone = isExplicitCompleted || (isPast && !isCancelled);

  if (isCancelled) {
    return {
      isDone: false,
      isToday,
      isUpcoming,
      isPast,
      daysDiff,
      statusCategory: 'cancelled',
      statusLabel: 'Cancelled',
      hindiLabel: '',
      badgeClass: 'bg-rose-100 text-rose-800 border-rose-300',
      badgeDotColor: 'bg-rose-500',
      dateBadgeText: 'Cancelled',
    };
  }

  if (isDone) {
    return {
      isDone: true,
      isToday: false,
      isUpcoming: false,
      isPast,
      daysDiff,
      statusCategory: 'completed',
      statusLabel: isExplicitCompleted ? 'Shoot Done (Manually Marked)' : `Shoot Done (${Math.abs(daysDiff)}d ago)`,
      hindiLabel: '',
      badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-300',
      badgeDotColor: 'bg-emerald-500',
      dateBadgeText: isPast ? `${Math.abs(daysDiff)}d ago` : 'Done',
    };
  }

  if (isToday) {
    return {
      isDone: false,
      isToday: true,
      isUpcoming: false,
      isPast: false,
      daysDiff: 0,
      statusCategory: 'today',
      statusLabel: "Today's Shoot!",
      hindiLabel: '',
      badgeClass: 'bg-indigo-100 text-indigo-900 border-indigo-400 font-black animate-pulse',
      badgeDotColor: 'bg-indigo-600',
      dateBadgeText: 'TODAY',
    };
  }

  // Future / Upcoming Shoot
  return {
    isDone: false,
    isToday: false,
    isUpcoming: true,
    isPast: false,
    daysDiff,
    statusCategory: 'pending',
    statusLabel: `Pending (In ${daysDiff} days)`,
    hindiLabel: '',
    badgeClass: 'bg-amber-100 text-amber-900 border-amber-300',
    badgeDotColor: 'bg-amber-500',
    dateBadgeText: `in ${daysDiff}d`,
  };
}

/**
 * Computes aggregated shoot tracking metrics for a list of shoots
 */
export function getShootTrackingStats(shoots: ShootEvent[]) {
  let completed = 0;
  let todayCount = 0;
  let pending = 0;
  let cancelled = 0;

  shoots.forEach((s) => {
    const info = getShootDateInfo(s.date, s.status);
    if (info.statusCategory === 'completed') {
      completed++;
    } else if (info.statusCategory === 'today') {
      todayCount++;
    } else if (info.statusCategory === 'cancelled') {
      cancelled++;
    } else {
      pending++;
    }
  });

  const total = shoots.length;
  const completionPercent = total > 0 ? Math.round((completed / total) * 100) : 0;

  return {
    total,
    completed,
    todayCount,
    pending,
    cancelled,
    completionPercent,
  };
}
