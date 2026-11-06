import { connectMongo, disconnectMongo } from '../src/shared/db/mongo.js';
import { logger } from '../src/shared/logger.js';

// Public API imports only
import { ensureDefaultSettings } from '../src/modules/settings/index.js';
import { seedSampleCourses } from '../src/modules/courses/index.js';

async function main() {
  try {
    logger.info('Connecting to database to seed initial content...');
    await connectMongo();

    logger.info('Ensuring default site settings document...');
    const settings = await ensureDefaultSettings();
    logger.info({ key: settings.key }, 'Site settings initialized');

    logger.info('Seeding sample courses (1 draft, 2 published)...');
    const courseResult = await seedSampleCourses();
    logger.info(courseResult, 'Course seed operation completed');

    await disconnectMongo();
    logger.info('Content seeding completed successfully.');
    process.exit(0);
  } catch (error) {
    logger.error({ error }, 'Error seeding content');
    await disconnectMongo().catch(() => {});
    process.exit(1);
  }
}

main();

