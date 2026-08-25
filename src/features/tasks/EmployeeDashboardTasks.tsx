import type { TeamTask } from '@/types';
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
  return (
    <div className="space-y-4">
      <TaskWorkspacePanel
        tasks={tasks}
        title="Today's assigned tasks"
        description="Tasks assigned by your manager appear here automatically. Update the status as work progresses."
        canUpdate={canUpdate}
        onUpdate={onUpdate}
      />
      {showAttendance && <MyAttendanceCard userId={userId} canView={canViewAttendance} />}
    </div>
  );
}
