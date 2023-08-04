import z, {
    object,
    literal,
    record,
    number,
    string,
    discriminatedUnion,
    tuple,
    boolean,
    union,
} from "zod";
import { Card } from "./card";

const event = tuple;

export const playerIDShape = object({ playerid: string() });

export const cardDataShape = object({
    cardStr: string().regex(Card.stringRegex),
});

export const timerData = discriminatedUnion("type", [
    object({
        type: literal("pickBoss"),
        boss: cardDataShape,
    }),
    object({
        type: literal("gameLaunch"),
    }),
]);

export const timerType = union([literal("pickBoss"), literal("gameLaunch")]);

export const endTimerShape = object({
    time: number().int(),
    data: timerData,
});

export const timerShape = object({
    time: number().int(),
    type: timerType,
});

export const roomDataShape = object({
    playersIn: record(string(), object({ ready: boolean() })),
});

export const UserSSEEvents = object({
    close: event([]),
    leave: event([playerIDShape]),
    join: event([playerIDShape]),
    ready: event([playerIDShape]),
    unready: event([playerIDShape]),

    roomData: event([roomDataShape]),

    countdown: event([timerShape]),
    initCountdown: event([timerShape]),
    terminateCountdown: event([timerShape]),
    endCountdown: event([endTimerShape]),
});

export type UserSSEEvents = z.infer<typeof UserSSEEvents>;
export type timerData = z.infer<typeof timerData>;
export type timerType = z.infer<typeof timerType>;
