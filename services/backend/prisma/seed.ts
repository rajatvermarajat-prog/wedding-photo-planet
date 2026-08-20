// Seed script for Wedding Photo Planet CRM
import { PrismaClient, Role, UserStatus, Priority, TaskCategory, TaskStatus, LeadSource, LeadStatus, ProjectStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting Wedding Photo Planet CRM database seeding...');

  // 1. Initial System Settings
  const defaultSettings = [
    { key: 'INACTIVITY_TIMEOUT_MINUTES', value: process.env.INACTIVITY_TIMEOUT_MINUTES || '10', description: 'Minutes of idle before showing warning' },
    { key: 'GRACE_PERIOD_MINUTES', value: process.env.GRACE_PERIOD_MINUTES || '5', description: 'Grace period countdown in minutes before auto logout' },
    { key: 'AUTO_LOGOUT_ENABLED', value: process.env.AUTO_LOGOUT_ENABLED || 'true', description: 'Enable automatic logout after grace period' },
    { key: 'INACTIVITY_NOTIFICATION_ENABLED', value: process.env.INACTIVITY_NOTIFICATION_ENABLED || 'true', description: 'Send real-time inactivity notification to admins' },
    { key: 'LIVE_ACTIVITY_ENABLED', value: process.env.LIVE_ACTIVITY_ENABLED || 'true', description: 'Enable live team activity tracking stream' },
    { key: 'ALLOW_MULTIPLE_SESSIONS', value: process.env.ALLOW_MULTIPLE_SESSIONS || 'false', description: 'Allow members to have multiple simultaneous logins' },
    { key: 'COMPANY_NAME', value: 'Wedding Photo Planet', description: 'Studio Name' },
    { key: 'COMPANY_PHONE', value: '+91 98765 43210', description: 'Studio Phone' },
    { key: 'COMPANY_EMAIL', value: 'contact@weddingphotoplanet.com', description: 'Studio Email' },
    { key: 'CURRENCY_SYMBOL', value: '₹', description: 'Currency Symbol' },
  ];

  for (const s of defaultSettings) {
    await prisma.systemSetting.upsert({
      where: { key: s.key },
      update: { value: s.value },
      create: s,
    });
  }
  console.log('✅ System settings seeded');

  // 2. Hash default passwords
  const adminPassword = process.env.ADMIN_INIT_PASSWORD || 'Admin@WPP2026!';
  const defaultMemberPassword = 'Password@123';
  const hashedAdminPassword = await bcrypt.hash(adminPassword, 12);
  const hashedMemberPassword = await bcrypt.hash(defaultMemberPassword, 10);

  // 3. Create Admin
  const adminUser = await prisma.user.upsert({
    where: { username: process.env.ADMIN_INIT_USERNAME || 'admin' },
    update: {},
    create: {
      username: process.env.ADMIN_INIT_USERNAME || 'admin',
      employee_code: 'WPP-ADM-001',
      full_name: process.env.ADMIN_INIT_NAME || 'Studio Owner',
      email: process.env.ADMIN_INIT_EMAIL || 'admin@weddingphotoplanet.com',
      phone: '+91 99999 88888',
      password_hash: hashedAdminPassword,
      role: Role.ADMIN,
      status: UserStatus.ACTIVE,
    },
  });
  console.log(`✅ Admin account ready: ${adminUser.username} (${adminUser.email})`);

  // 4. Create Studio Manager
  const managerUser = await prisma.user.upsert({
    where: { username: 'manager' },
    update: {},
    create: {
      username: 'manager',
      employee_code: 'WPP-MGR-002',
      full_name: 'Studio Manager',
      email: 'manager@weddingphotoplanet.com',
      phone: '+91 99999 77777',
      password_hash: hashedMemberPassword,
      role: Role.MANAGER,
      status: UserStatus.ACTIVE,
      monthly_salary: 45000,
    },
  });
  console.log(`✅ Manager account ready: ${managerUser.username}`);

  // 5. Create Sample Team Members
  const sampleMembers = [
    { username: 'simran', code: 'WPP-MEM-003', name: 'Simran Kaur', email: 'simran@weddingphotoplanet.com', phone: '+91 98765 11111', salary: 32000, daily: 1500 },
    { username: 'karan', code: 'WPP-MEM-004', name: 'Karan Sharma', email: 'karan@weddingphotoplanet.com', phone: '+91 98765 22222', salary: 35000, daily: 1600 },
    { username: 'neetu', code: 'WPP-MEM-005', name: 'Neetu Verma', email: 'neetu@weddingphotoplanet.com', phone: '+91 98765 33333', salary: 28000, daily: 1200 },
    { username: 'kabir', code: 'WPP-MEM-006', name: 'Kabir Singh', email: 'kabir@weddingphotoplanet.com', phone: '+91 98765 44444', salary: 30000, daily: 1400 },
  ];

  const createdMembers = [];
  for (const m of sampleMembers) {
    const user = await prisma.user.upsert({
      where: { username: m.username },
      update: {},
      create: {
        username: m.username,
        employee_code: m.code,
        full_name: m.name,
        email: m.email,
        phone: m.phone,
        password_hash: hashedMemberPassword,
        role: Role.MEMBER,
        status: UserStatus.ACTIVE,
        monthly_salary: m.salary,
        daily_rate: m.daily,
      },
    });
    createdMembers.push(user);
  }
  console.log(`✅ ${createdMembers.length} sample team members created`);

  // 6. Create Sample Clients
  const client1 = await prisma.client.create({
    data: {
      name: 'Rohan & Ananya Sharma',
      phone: '+91 98111 22334',
      email: 'rohan.ananya@gmail.com',
      address: 'Udaipur Palace Resort & Delhi NCR',
      notes: 'Grand Royal Rajput Wedding 3-day coverage with pre-wedding and cinematic teaser.',
    },
  });

  const client2 = await prisma.client.create({
    data: {
      name: 'Aakash & Simran Kapoor',
      phone: '+91 98222 33445',
      email: 'aakash.simran@gmail.com',
      address: 'Goa Beach Resort & Mumbai',
      notes: 'Destination Engagement & Sangeet party shoot.',
    },
  });
  console.log('✅ Sample clients created');

  // 7. Create Sample Projects
  const project1 = await prisma.project.create({
    data: {
      project_name: 'Rohan & Ananya Royal Wedding (Udaipur)',
      client_id: client1.id,
      status: ProjectStatus.IN_PROGRESS,
      budget: 350000,
      start_date: new Date('2026-07-01'),
      due_date: new Date('2026-09-30'),
      created_by: adminUser.id,
    },
  });

  const project2 = await prisma.project.create({
    data: {
      project_name: 'Aakash & Simran Destination Engagement',
      client_id: client2.id,
      status: ProjectStatus.UPCOMING,
      budget: 180000,
      start_date: new Date('2026-08-20'),
      due_date: new Date('2026-10-15'),
      created_by: adminUser.id,
    },
  });
  console.log('✅ Sample projects created');

  // 8. Create Sample Leads
  await prisma.lead.createMany({
    data: [
      {
        name: 'Siddharth & Meera Destination Wedding',
        phone: '+91 98999 12345',
        email: 'sid.meera@yahoo.com',
        source: LeadSource.INSTAGRAM,
        assigned_to: managerUser.id,
        status: LeadStatus.PROPOSAL_SENT,
        follow_up_date: new Date('2026-08-22'),
        estimated_value: 280000,
        notes: 'Requested quotation for 2 days photo + cinematic video in Jaipur.',
      },
      {
        name: 'Vikram & Pooja Pre-Wedding Shoot',
        phone: '+91 98888 54321',
        email: 'vikram.pooja@gmail.com',
        source: LeadSource.META_ADS,
        assigned_to: createdMembers[2].id, // neetu
        status: LeadStatus.QUALIFIED,
        follow_up_date: new Date('2026-08-18'),
        estimated_value: 75000,
        notes: 'Looking for sunset drone shoot and mini teaser.',
      },
    ],
  });
  console.log('✅ Sample leads created');

  // 9. Create Sample Tasks
  const task1 = await prisma.task.create({
    data: {
      project_id: project1.id,
      client_id: client1.id,
      title: 'Wedding Album Editing & Color Grading',
      description: 'Select top 120 pictures from Udaipur reception, perform skin retouching, color balance, and album layouts.',
      category: TaskCategory.ALBUM_DESIGN,
      assigned_to: createdMembers[0].id, // simran
      assigned_by: adminUser.id,
      priority: Priority.HIGH,
      status: TaskStatus.IN_PROGRESS,
      due_date: new Date('2026-08-25'),
      estimated_minutes: 240,
      started_at: new Date(),
    },
  });

  const task2 = await prisma.task.create({
    data: {
      project_id: project1.id,
      client_id: client1.id,
      title: 'Cinematic Teaser Video Cut (4K)',
      description: 'Edit 3-minute teaser reel with synced audio vows, slow motion gimbal shots and drone overlays.',
      category: TaskCategory.VIDEO_EDITING,
      assigned_to: createdMembers[1].id, // karan
      assigned_by: adminUser.id,
      priority: Priority.URGENT,
      status: TaskStatus.ASSIGNED,
      due_date: new Date('2026-08-28'),
      estimated_minutes: 360,
    },
  });

  // Task assignment records
  await prisma.taskAssignment.create({
    data: {
      task_id: task1.id,
      new_user_id: createdMembers[0].id,
      assigned_by: adminUser.id,
      reason: 'Initial assignment for album design specialist',
    },
  });

  await prisma.taskAssignment.create({
    data: {
      task_id: task2.id,
      new_user_id: createdMembers[1].id,
      assigned_by: adminUser.id,
      reason: 'Initial assignment for cinematic video lead',
    },
  });
  console.log('✅ Sample tasks and assignments created');

  // 10. Sample Notifications
  await prisma.notification.createMany({
    data: [
      {
        user_id: createdMembers[0].id,
        type: 'NEW_TASK',
        title: 'New Task Assigned: Wedding Album Editing',
        message: 'Task: Wedding Album Editing & Color Grading. Project: Rohan & Ananya Royal Wedding (Udaipur). Assigned by: Admin.',
        reference_id: task1.id,
        reference_type: 'TASK',
      },
      {
        user_id: createdMembers[1].id,
        type: 'NEW_TASK',
        title: 'New Task Assigned: Cinematic Teaser Video Cut',
        message: 'Task: Cinematic Teaser Video Cut (4K). Project: Rohan & Ananya Royal Wedding (Udaipur). Assigned by: Admin.',
        reference_id: task2.id,
        reference_type: 'TASK',
      },
    ],
  });

  // 11. Initial Audit Log
  await prisma.auditLog.create({
    data: {
      user_id: adminUser.id,
      action: 'SYSTEM_INITIALIZATION',
      module: 'SYSTEM',
      reference_id: 'SEED',
      new_value: JSON.stringify({ message: 'Database seeded with default Admin, Manager, Members, Projects, and Settings' }),
      ip_address: '127.0.0.1',
    },
  });

  console.log('🎉 Database seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
