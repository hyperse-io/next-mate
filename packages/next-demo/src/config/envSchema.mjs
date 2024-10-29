import { z } from 'zod';

export const envSchema = z.object({
  // Prisma
  DATABASE_URL: z.string().url(),

  // NODE_ENV
  NODE_ENV: z.enum(['development', 'test', 'production']),
  PORT: z.string(),

  // OAUTH2
  GITHUB_CLIENT_ID: z.string(),
  GITHUB_CLIENT_SECRET: z.string(),

  // LUCIA_AUTH_URL
  LUCIA_AUTH_URL: z.string().url(),
  LUCIA_AUTH_SECRET: z.string(),
});
