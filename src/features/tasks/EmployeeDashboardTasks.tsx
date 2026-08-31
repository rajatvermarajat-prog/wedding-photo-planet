'use client';

import type { TeamTask } from '@/types';
import { usePermission } from '@/features/access';
import { MyAttendanceCard } from '@/features/attendance/MyAttendanceCard';
import { TaskWorkspacePanel } from './TaskWorkspacePanel';

interface Props {
  userId: string;
  tasks: TeamTask[];
  canUpdate: boolean;
  onUpdate: (task: TeamTask) => void;
  showAttendance: boolean;
  canViewAttendance: boolean;
}

export function EmployeeDashboardTasks({
  userId,
  tasks,
  canUpdate,
  onUpdate,
  showAttendance,
  canViewAttendance,
}: Props) {
  const { can } = usePermission();
  const showTasks = can('dashboard.view_tasks') && can('tasks.view');
  const showAttendanceCard = showAttendance && can('dashboard.view_attendance');
  if (!showTasks && !showAttendanceCard) return null;

  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]">
      {showAttendanceCard && <MyAttendanceCard userId={userId} canView={canViewAttendance} />}
      {showTasks && (
        <TaskWorkspacePanel
          tasks={tasks}
          title="Today's assigned tasks"
          description="Tasks assigned by your manager appear here automatically. Update the status as work progresses."
          canUpdate={canUpdate}
          onUpdate={onUpdate}
          compactEmpty
        />
      )}
    </div>
  );
}
