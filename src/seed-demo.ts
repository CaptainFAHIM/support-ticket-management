import { config } from 'dotenv';
config();

import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';

async function seedDemo() {
  const dataSource = new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    synchronize: false,
  });

  await dataSource.initialize();

  
  const managerRows = await dataSource.query(
    `SELECT id FROM users WHERE email = $1`,
    ['manager@example.com'],
  );

  if (managerRows.length === 0) {
    console.error('❌ Please run "npm run seed:manager" first.');
    await dataSource.destroy();
    return;
  }

  const managerId = managerRows[0].id;

  const customers = [
    { email: 'customer1@test.com', name: 'Michael Brown' },
    { email: 'customer2@test.com', name: 'Mary Johnson' },
    { email: 'customer3@test.com', name: 'Robert Wilson' },
  ];

  const hashedPassword = await bcrypt.hash('customer123', 10);
  const customerIds: number[] = [];

  for (const c of customers) {
    const existing = await dataSource.query(
      `SELECT id FROM users WHERE email = $1`,
      [c.email],
    );

    if (existing.length > 0) {
      customerIds.push(existing[0].id);
      continue;
    }

    const inserted = await dataSource.query(
      `INSERT INTO users (email, password, role, name) VALUES ($1, $2, 'Customer', $3) RETURNING id`,
      [c.email, hashedPassword, c.name],
    );
    customerIds.push(inserted[0].id);
  }

  const tickets = [
    { title: 'Login issue', description: 'Cannot log into my account.', status: 'Open', priority: 'High', customerIdx: 0, assignee: managerId, rating: null },
    { title: 'Payment error', description: 'Payment failed during checkout.', status: 'InProgress', priority: 'Medium', customerIdx: 1, assignee: managerId, rating: null },
    { title: 'Feature request', description: 'Would like a dark mode option.', status: 'Resolved', priority: 'Low', customerIdx: 2, assignee: managerId, rating: 5 },
    { title: 'Account access', description: 'Locked out after password reset.', status: 'InProgress', priority: 'High', customerIdx: 0, assignee: managerId, rating: null },
    { title: 'Bug report', description: 'Dashboard chart not loading.', status: 'Resolved', priority: 'Medium', customerIdx: 1, assignee: managerId, rating: 4 },
    { title: 'Refund request', description: 'Requesting refund for duplicate charge.', status: 'Open', priority: 'Urgent', customerIdx: 2, assignee: null, rating: null },
  ];

  for (const t of tickets) {
    const customerId = customerIds[t.customerIdx];

    const existing = await dataSource.query(
      `SELECT id FROM tickets WHERE title = $1 AND "customerId" = $2`,
      [t.title, customerId],
    );
    if (existing.length > 0) continue;

    await dataSource.query(
      `INSERT INTO tickets (title, description, status, priority, "customerId", "assigneeId", rating)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [t.title, t.description, t.status, t.priority, customerId, t.assignee, t.rating],
    );
  }

  console.log('✅ Demo data seeded!');
  console.log('   Customer login : customer1@test.com / customer2@test.com / customer3@test.com');
  console.log('   Password       : customer123');
  console.log('   Manager ticket assigned');

  await dataSource.destroy();
}

seedDemo().catch((err) => {
  console.error('❌ Seeding failed:', err.message);
  process.exit(1);
});