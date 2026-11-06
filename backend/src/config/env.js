import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().int().positive().default(4000),
  MONGODB_URI: z.string().min(1, 'MONGODB_URI is required'),
  MONGODB_DB: z.string().default('datavalo'),
  AUTH_SECRET: z.string().min(32, 'AUTH_SECRET must be at least 32 characters'),
  IP_HASH_SECRET: z.string().min(32, 'IP_HASH_SECRET must be at least 32 characters'),
  FRONTEND_ORIGIN: z.string().url('FRONTEND_ORIGIN must be a valid URL').default('http://localhost:3000'),
  FRONTEND_REVALIDATE_URL: z.string().url('FRONTEND_REVALIDATE_URL must be a valid URL').default('http://localhost:3000/internal/revalidate'),
  REVALIDATE_SECRET: z.string().min(16, 'REVALIDATE_SECRET must be at least 16 characters'),
  TRUST_PROXY_HOPS: z.coerce.number().int().nonnegative().default(1),

  // Optional variables
  CLOUDINARY_CLOUD_NAME: z.string().optional(),
  CLOUDINARY_API_KEY: z.string().optional(),
  CLOUDINARY_API_SECRET: z.string().optional(),
  RESEND_API_KEY: z.string().optional(),
  LEAD_NOTIFY_EMAIL: z.string().email('LEAD_NOTIFY_EMAIL must be a valid email').optional().or(z.literal('')),
});

/**
 * Validates environment variables without leaking sensitive values.
 * @param {Record<string, unknown>} rawEnv
 * @param {boolean} [shouldExit=true]
 * @returns {z.infer<typeof envSchema>}
 */
export function validateEnv(rawEnv = process.env, shouldExit = true) {
  const parsed = envSchema.safeParse(rawEnv);

  if (!parsed.success) {
    const missingKeys = parsed.error.issues
      .map((issue) => `  - ${issue.path.join('.')}: ${issue.message}`)
      .join('\n');

    console.error(
      `\x1b[31m[CONFIG ERROR] Environment validation failed. Missing or invalid variables:\x1b[0m\n${missingKeys}\n` +
      `\x1b[33mCheck your .env against .env.example. Never print or log secret values.\x1b[0m`
    );

    if (shouldExit && rawEnv.NODE_ENV !== 'test') {
      process.exit(1);
    }
    throw new Error(`Environment validation failed:\n${missingKeys}`);
  }

  return parsed.data;
}

// Automatically validate on module evaluation unless in test environment without full vars
let env;
if (process.env.NODE_ENV === 'test') {
  // In tests, provide fallback mocks if not present
  env = {
    NODE_ENV: 'test',
    PORT: 4001,
    MONGODB_URI: process.env.MONGODB_URI || 'mongodb://localhost:27017/datavalo_test',
    MONGODB_DB: 'datavalo_test',
    AUTH_SECRET: process.env.AUTH_SECRET || 'test_auth_secret_minimum_32_characters_long_!',
    IP_HASH_SECRET: process.env.IP_HASH_SECRET || 'test_ip_hash_secret_minimum_32_characters_long_!',
    FRONTEND_ORIGIN: process.env.FRONTEND_ORIGIN || 'http://localhost:3000',
    FRONTEND_REVALIDATE_URL: process.env.FRONTEND_REVALIDATE_URL || 'http://localhost:3000/internal/revalidate',
    REVALIDATE_SECRET: process.env.REVALIDATE_SECRET || 'test_revalidate_secret_16chars',
    TRUST_PROXY_HOPS: 1,
  };
} else {
  env = validateEnv(process.env, true);
}

export { env };

