import { EventEmitter } from 'events';
import { logger } from '../logger.js';

class SafeEventBus {
  constructor() {
    this.emitter = new EventEmitter();
    this.emitter.setMaxListeners(20);
  }

  /**
   * Emits an in-process event. Errors in listeners are logged and never fail the caller.
   * @param {string} event
   * @param {unknown} payload
   */
  emit(event, payload) {
    setImmediate(async () => {
      const listeners = this.emitter.rawListeners(event);
      for (const listener of listeners) {
        try {
          await listener(payload);
        } catch (error) {
          logger.error({ error, event }, 'Error occurred in event listener');
        }
      }
    });
  }

  /**
   * Registers a listener for an in-process event.
   * @param {string} event
   * @param {(payload: any) => Promise<void> | void} handler
   */
  on(event, handler) {
    this.emitter.on(event, handler);
  }
}

export const eventBus = new SafeEventBus();

