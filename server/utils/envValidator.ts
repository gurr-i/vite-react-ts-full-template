// Add new file for environment validation
import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']),
  DATABASE_URL: z.string().min(1),
  SESSION_SECRET: z.string().min(32),
  PORT: z.string().default('5000')
});

export const env = envSchema.parse(process.env);