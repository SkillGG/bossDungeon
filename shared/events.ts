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
    optional,
} from "zod";
import { Card } from "./Cards/card";

const event = tuple;

export const playerIDShape = object({ playerid: string() });

export const cardDataShape = object({
    cardStr: string().regex(Card.stringRegex),
});

export const deckDataShape = object({
    deckStr: string(),
});

export const timerData = discriminatedUnion("type", [
    object({
        type: literal("pickBoss"),
        boss: cardDataShape,
    }),
    object({
        type: literal("gameLaunch"),
    }),
    object({
        type: literal("deckSelection"),
    }),
]);

export const timerType = union([
    literal("pickBoss"),
    literal("gameLaunch"),
    object({ type: literal("deckSelection"), deck: deckDataShape }),
]);

export const terminationReason = discriminatedUnion("type", [
    object({
        type: literal("disconnect"),
        playerid: playerIDShape.shape.playerid,
    }),
    object({ type: literal("noop") }),
]);

export const terminateTimerShape = object({
    type: timerType,
    reason: optional(terminationReason),
});

export const endTimerShape = object({
    data: timerData,
    type: timerType,
});

export const timerShape = object({
    time: number().int(),
    ms: number().int(),
    type: timerType,
});

export type timerShape = z.infer<typeof timerShape>;

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
    terminateCountdown: event([terminateTimerShape]),
    endCountdown: event([endTimerShape]),
});

export type UserSSEEvents = z.infer<typeof UserSSEEvents>;
export type timerData = z.infer<typeof timerData>;
export type timerType = z.infer<typeof timerType>;
export type terminationReason = z.infer<typeof terminationReason>;
