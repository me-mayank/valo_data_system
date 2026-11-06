import { connectMongo, disconnectMongo } from '../src/shared/db/mongo.js';
import { logger } from '../src/shared/logger.js';
import { Course } from '../src/modules/courses/index.js';
import { Lead } from '../src/modules/leads/index.js';
import { CampusRequest } from '../src/modules/campus-requests/index.js';
import { SiteSettings } from '../src/modules/settings/index.js';

async function main() {
  try {
    logger.info('Connecting to database to generate backup...');
    await connectMongo();

    const backupData = {
      timestamp: new Date().toISOString(),
      courses: await Course.find().lean(),
      leads: await Lead.find().lean(),
      campusRequests: await CampusRequest.find().lean(),
      settings: await SiteSettings.find().lean(),
    };

    logger.info(
      {
        courses: backupData.courses.length,
        leads: backupData.leads.length,
        campusRequests: backupData.campusRequests.length,
      },
      'Backup data snapshot generated successfully'
    );

    // In production or script execution, can write to a file or stdout
    await disconnectMongo();
    process.exit(0);
  } catch (error) {
    logger.error({ error }, 'Error during backup execution');
    await disconnectMongo().catch(() => {});
    process.exit(1);
  }
}

main();

