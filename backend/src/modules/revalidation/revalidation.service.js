import { env } from '../../config/env.js';
import { logger } from '../../shared/logger.js';

export class RevalidationService {
  /**
   * Registers event bus listeners for cache invalidation.
   * @param {import('../../shared/events/event-bus.js').eventBus} bus
   */
  registerListeners(bus) {
    bus.on('course.changed', async (payload) => {
      logger.info({ payload }, 'Triggering revalidation for course change');
      await this.revalidate(['courses']);
    });

    bus.on('settings.changed', async (payload) => {
      logger.info({ payload }, 'Triggering revalidation for settings change');
      await this.revalidate(['settings']);
    });
  }

  /**
   * Dispatches cache revalidation request to the frontend with timeout and 1 retry.
   * Catches all errors; never throws or disrupts callers.
   * @param {string[]} tags
   */
  async revalidate(tags) {
    if (!env.FRONTEND_REVALIDATE_URL) {
      logger.debug({ tags }, 'FRONTEND_REVALIDATE_URL not configured; skipping revalidation');
      return;
    }

    const payload = JSON.stringify({ tags });
    const headers = {
      'Content-Type': 'application/json',
      'x-revalidate-secret': env.REVALIDATE_SECRET,
    };

    const attemptPost = async () => {
      const response = await fetch(env.FRONTEND_REVALIDATE_URL, {
        method: 'POST',
        headers,
        body: payload,
        signal: AbortSignal.timeout(3000),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status} ${response.statusText}`);
      }

      return response;
    };

    try {
      await attemptPost();
      logger.info({ tags }, 'Frontend cache revalidation dispatched successfully');
    } catch (firstErr) {
      logger.warn(
        { err: firstErr.message, tags },
        'Initial frontend revalidation attempt failed; retrying once'
      );

      try {
        await attemptPost();
        logger.info({ tags }, 'Frontend cache revalidation succeeded on retry');
      } catch (retryErr) {
        logger.error(
          { err: retryErr.message, tags },
          'Frontend cache revalidation failed after retry'
        );
      }
    }
  }
}

export const revalidationService = new RevalidationService();
