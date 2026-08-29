'use client';

import type { TeamTask } from '@/types';
import { usePermission } from '@/features/access';
import { MyAttendanceCard } from '@/features/attendance/MyAttendanceCard';
import { TaskWorkspacePanel } from './TaskWorkspacePanel';
import { PersonalTodoPanel } from './PersonalTodoPanel';

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
  const showTodos = can('dashboard.view_todos');
  if (!showTasks && !showAttendanceCard && !showTodos) return null;

  return (
    <div className="grid gap-5 lg:grid-cols-2">
      {(showTasks || showAttendanceCard) && (
        <div className="space-y-4">
          {showTasks && (
            <TaskWorkspacePanel
              tasks={tasks}
              title="Today's assigned tasks"
              description="Tasks assigned by your manager appear here automatically. Update the status as work progresses."
              canUpdate={canUpdate}
              onUpdate={onUpdate}
            />
          )}
          {showAttendanceCard && <MyAttendanceCard userId={userId} canView={canViewAttendance} />}
        </div>
      )}
      {showTodos && <PersonalTodoPanel />}
    </div>
  );
}
