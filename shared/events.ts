import z from "zod";

const eventData = z.object({ type: z.string() });

type eventData = z.infer<typeof eventData>;
