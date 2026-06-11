import { PrismaClient, Role } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');
  
  // Note: We are using a placeholder password hash here for the seed.
  // In a real application, you would use bcrypt.hash()
  const passwordHash = '$2b$10$X8O.N9V2z1g2p7x6Q8uOheM8Q2zZ8o2Y4x1G6Q9A5Z3x2w1v0'; // "admin123" dummy hash

  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@reom.co' },
    update: {},
    create: {
      username: 'admin',
      email: 'admin@reom.co',
      password_hash: passwordHash,
      role: Role.Admin,
    },
  });

  console.log('Database seeded! Admin user created with email: admin@reom.co');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
