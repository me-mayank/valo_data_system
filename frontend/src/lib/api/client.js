/**
 * Normalized API error thrown by client fetch calls.
 */
export class ClientApiError extends Error {
  /**
   * @param {string} message
   * @param {number} status
   * @param {string} [code='API_ERROR']
   * @param {Record<string, string>} [fields]
   */
  constructor(message, status, code = 'API_ERROR', fields = undefined) {
    super(message);
    this.name = 'ClientApiError';
    this.status = status;
    this.code = code;
    this.fields = fields;
  }
}

/**
 * Executes a relative fetch with credentials, 60s timeout, error normalization,
 * and a 5s timer that fires onSlow callback (and browser window event).
 *
 * @param {string} path - Relative API URL (e.g. '/api/admin/auth/login')
 * @param {RequestInit & { onSlow?: () => void }} [options]
 * @returns {Promise<any>}
 */
async function request(path, options = {}) {
  const { onSlow, ...fetchOptions } = options;

  let slowTimer = null;
  let hasTriggeredSlow = false;

  const notifySlow = (isSlow) => {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('datavalo:slow-server', {
          detail: { isSlow, path },
        })
      );
    }
    if (isSlow && typeof onSlow === 'function') {
      onSlow();
    }
  };

  // Start 5-second timer for waking-up notification
  slowTimer = setTimeout(() => {
    hasTriggeredSlow = true;
    notifySlow(true);
  }, 5000);

  // Set 60-second abort signal
  const abortController = new AbortController();
  const timeoutId = setTimeout(() => abortController.abort(), 60000);

  const headers = {
    Accept: 'application/json',
    ...(fetchOptions.body ? { 'Content-Type': 'application/json' } : {}),
    ...(fetchOptions.headers || {}),
  };

  try {
    const res = await fetch(path, {
      ...fetchOptions,
      headers,
      credentials: 'same-origin',
      signal: abortController.signal,
    });

    clearTimeout(slowTimer);
    clearTimeout(timeoutId);

    if (hasTriggeredSlow) {
      notifySlow(false);
    }

    let body;
    try {
      body = await res.json();
    } catch {
      throw new ClientApiError(
        `Unexpected response from server (HTTP ${res.status})`,
        res.status,
        'INVALID_RESPONSE'
      );
    }

    if (!res.ok || !body.ok) {
      throw new ClientApiError(
        body.error?.message || `Request failed with status ${res.status}`,
        res.status,
        body.error?.code || 'API_ERROR',
        body.error?.fields
      );
    }

    return body.data;
  } catch (err) {
    clearTimeout(slowTimer);
    clearTimeout(timeoutId);

    if (hasTriggeredSlow) {
      notifySlow(false);
    }

    if (err instanceof ClientApiError) {
      throw err;
    }

    if (err.name === 'AbortError') {
      throw new ClientApiError(
        'Server request timed out after 60 seconds.',
        408,
        'TIMEOUT'
      );
    }

    throw new ClientApiError(
      err.message || 'Network connection failed. Please retry.',
      0,
      'NETWORK_ERROR'
    );
  }
}

export const clientApi = {
  get: (path, options) => request(path, { ...options, method: 'GET' }),
  post: (path, data, options) =>
    request(path, {
      ...options,
      method: 'POST',
      body: JSON.stringify(data),
    }),
  put: (path, data, options) =>
    request(path, {
      ...options,
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  patch: (path, data, options) =>
    request(path, {
      ...options,
      method: 'PATCH',
      body: JSON.stringify(data),
    }),
  delete: (path, options) => request(path, { ...options, method: 'DELETE' }),
};
