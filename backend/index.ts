import { addRoute, addSSERoute, startServer } from "./server";
import { GameRoom, UserConnection as RoomConnection } from "./GameRoom";
import { SSEResponse } from "./utils";
import { Request } from "express";
import { playerIDShape } from "../shared/events";

const gameRoom = new GameRoom();

addSSERoute(
    "/enter/:playerid",
    {
        connBuilder: (req) => {
            const connection = new RoomConnection(`${++RoomConnection.id}`);
            connection.prefix = req.params.playerid || `${RoomConnection.id}`;
            return connection;
        },
        method: "get",
    },
    (req: Request, res: SSEResponse<RoomConnection>, conn: RoomConnection) => {
        // res is hermes => client messenger ("hermes")
        // conn is hermes <=> room

        const safeParams = playerIDShape.safeParse(req.params);
        if (!safeParams.success) {
            res.raw.status(404).send("Room link is not valid!");
            return;
        }
        const { playerid } = safeParams.data;

        if (gameRoom.openedPlayers.has(playerid)) {
            res.raw.status(400).send("Player already exists!");
            return;
        }
        res.sseevent("roomData", gameRoom.getRoomLobbyData());
        conn.once("close", () => {
            // close connection
            conn.close();
            // send to everyone that player is leaving
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
        conn.on("initCountdown", (data) => {
            res.sseevent("initCountdown", data);
        });
        conn.on("countdown", (data) => {
            res.sseevent("countdown", data);
        });
        conn.on("endCountdown", (data) => res.sseevent("endCountdown", data));
        conn.on("terminateCountdown", (data) =>
            res.sseevent("terminateCountdown", data)
        );
        // send to everyone that player is joining
        gameRoom.join(playerid, conn);
    }
);

addRoute("/lobby/ready/:playerid", { method: "get" }, (req, res) => {
    const safeParams = playerIDShape.safeParse(req.params);
    if (!safeParams.success) {
        res.status(404).send("Room link is not valid!");
        return;
    }
    const { playerid } = safeParams.data;

    gameRoom.markReady(playerid);

    res.status(200).send(JSON.stringify({ status: "OK" }));
});

addRoute("/lobby/unready/:playerid", { method: "get" }, (req, res) => {
    const safeParams = playerIDShape.safeParse(req.params);
    if (!safeParams.success) {
        res.status(404).send("Room link is not valid!");
        return;
    }
    const { playerid } = safeParams.data;

    gameRoom.markUnready(playerid);

    res.status(200).send(JSON.stringify({ status: "OK" }));
});

startServer(8080);
