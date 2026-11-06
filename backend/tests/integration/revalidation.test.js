import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { env } from '../../src/config/env.js';
import { eventBus } from '../../src/shared/events/event-bus.js';
import { revalidationService } from '../../src/modules/revalidation/index.js';

describe('Revalidation Module Integration Tests (Task 5, Acceptance Criteria)', () => {
  const origUrl = env.FRONTEND_REVALIDATE_URL;
  const origSecret = env.REVALIDATE_SECRET;

  beforeEach(() => {
    env.FRONTEND_REVALIDATE_URL = 'https://frontend.internal/api/internal/revalidate';
    env.REVALIDATE_SECRET = 'super-secret-revalidate-token-123';
    revalidationService.registerListeners(eventBus);
  });

  afterEach(() => {
    env.FRONTEND_REVALIDATE_URL = origUrl;
    env.REVALIDATE_SECRET = origSecret;
    vi.restoreAllMocks();
  });

  it('triggers HTTP POST to FRONTEND_REVALIDATE_URL with x-revalidate-secret and tags', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      status: 200,
      statusText: 'OK',
    });

    await revalidationService.revalidate(['courses']);

    expect(fetchSpy).toHaveBeenCalledTimes(1);
    const [url, options] = fetchSpy.mock.calls[0];

    expect(url).toBe('https://frontend.internal/api/internal/revalidate');
    expect(options.method).toBe('POST');
    expect(options.headers['x-revalidate-secret']).toBe('super-secret-revalidate-token-123');
    expect(options.headers['Content-Type']).toBe('application/json');
    expect(JSON.parse(options.body)).toEqual({ tags: ['courses'] });
  });

  it('retries once if initial request fails', async () => {
    const fetchSpy = vi
      .spyOn(globalThis, 'fetch')
      .mockRejectedValueOnce(new Error('Network connection reset'))
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        statusText: 'OK',
      });

    await revalidationService.revalidate(['settings']);

    expect(fetchSpy).toHaveBeenCalledTimes(2);
  });

  it('does NOT throw or interrupt caller when frontend revalidation permanently fails', async () => {
    vi.spyOn(globalThis, 'fetch').mockRejectedValue(new Error('Frontend completely down'));

    // Should resolve smoothly without throwing
    await expect(revalidationService.revalidate(['courses'])).resolves.not.toThrow();
  });

  it('eventBus listener catches course.changed and triggers revalidate', async () => {
    const revalSpy = vi.spyOn(revalidationService, 'revalidate').mockResolvedValue();

    eventBus.emit('course.changed', { action: 'publish', slug: 'test-course' });

    // Allow event loop to process event listener
    await new Promise((resolve) => setTimeout(resolve, 50));

    expect(revalSpy).toHaveBeenCalledWith(['courses']);
  });
});
