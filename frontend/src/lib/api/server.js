import 'server-only';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export class ApiError extends Error {
  /**
   * @param {string} message
   * @param {number} statusCode
   * @param {string} [errorCode='API_ERROR']
   * @param {Record<string, string>} [fields]
   */
  constructor(message, statusCode, errorCode = 'API_ERROR', fields = undefined) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.errorCode = errorCode;
    this.fields = fields;
  }
}

const BACKEND_BASE = process.env.BACKEND_URL || 'http://localhost:4000';

/**
 * Server-only fetch wrapper that communicates directly with the Express backend.
 * Automatically forwards cookies from Next.js request context for authentication.
 *
 * @param {string} path - API endpoint path (e.g. '/api/admin/courses')
 * @param {object} [options]
 * @param {string[]} [options.tags] - Next.js cache tags
 * @param {number | false} [options.revalidate] - Cache revalidation window in seconds
 * @param {boolean} [options.forwardCookies=true] - Whether to forward incoming cookies
 * @param {RequestCache} [options.cache] - Cache policy ('no-store', 'force-cache', etc.)
 * @returns {Promise<any>} The unwrapped data payload from the API response envelope
 */
export async function apiGet(path, { tags = [], revalidate = false, forwardCookies = true, cache } = {}) {
  const headers = {
    Accept: 'application/json',
  };

  if (forwardCookies) {
    try {
      const cookieStore = await cookies();
      const cookieString = cookieStore.toString();
      if (cookieString) {
        headers.cookie = cookieString;
      }
    } catch {
      // In non-request contexts or static pre-rendering, cookies() may throw
    }
  }

  const fetchOptions = {
    headers,
    next: {
      ...(tags.length > 0 ? { tags } : {}),
      ...(typeof revalidate === 'number' ? { revalidate } : {}),
    },
  };

  if (cache) {
    fetchOptions.cache = cache;
  }

  const fullUrl = `${BACKEND_BASE}${path}`;
  const res = await fetch(fullUrl, fetchOptions);

  if (res.status === 401) {
    throw new ApiError('Authentication required', 401, 'UNAUTHORIZED');
  }

  let body;
  try {
    body = await res.json();
  } catch {
    throw new ApiError(`Unexpected response from server (HTTP ${res.status})`, res.status, 'INVALID_RESPONSE');
  }

  if (!res.ok || !body.ok) {
    throw new ApiError(
      body.error?.message || `API error (${res.status})`,
      res.status,
      body.error?.code || 'API_ERROR',
      body.error?.fields
    );
  }

  return body.data;
}

/**
 * Ensures the caller is authenticated as an admin. Redirects to /admin/login if not.
 * @returns {Promise<{ id: string, email: string }>}
 */
export async function requireAdminSession() {
  try {
    return await apiGet('/api/admin/auth/me', { forwardCookies: true, cache: 'no-store' });
  } catch (err) {
    if (err.statusCode === 401) {
      redirect('/admin/login');
    }
    throw err;
  }
}
