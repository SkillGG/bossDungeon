import { UserSSEEvents } from "../../../shared/events";
import { TypedEventSource } from "./utils";

export class Server {
    static serverPath = "http://localhost:8080";
    static sendRoomEnter(id: string) {
        return new TypedEventSource<UserSSEEvents>(
            `http://localhost:8080/enter/${id}`
        );
    }

    static async sendToServer(path: string, init: RequestInit) {
        window.document.body.style.cursor = "wait";
        return await fetch(this.serverPath + path, init)
            .then(async (r: Response) => {
                window.document.body.style.cursor = "";
                if (r.ok) {
                    return r.json();
                } else {
                    throw "Erroneous response! " + r.body;
                }
            })
            .catch((err) => {
                console.error(err);
            });
    }
}
