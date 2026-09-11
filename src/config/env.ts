import { z } from 'zod';

const envSchema = z.object({
  VITE_API_URL: z.string().url().default('http://localhost:3000'),
});

const parsed = envSchema.parse({
  VITE_API_URL: import.meta.env.VITE_API_URL,
});

export const env = {
  apiUrl: parsed.VITE_API_URL.replace(/\/$/, ''),
};
