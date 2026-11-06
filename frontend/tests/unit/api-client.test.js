import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { clientApi, ClientApiError } from '../../src/lib/api/client';

describe('Client API Fetch Wrapper (lib/api/client.js)', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it('unwraps data envelope on successful response and passes credentials: same-origin', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ ok: true, data: { name: 'Test Course' } }),
    });

    const data = await clientApi.get('/api/test');

    expect(data).toEqual({ name: 'Test Course' });
    expect(fetchSpy).toHaveBeenCalledTimes(1);
    const [url, options] = fetchSpy.mock.calls[0];
    expect(url).toBe('/api/test');
    expect(options.credentials).toBe('same-origin');
    expect(options.method).toBe('GET');
  });

  it('normalizes error envelope and throws ClientApiError with code and fields', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: false,
      status: 400,
      json: async () => ({
        ok: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Title is required',
          fields: { title: 'Required' },
        },
      }),
    });

    await expect(clientApi.post('/api/courses', {})).rejects.toThrow(ClientApiError);

    try {
      await clientApi.post('/api/courses', {});
    } catch (err) {
      expect(err.status).toBe(400);
      expect(err.code).toBe('VALIDATION_ERROR');
      expect(err.message).toBe('Title is required');
      expect(err.fields).toEqual({ title: 'Required' });
    }
  });

  it('triggers onSlow callback and window event when server takes >= 5 seconds to answer', async () => {
    let slowCalled = false;
    let resolveResponse;
    const pendingPromise = new Promise((resolve) => {
      resolveResponse = resolve;
    });

    vi.spyOn(globalThis, 'fetch').mockReturnValue(pendingPromise);

    const onSlow = () => {
      slowCalled = true;
    };

    const reqPromise = clientApi.get('/api/slow-endpoint', { onSlow });

    // Advance 4.9 seconds: onSlow should NOT have fired yet
    vi.advanceTimersByTime(4900);
    expect(slowCalled).toBe(false);

    // Advance to 5.0 seconds: onSlow MUST fire
    vi.advanceTimersByTime(200);
    expect(slowCalled).toBe(true);

    // Finally resolve response
    resolveResponse({
      ok: true,
      status: 200,
      json: async () => ({ ok: true, data: { status: 'awake' } }),
    });

    const result = await reqPromise;
    expect(result).toEqual({ status: 'awake' });
  });
});
