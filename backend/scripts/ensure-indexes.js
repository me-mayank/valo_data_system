import { connectMongo, disconnectMongo } from '../src/shared/db/mongo.js';
import { logger } from '../src/shared/logger.js';

// Import models strictly via module public APIs or shared infrastructure
import { Admin } from '../src/modules/auth/index.js';
import { Course } from '../src/modules/courses/index.js';
import { Lead } from '../src/modules/leads/index.js';
import { CampusRequest } from '../src/modules/campus-requests/index.js';
import { SiteSettings } from '../src/modules/settings/index.js';
import { RateLimitEvent } from '../src/shared/rate-limit/rate-limit-event.model.js';

async function main() {
  try {
    logger.info('Connecting to database to synchronize indexes...');
    await connectMongo();

    const models = [
      { name: 'Admin', model: Admin },
      { name: 'Course', model: Course },
      { name: 'Lead', model: Lead },
      { name: 'CampusRequest', model: CampusRequest },
      { name: 'SiteSettings', model: SiteSettings },
      { name: 'RateLimitEvent', model: RateLimitEvent },
    ];

    for (const { name, model } of models) {
      logger.info(`Synchronizing indexes for ${name}...`);
      await model.syncIndexes();
    }

    logger.info('All model indexes successfully synchronized.');
    await disconnectMongo();
    process.exit(0);
  } catch (error) {
    logger.error({ error }, 'Error synchronizing database indexes');
    await disconnectMongo().catch(() => {});
    process.exit(1);
  }
}

main();

