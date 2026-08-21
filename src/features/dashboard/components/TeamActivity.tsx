import { AttendanceRecord, Project, TeamMember, TeamTask } from '@/types';
import { TeamDailyReportingWidget } from '@/features/team/components/TeamDailyReportingWidget';

interface Props {
  team: TeamMember[]; attendance: AttendanceRecord[]; tasks: TeamTask[]; projects: Project[];
  onUpdateTask?: (task: TeamTask) => void; onDeleteTask?: (id: string) => void;
  onAddTask?: (task: TeamTask) => void; onOpenMemberModal?: (member: TeamMember) => void;
}

export function TeamActivity(props: Props) {
  return <TeamDailyReportingWidget {...props} />;
}
