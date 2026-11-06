import { connectMongo, disconnectMongo } from '../src/shared/db/mongo.js';
import { logger } from '../src/shared/logger.js';
import { createAdmin, Admin } from '../src/modules/auth/index.js';

async function main() {
  const email = (process.env.ADMIN_EMAIL || process.argv[2] || '').trim();
  const password = (process.env.ADMIN_PASSWORD || process.argv[3] || '').trim();

  if (!email || !password) {
    console.error(
      '\x1b[31m[USAGE ERROR] Please provide admin credentials via environment variables or CLI arguments:\x1b[0m\n' +
      '  ADMIN_EMAIL="admin@datavalo.com" ADMIN_PASSWORD="secure_password_123" npm run seed:admin\n' +
      '  OR\n' +
      '  npm run seed:admin admin@datavalo.com secure_password_123'
    );
    process.exit(1);
  }

  if (password.length < 12) {
    console.error('\x1b[31m[VALIDATION ERROR] Admin password must be at least 12 characters.\x1b[0m');
    process.exit(1);
  }

  try {
    await connectMongo();

    // Check idempotency
    const existing = await Admin.findOne({ email: email.toLowerCase() });
    if (existing) {
      logger.info({ email }, 'Admin user already exists. Seed is idempotent. Skipping creation.');
      await disconnectMongo();
      process.exit(0);
    }

    const created = await createAdmin({ email, password });
    logger.info({ id: created._id, email: created.email }, 'Admin account successfully seeded.');

    await disconnectMongo();
    process.exit(0);
  } catch (error) {
    logger.error({ error }, 'Failed to seed admin account');
    await disconnectMongo().catch(() => {});
    process.exit(1);
  }
}

main();

