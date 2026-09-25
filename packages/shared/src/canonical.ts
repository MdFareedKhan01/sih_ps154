import { z } from "zod";

const Refs = z.array(z.string()).min(1);

export const Severity = z.enum([
  "critical",
  "high",
  "medium",
  "low",
  "unknown",
]);

export type Severity = z.infer<typeof Severity>;

export const Canonical = z.object({
  title: z.string(),

  severity: z.object({
    value: Severity,
    source_refs: z.array(z.string()),
  }),

  entities: z.array(
    z.object({
      name: z.string(),
      type: z.enum([
        "threat_actor",
        "organisation",
        "malware",
        "vulnerability",
        "product",
        "sector",
        "location",
        "other",
      ]),
      source_refs: Refs,
    })
  ),

  events: z.array(
    z.object({
      summary: z.string(),
      when: z.string().nullable(),
      source_refs: Refs,
    })
  ),

  affected_systems: z.array(
    z.object({
      name: z.string(),
      source_refs: Refs,
    })
  ),

  indicators: z.array(
    z.object({
      type: z.enum([
        "domain",
        "ip",
        "url",
        "hash",
        "email",
        "cve",
        "file",
        "other",
      ]),
      value: z.string(),
      source_refs: Refs,
    })
  ),

  key_facts: z.array(
    z.object({
      text: z.string(),
      status: z.enum(["fact", "inference"]),
      source_refs: Refs,
    })
  ),

  recommendations: z.array(
    z.object({
      text: z.string(),
      source_refs: Refs,
    })
  ),
});

export type Canonical = z.infer<typeof Canonical>;