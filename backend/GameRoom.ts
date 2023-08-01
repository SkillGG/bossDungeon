import { UserSSEConnection } from "./utils";

import { UserSSEEvents } from "./../shared/events";

export const userConnections: UserSSEConnection<UserSSEEvents>[] = [];

export class UserConnection extends UserSSEConnection<UserSSEEvents> {
    constructor(id: string) {
        super(id);
    }

    static get freeId() {
        return userConnections.length;
    }
}

export class PlayerData {
    constructor() {}
}

export class GameRoom {
    players: Map<string, UserConnection> = new Map();

    constructor() {}
    join(playerid: string, c: UserConnection) {
        UserConnection.emitToAll(userConnections, (c) => !c.isClosed)("join", {
            playerid,
        });
        this.players.set(playerid, c);
    }

    leave(playerid: string) {
        UserConnection.emitToAll(userConnections, (c) => !c.isClosed)("leave", {
            playerid,
        });
        this.players.delete(playerid);
    }
}
