import {
  Banknote,
  Bell,
  BriefcaseBusiness,
  CalendarDays,
  Camera,
  CheckCircle2,
  ClipboardList,
  FolderKanban,
  Heart,
  Image as ImageIcon,
  LayoutDashboard,
  UsersRound,
} from 'lucide-react';

export const navItems = [
  { href: '/', label: 'Home' },
  { href: '#features', label: 'Features' },
  { href: '#studios', label: 'For Studios' },
  { href: '#freelancers', label: 'For Freelancers' },
  { href: '#clients', label: 'For Clients' },
  { href: '#pricing', label: 'Pricing' },
  { href: '#contact', label: 'Contact' },
];

export const ecosystemCards = [
  {
    icon: LayoutDashboard,
    title: 'CRM',
    description: 'A focused studio workspace for leads, clients, projects, shoots and daily operations.',
  },
  {
    icon: UsersRound,
    title: 'Freelancers',
    description: 'A professional network direction for profiles, availability, assignments and payouts.',
  },
  {
    icon: ImageIcon,
    title: 'Client Galleries',
    description: 'A photo-first delivery direction for wedding memories, albums and download access.',
  },
  {
    icon: BriefcaseBusiness,
    title: 'Business Operations',
    description: 'Tasks, attendance, payments and reporting connected to the real studio workflow.',
  },
];

export const implementedFeatures = [
  { icon: Heart, title: 'Lead Management', description: 'Track wedding inquiries, follow-ups and conversions.' },
  { icon: FolderKanban, title: 'Project Management', description: 'Organize wedding projects, clients, budgets and delivery status.' },
  { icon: Camera, title: 'Shoot Management', description: 'Schedule shoots and manage crew assignments.' },
  { icon: UsersRound, title: 'Freelancer Management', description: 'Maintain freelancer records, assignments and payout history.' },
  { icon: CalendarDays, title: 'Team & Attendance', description: 'Manage staff attendance, leave and daily team activity.' },
  { icon: ClipboardList, title: 'Tasks', description: 'Assign and track operational work across the team.' },
  { icon: Banknote, title: 'Payments', description: 'Record payments, invoices, expenses and freelancer payouts.' },
  { icon: CheckCircle2, title: 'Client Delivery', description: 'Track delivery workflows and project client assets.' },
  { icon: Bell, title: 'Notifications', description: 'Keep important workspace activity visible to the right users.' },
];

export const futureDirections = [
  'Freelancer portfolio and availability tools',
  'Client wedding gallery access',
  'Photo, video and album delivery experiences',
];

export const studioBullets = [
  'Manage leads and inquiries',
  'Manage clients and projects',
  'Schedule shoots and teams',
  'Coordinate freelancers',
  'Track payments and operations',
];

export const freelancerBullets = [
  'Create one professional profile',
  'Showcase portfolio direction',
  'Manage availability direction',
  'Discover project opportunities',
  'View assignments and track payouts',
];

export const clientBullets = [
  'Access wedding photos and videos',
  'Explore albums and galleries',
  'Select favorites when enabled',
  'Download when permitted',
  'Share memories with family and friends',
];

export const howItWorks = [
  {
    step: '01',
    title: 'Manage',
    description: 'Manage inquiries, projects, shoots, teams and payments inside the studio CRM.',
  },
  {
    step: '02',
    title: 'Connect',
    description: 'Connect studios with professional freelancers through profile and assignment workflows.',
  },
  {
    step: '03',
    title: 'Deliver',
    description: 'Deliver beautiful wedding memories through future client gallery experiences.',
  },
];
