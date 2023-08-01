import { addSSERoute, startServer } from "./server";
import {
    GameRoom,
    UserConnection as RoomConnection,
    userConnections,
} from "./GameRoom";
import { SSEResponse, UserSSEConnection } from "./utils";
import { Request } from "express";
import z from "zod";

const gameRoom = new GameRoom();

addSSERoute(
    "/enter/:playerid",
    {
        connBuilder: () => {
            const conn = new RoomConnection(`${RoomConnection.freeId}`);
            console.log("creating new connection", conn.userid);
            return conn;
        },
    },
    (req: Request, res: SSEResponse<RoomConnection>, conn: RoomConnection) => {
        const enterRoomParams = z.object({ playerid: z.string() });
        const safeParams = enterRoomParams.safeParse(req.params);
        if (!safeParams.success) {
            res.status(404).send("Event source link is not valid!");
            return;
        }
        const { playerid } = req.params;

        console.log("player joined id: ", playerid);

        res.sseevent("roomData", {
            playersIn: [...gameRoom.players].map((p) => p[0]),
        });

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
        gameRoom.join(playerid, conn);
    }
);

startServer(8080);
