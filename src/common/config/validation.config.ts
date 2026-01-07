import { z } from 'zod';

export const validationConfig = z.object({
  POSTGRES_URL: z.string().min(1, 'POSTGRES_URL is required'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  TYPE: z.string().default('postgres'),
  SYNCHRONIZE: z.string().default('false').transform((val) => {
    if (val === 'true') return true;
    if (val === 'false') return false;
    throw new Error('SYNCHRONIZE must be "true" or "false"');
  }),
  JWT_SECRET: z.string().min(1, 'JWT_SECRET is required'),
  JWT_EXPIRES_IN: z.string().default('24h'),
  JWT_REFRESH_SECRET: z.string().min(1, 'JWT_REFRESH_SECRET is required').default('sistema-horarios-refresh-secret-key'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),
  GMAIL_USER: z.string().min(1, 'GMAIL_USER is required'),
  GMAIL_APP_PASSWORD: z.string().min(1, 'GMAIL_APP_PASSWORD is required'),
});

