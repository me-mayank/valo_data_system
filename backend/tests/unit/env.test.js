import { describe, it, expect } from 'vitest';
import { validateEnv } from '../../src/config/env.js';

describe('Environment Variable Validation (Task 2)', () => {
  it('passes when all required variables are present and valid', () => {
    const validEnv = {
      NODE_ENV: 'development',
      PORT: '4000',
      MONGODB_URI: 'mongodb://localhost:27017/datavalo',
      MONGODB_DB: 'datavalo',
      AUTH_SECRET: 'a_very_long_random_auth_secret_with_at_least_32_chars',
      IP_HASH_SECRET: 'a_very_long_random_ip_secret_with_at_least_32_chars',
      FRONTEND_ORIGIN: 'http://localhost:3000',
      FRONTEND_REVALIDATE_URL: 'http://localhost:3000/internal/revalidate',
      REVALIDATE_SECRET: 'revalidate_secret_16chars_min',
      TRUST_PROXY_HOPS: '1',
    };

    const result = validateEnv(validEnv, false);
    expect(result.PORT).toBe(4000);
    expect(result.TRUST_PROXY_HOPS).toBe(1);
    expect(result.MONGODB_DB).toBe('datavalo');
  });

  it('fails fast and throws when required variables are missing', () => {
    const incompleteEnv = {
      NODE_ENV: 'development',
      // MONGODB_URI missing
      // AUTH_SECRET missing
    };

    expect(() => validateEnv(incompleteEnv, false)).toThrowError(
      /Environment validation failed/
    );
  });

  it('rejects short AUTH_SECRET and IP_HASH_SECRET (< 32 characters)', () => {
    const shortSecretEnv = {
      NODE_ENV: 'development',
      MONGODB_URI: 'mongodb://localhost:27017/datavalo',
      AUTH_SECRET: 'too_short',
      IP_HASH_SECRET: 'too_short',
      REVALIDATE_SECRET: 'too_short',
    };

    expect(() => validateEnv(shortSecretEnv, false)).toThrowError(
      /at least 32 characters/
    );
  });
});

