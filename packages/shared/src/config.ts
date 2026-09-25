import { z } from "zod";

export const Classification = z.enum([
  "public",
  "internal",
  "restricted",
]);

export type Classification = z.infer<typeof Classification>;

export const Config = z.object({
  audience: z.string().min(2).max(80),
  tone: z.enum(["formal", "neutral", "conversational"]),
  detail: z.enum(["brief", "medium", "detailed"]),
  language: z.enum(["en", "hi"]),
});

export type Config = z.infer<typeof Config>;

export const ConfigOverrides = Config.partial();