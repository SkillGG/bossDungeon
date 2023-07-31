import z from "zod";

export const eventData = z.object({ type: z.string() });

export type eventData = z.infer<typeof eventData>;
