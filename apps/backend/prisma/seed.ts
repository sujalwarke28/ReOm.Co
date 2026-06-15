import { PrismaClient, Role } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient({});

async function main() {
  console.log('Seeding database...');

  // Hash the new password "1234" using bcrypt (10 salt rounds)
  const passwordHash = await bcrypt.hash('1234', 10);

  await prisma.user.upsert({
    where: { email: 'sujal@admin.com' },
    update: { password_hash: passwordHash, status: 'Approved' },
    create: { username: 'admin_user', email: 'sujal@admin.com', password_hash: passwordHash, role: Role.Admin, status: 'Approved' },
  });

  await prisma.user.upsert({
    where: { email: 'sujal@manager.com' },
    update: { password_hash: passwordHash, status: 'Approved' },
    create: { username: 'manager_user', email: 'sujal@manager.com', password_hash: passwordHash, role: Role.Manager, status: 'Approved' },
  });

  await prisma.user.upsert({
    where: { email: 'sujal@ops.com' },
    update: { password_hash: passwordHash, status: 'Approved' },
    create: { username: 'ops_user', email: 'sujal@ops.com', password_hash: passwordHash, role: Role.OperationalStaff, status: 'Approved' },
  });

  await prisma.user.upsert({
    where: { email: 'sujal@exec.com' },
    update: { password_hash: passwordHash, status: 'Approved' },
    create: { username: 'exec_user', email: 'sujal@exec.com', password_hash: passwordHash, role: Role.Executive, status: 'Approved' },
  });

  console.log('Database seeded with 4 RBAC test users! (Password: 1234)');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
