import z from "zod";

export const UserSSEEvents = z.object({
    close: z.tuple([]),
    leave: z.tuple([z.object({ playerid: z.string() })]),
    join: z.tuple([z.object({ playerid: z.string() })]),
    roomData: z.tuple([
        z.object({
            playersIn: z.array(z.string()),
        }),
    ]),
});

export type UserSSEEvents = z.infer<typeof UserSSEEvents>;
