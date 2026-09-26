import 'dotenv/config';
import { z } from 'zod';

const Env = z.object({
  GROQ_API_KEY: z.string().min(1),
  CLOUD_MODEL: z.string().min(1),
  CLOUD_RPM: z.coerce.number().positive(),

  OLLAMA_URL: z.string().url(),
  LOCAL_MODEL: z.string().min(1),
  LOCAL_NUM_CTX: z.coerce.number().positive(),
  LOCAL_TIMEOUT_MS: z.coerce.number().positive(),

  REDACT_TERMS: z.string().optional().default(''),
  DEMO_PERTURB: z.coerce.number().default(0),
});

export const env = Env.parse(process.env);

export const redactTerms = env.REDACT_TERMS
  .split(',')
  .map((term) => term.trim())
  .filter(Boolean);