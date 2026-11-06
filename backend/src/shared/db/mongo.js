import mongoose from 'mongoose';
import { logger } from '../logger.js';
import { env } from '../../config/env.js';

let isConnected = false;

/**
 * Connects to MongoDB with connection pooling and caching.
 * @param {string} [uri]
 * @param {string} [dbName]
 * @returns {Promise<typeof mongoose>}
 */
export async function connectMongo(uri = env.MONGODB_URI, dbName = env.MONGODB_DB) {
  if (isConnected && mongoose.connection.readyState === 1) {
    return mongoose;
  }

  mongoose.set('bufferCommands', false);

  try {
    await mongoose.connect(uri, {
      dbName,
      maxPoolSize: 5,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });

    isConnected = true;
    logger.info({ db: dbName }, 'MongoDB connection established');

    mongoose.connection.on('error', (err) => {
      logger.error({ err }, 'MongoDB connection error');
    });

    mongoose.connection.on('disconnected', () => {
      isConnected = false;
      logger.warn('MongoDB disconnected');
    });

    return mongoose;
  } catch (error) {
    logger.error({ error }, 'Failed to connect to MongoDB');
    throw error;
  }
}

/**
 * Gracefully disconnects from MongoDB.
 */
export async function disconnectMongo() {
  if (isConnected || mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
    isConnected = false;
    logger.info('MongoDB disconnected cleanly');
  }
}

export { mongoose };

