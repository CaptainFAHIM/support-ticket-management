// Fahim — Admin seeder
// Run with: npm run seed:admin

import { config } from 'dotenv';
config();

import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';

const ADMIN_EMAIL = 'admin@example.com';
const ADMIN_PASSWORD = 'admin123';

async function seedAdmin() {
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

  const existing = await dataSource.query(
    `SELECT id FROM users WHERE email = $1`,
    [ADMIN_EMAIL],
  );

  if (existing.length > 0) {
    console.log(`✅ Admin already exists: ${ADMIN_EMAIL}`);
    await dataSource.destroy();
    return;
  }

  const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 10);

  await dataSource.query(
    `INSERT INTO users (email, password, role) VALUES ($1, $2, 'Admin')`,
    [ADMIN_EMAIL, hashedPassword],
  );

  console.log('✅ Admin seeded successfully!');
  console.log(`   Email    : ${ADMIN_EMAIL}`);
  console.log(`   Password : ${ADMIN_PASSWORD}`);

  await dataSource.destroy();
}

seedAdmin().catch((err) => {
  console.error('❌ Seeding failed:', err.message);
  process.exit(1);
});
