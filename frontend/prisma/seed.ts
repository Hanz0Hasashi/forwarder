import { PrismaClient, Role } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Upsert Users
  const admin = await prisma.user.upsert({
    where: { email: 'admin@shutupforwarder.com' },
    update: {},
    create: {
      email: 'admin@shutupforwarder.com',
      name: 'System Admin',
      role: Role.ADMIN,
    },
  });

  const customer = await prisma.user.upsert({
    where: { email: 'customer@example.com' },
    update: {},
    create: {
      email: 'customer@example.com',
      name: 'Alice Customer',
      role: Role.CUSTOMER,
    },
  });

  const forwarder = await prisma.user.upsert({
    where: { email: 'forwarder@example.com' },
    update: {},
    create: {
      email: 'forwarder@example.com',
      name: 'Bob Transporter',
      role: Role.FORWARDER,
    },
  });
  
  console.log('✅ Users seeded');

  // Clear existing jobs and bids to re-seed properly
  await prisma.bid.deleteMany({});
  await prisma.job.deleteMany({});
  console.log('🧹 Cleared existing jobs and bids');

  const makes = ['Toyota', 'Ford', 'Honda', 'Chevrolet', 'BMW', 'Audi', 'Mercedes', 'Nissan', 'Hyundai', 'Kia'];
  const models = ['Camry', 'Mustang', 'Civic', 'Silverado', 'X5', 'A4', 'C-Class', 'Altima', 'Elantra', 'Sorento'];
  const locations = ['Los Angeles, CA', 'San Francisco, CA', 'Austin, TX', 'Dallas, TX', 'New York, NY', 'Miami, FL', 'Chicago, IL', 'Seattle, WA', 'Denver, CO', 'Phoenix, AZ'];
  const statuses = ['Reviewing', 'Pending Client Approval', 'Pending Pickup', 'In Transit', 'Completed', 'Canceled'];
  
  const newJobs = [];

  for (let i = 0; i < 20; i++) {
    const make = makes[Math.floor(Math.random() * makes.length)];
    const model = models[Math.floor(Math.random() * models.length)];
    const year = 2010 + Math.floor(Math.random() * 15);
    const runs = Math.random() > 0.2 ? 'Yes' : 'No';
    const pickup = locations[Math.floor(Math.random() * locations.length)];
    let delivery = locations[Math.floor(Math.random() * locations.length)];
    while (pickup === delivery) {
      delivery = locations[Math.floor(Math.random() * locations.length)];
    }
    const distance = `${100 + Math.floor(Math.random() * 900)} miles`;
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    const targetPrice = 300 + Math.floor(Math.random() * 700);

    const job = await prisma.job.create({
      data: {
        customerId: customer.id,
        make,
        model,
        year,
        runs,
        notes: runs === 'Yes' ? 'Drives fine' : 'Engine issues, needs winch',
        pickup,
        delivery,
        distance,
        aiIsValid: true,
        aiReasoning: 'Standard AI review.',
        aiComplexity: runs === 'Yes' ? 'LOW' : 'MEDIUM',
        targetPrice,
        status,
        forwarderId: ['Pending Pickup', 'In Transit', 'Completed'].includes(status) ? forwarder.id : null,
      }
    });
    
    newJobs.push(job);

    // Add bids for some jobs (70% chance)
    if (Math.random() > 0.3) {
      let bidStatus = 'PENDING_AI_REVIEW';
      if (['Pending Pickup', 'In Transit', 'Completed'].includes(status)) bidStatus = 'ACCEPTED';
      if (status === 'Pending Client Approval') bidStatus = 'AWAITING_CLIENT_APPROVAL';
      if (status === 'Canceled') bidStatus = 'REJECTED_BY_CLIENT';

      await prisma.bid.create({
        data: {
          jobId: job.id,
          forwarderId: forwarder.id,
          driverName: forwarder.name || 'Bob Transporter',
          amount: targetPrice + (Math.random() > 0.5 ? 50 : -50),
          aiCounterAmount: bidStatus === 'AWAITING_CLIENT_APPROVAL' || bidStatus === 'ACCEPTED' ? targetPrice : null,
          status: bidStatus
        }
      });
    }
  }
  console.log(`✅ ${newJobs.length} Jobs and Bids seeded`);

  console.log('✨ Seeding finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
