import EventEmitter from "events";
import express, { Express, Request, Response } from "express";
const app = express();

const addSSERoute = (
    route: string,
    sseFunction: (
        emitter: EventEmitter
    ) => (req: Request, res: Response) => void
) => {
    console.log("Adding SSE Route", route);
    app.get(route, (req, res) => {
        const emitter = new EventEmitter();
        console.log("Got /events");
        res.set({
            "Cache-Control": "no-cache",
            "Content-Type": "text/event-stream",
            Connection: "keep-alive",
        });
        res.flushHeaders();

        // Tell the client to retry every 10 seconds if connectivity is lost
        res.write("retry: 10000\n\n");

        res.on("close", () => {
            emitter.emit("close");
        });

        emitter.on("sendData", (data)=>{
            
        });

    });
};

const emitters: EventEmitter[] = [];

addSSERoute("/events", (emitter: EventEmitter) => {
    emitters.push(emitter);
    emitter.on("close", () => {
        // do closing action
    });
    emitter.on("", () => {});
    return () => {};
});

app.listen(8080, () => {
    console.log("listening on http://localhost:8080");
});
