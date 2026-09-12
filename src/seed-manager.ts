
import { config } from 'dotenv';
config();

import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';

const MANAGER_EMAIL = 'manager@example.com';
const MANAGER_PASSWORD = 'manager123';
const MANAGER_NAME = 'Default Manager';

async function seedManager() {
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

  const hashedPassword = await bcrypt.hash(MANAGER_PASSWORD, 10);

  const existing = await dataSource.query(
    `SELECT id FROM users WHERE email = $1`,
    [MANAGER_EMAIL],
  );

  if (existing.length > 0) {
    await dataSource.query(
      `UPDATE users SET password = $1, role = 'Manager' WHERE email = $2`,
      [hashedPassword, MANAGER_EMAIL],
    );
    console.log(`✅ Existing manager updated with new password: ${MANAGER_EMAIL}`);
  } else {
    await dataSource.query(
      `INSERT INTO users (email, password, role, name) VALUES ($1, $2, 'Manager', $3)`,
      [MANAGER_EMAIL, hashedPassword, MANAGER_NAME],
    );
    console.log('✅ Manager seeded successfully!');
  }

  console.log(`   Email    : ${MANAGER_EMAIL}`);
  console.log(`   Password : ${MANAGER_PASSWORD}`);

  await dataSource.destroy();
}

seedManager().catch((err) => {
  console.error('❌ Seeding failed:', err.message);
  process.exit(1);
});