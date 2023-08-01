import { userConnections } from "./GameRoom";
import { ConnectionGeneric, SSEResponse, UserSSEConnection } from "./utils";

import express, { Request } from "express";

const app = express();

export const addSSERoute = <Connection extends UserSSEConnection<any>>(
    route: string,
    options: {
        connBuilder: (req: Request) => Connection;
    },
    sseFunction: (
        req: Request,
        res: SSEResponse<ConnectionGeneric<Connection>>,
        conn: Connection
    ) => void
) => {
    console.log("Adding SSE Route", route);
    app.get(route, (req, res) => {
        const conn = options.connBuilder(req);
        req.socket.setTimeout(0);
        req.socket.setNoDelay(true);
        req.socket.setKeepAlive(true);
        res.statusCode = 200;
        res.setHeader("Content-Type", "text/event-stream");
        res.setHeader("Cache-Control", "no-cache");
        res.setHeader("X-Accel-Buffering", "no");
        res.setHeader("Access-Control-Allow-Origin", "*");
        if (req.httpVersion !== "2.0") {
            res.setHeader("Connection", "keep-alive");
        }
        console.log("Somebody requested /events");

        res.on("close", () => {
            conn.emit("close");
        });

        userConnections.push(conn);

        const sseRes = new SSEResponse(res);

        sseFunction(req, sseRes, conn);
    });
};

export const startServer = (port: number, then?: () => void) => {
    app.listen(
        port,
        then ||
            (() => {
                console.log("listening on http://localhost:8080");
            })
    );
};
