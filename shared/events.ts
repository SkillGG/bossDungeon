import z from "zod";

export const playerIDShape = z.object({ playerid: z.string() });
export const timerShape = z.object({ time: z.number().int() });
export const roomDataShape = z.object({
    playersIn: z.record(z.string(), z.object({ ready: z.boolean() })),
});

export const UserSSEEvents = z.object({
    close: z.tuple([]),
    leave: z.tuple([playerIDShape]),
    join: z.tuple([playerIDShape]),
    ready: z.tuple([playerIDShape]),
    unready: z.tuple([playerIDShape]),
    roomData: z.tuple([roomDataShape]),
    countdown: z.tuple([timerShape]),
    initCountdown: z.tuple([timerShape]),
});

export type UserSSEEvents = z.infer<typeof UserSSEEvents>;
