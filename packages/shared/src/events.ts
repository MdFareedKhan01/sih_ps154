import { z } from "zod";
import { Artifact, TaskStatus } from "./api.js";

// --------------------------------------------------
// WEBSOCKET EVENTS
// --------------------------------------------------

export const Frame = z.discriminatedUnion("event", [
  // -----------------------------------------------
  // TASK PROGRESS
  // -----------------------------------------------

  z.object({
    event: z.literal("task.progress"),

    seq: z.string(),

    task_id: z.string(),

    status: TaskStatus,

    detail: z.string().optional(),
  }),

  // -----------------------------------------------
  // TASK COMPLETED
  // -----------------------------------------------

  z.object({
    event: z.literal("task.completed"),

    seq: z.string(),

    task_id: z.string(),

    artifact: Artifact,
  }),

  // -----------------------------------------------
  // TASK FAILED
  // -----------------------------------------------

  z.object({
    event: z.literal("task.failed"),

    seq: z.string(),

    task_id: z.string(),

    error_code: z.string(),

    message: z.string(),

    retryable: z.boolean(),
  }),

  // -----------------------------------------------
  // BATCH COMPLETED
  // -----------------------------------------------

  z.object({
    event: z.literal("batch.completed"),

    seq: z.string(),

    batch_id: z.string(),

    overall_status: z.enum([
      "complete",
      "partial",
      "failed",
    ]),

    completed: z.number(),

    failed: z.number(),
  }),
]);

export type Frame = z.infer<typeof Frame>;

// --------------------------------------------------
// FRAME WITHOUT REDIS STREAM SEQUENCE
// --------------------------------------------------

type DistributiveOmit<
  T,
  K extends keyof any,
> = T extends unknown
  ? Omit<T, K>
  : never;

/**
 * A frame before the stream assigns its seq.
 */
export type FrameBody = DistributiveOmit<
  Frame,
  "seq"
>;