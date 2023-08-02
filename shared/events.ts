import z from "zod";

const event = z.tuple

export const playerIDShape = z.object({ playerid: z.string() });
export const timerShape = z.object({ time: z.number().int() });
export const roomDataShape = z.object({
    playersIn: z.record(z.string(), z.object({ ready: z.boolean() })),
});


export const UserSSEEvents = z.object({
    close: event([]),
    gameStart: event([]),
    leave: event([playerIDShape]),
    join: event([playerIDShape]),
    ready: event([playerIDShape]),
    unready: event([playerIDShape]),
    roomData: event([roomDataShape]),
    countdown: event([timerShape]),
    initCountdown: event([timerShape]),
});

export type UserSSEEvents = z.infer<typeof UserSSEEvents>;
