import { app } from './app.js';
import { env } from './config/env.js';
import { logger } from './shared/logger.js';
import { connectMongo, disconnectMongo } from './shared/db/mongo.js';

let server;

async function bootstrap() {
  try {
    await connectMongo();

    server = app.listen(env.PORT, () => {
      logger.info(
        { port: env.PORT, env: env.NODE_ENV },
        `Data Valo System backend running on port ${env.PORT}`
      );
    });

    const shutdown = async (signal) => {
      logger.info({ signal }, 'Shutdown signal received. Closing gracefully...');

      if (server) {
        server.close(async () => {
          logger.info('HTTP server closed');
          await disconnectMongo();
          logger.info('Process terminated gracefully');
          process.exit(0);
        });

        // Force shutdown after 10 seconds if connections hang
        setTimeout(() => {
          logger.error('Forced shutdown due to timeout');
          process.exit(1);
        }, 10000).unref();
      }
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));
  } catch (error) {
    logger.fatal({ error }, 'Fatal error during server bootstrap');
    process.exit(1);
  }
}

bootstrap();

