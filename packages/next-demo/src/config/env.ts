import { envSchema } from './envSchema.mjs';

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  console.error(
    '❌ Invalid environment variables:',
    JSON.stringify(parsedEnv.error.format(), null, 4)
  );
}

export const env = parsedEnv.data!;
