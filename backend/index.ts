import express, { Express, Request, Response } from "express";

import { EventEmitter, UserSSEConnection } from "./utils";

const app = express();

const getLastID = () => {
    return conns.length;
};

type UserSSEEvents = { close: []; sendData: [{ type: string }]; leave: [] };

const conns: UserSSEConnection<UserSSEEvents>[] = [];

const addSSERoute = (
    route: string,
    options: {
        connBuilder: (req: Request) => UserSSEConnection<UserSSEEvents>;
    },
    sseFunction: (
        req: Request,
        res: Response,
        conn: UserSSEConnection<UserSSEEvents>
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

        conn.on("sendData", (data) => {
            if (res.closed) {
                console.error("Connection closed!");
                return;
            }
            console.log("sending data", data);
            res.write("data: " + JSON.stringify(data) + "\n\n", (e) => {
                if (e) console.log(e);
            });
        });

        conns.push(conn);

        sseFunction(req, res, conn);
    });
};

addSSERoute(
    "/events",
    {
        connBuilder: () => {
            const conn = new UserSSEConnection(`${getLastID()}`);
            console.log("creating new connection", conn.userid);
            return conn;
        },
    },
    (req: Request, res: Response, conn: UserSSEConnection<UserSSEEvents>) => {
        conn.once("close", () => {
            // do closing action
            conn.close();
            UserSSEConnection.emitToAll(conns, (c) => !c.isClosed)("sendData", {
                type: "leave",
            });
        });
        conn.on("leave", () => {
            res.write("Player left!");
        });
        UserSSEConnection.emitToAll(conns, (c) => !c.isClosed)("sendData", {
            type: "join",
        });
        return () => {};
    }
);

app.listen(8080, () => {
    console.log("listening on http://localhost:8080");
});
