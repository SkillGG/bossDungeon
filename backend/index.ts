import { addRoute, addSSERoute, startServer } from "./server";
import {
    GameRoom,
    UserConnection as RoomConnection,
    UserConnection,
} from "./GameRoom";
import { SSEResponse, UserSSEConnection } from "./utils";
import { Request } from "express";
import z from "zod";
import { UserSSEEvents } from "../shared/events";

const gameRoom = new GameRoom();

addSSERoute(
    "/enter/:playerid",
    {
        connBuilder: () => {
            const conn = new RoomConnection(`${++RoomConnection.id}`);
            return conn;
        },
        method: "get",
    },
    (req: Request, res: SSEResponse<RoomConnection>, conn: RoomConnection) => {
        const enterRoomParams = z.object({ playerid: z.string() });
        const safeParams = enterRoomParams.safeParse(req.params);
        if (!safeParams.success) {
            res.status(404).send("Room link is not valid!");
            return;
        }
        const { playerid } = req.params;

        if (gameRoom.openedPlayers.has(playerid)) {
            res.status(400).send("Player already exists!");
            return;
        }

        res.sseevent("roomData", gameRoom.getReadyPlayersRecord());
        conn.once("close", () => {
            // close connection
            conn.close();
            // send to everyone that you're leaving
            gameRoom.leave(playerid);
        });

        conn.on("join", (data) => {
            // send join event to client
            res.sseevent("join", data);
        });
        conn.on("leave", (data) => {
            // send leave event to client
            res.sseevent("leave", data);
        });
        conn.on("ready", (data) => {
            // send ready event to client
            res.sseevent("ready", data);
        });
        conn.on("unready", (data) => {
            // send ready event to client
            res.sseevent("unready", data);
        });
        gameRoom.join(playerid, conn);
    }
);

addRoute("/lobby/ready/:playerid", { method: "get" }, (req, res) => {
    const enterRoomParams = z.object({ playerid: z.string() });
    const safeParams = enterRoomParams.safeParse(req.params);
    if (!safeParams.success) {
        res.status(404).send("Room link is not valid!");
        return;
    }
    const { playerid } = req.params;

    gameRoom.markReady(playerid);

    res.status(200).send(JSON.stringify({ status: "OK" }));
});

addRoute("/lobby/unready/:playerid", { method: "get" }, (req, res) => {
    const enterRoomParams = z.object({ playerid: z.string() });
    const safeParams = enterRoomParams.safeParse(req.params);
    if (!safeParams.success) {
        res.status(404).send("Room link is not valid!");
        return;
    }
    const { playerid } = req.params;

    gameRoom.markUnready(playerid);

    res.status(200).send(JSON.stringify({ status: "OK" }));
});

startServer(8080);
