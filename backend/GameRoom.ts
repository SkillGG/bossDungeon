import { UserSSEConnection } from "./utils";

import { UserSSEEvents } from "./../shared/events";

export class UserConnection extends UserSSEConnection<UserSSEEvents> {
    constructor(id: string) {
        super(id);
    }
    static id: number = 0;
}

export class GameRoom {
    players: Map<string, UserConnection> = new Map();
    readyPlayers: Set<string> = new Set();

    get openedPlayers() {
        return new Set(
            [...this.players].filter((c) => !c[1].isClosed).map((q) => q[0])
        );
    }

    get openConnections() {
        return [...this.players].map((q) => q[1]).filter((c) => !c.isClosed);
    }

    gameInProgress = false;

    countdownTimer?: NodeJS.Timer;

    constructor() {}

    getRoomData() {
        const ret: UserSSEEvents["roomData"][0] = { playersIn: {} };
        for (const [pl] of this.players) {
            ret.playersIn[pl] = { ready: this.readyPlayers.has(pl) };
        }
        return ret;
    }

    startGame() {
        //
    }

    startCountdown() {
        if (this.countdownTimer) return;
        let ctd = 5;
        UserConnection.emitToAll(this.openConnections)("initCountdown", {
            time: ctd,
        });
        this.countdownTimer = setInterval(() => {
            if (!this.countdownTimer) return;
            ctd--;
            UserConnection.emitToAll(this.openConnections)("countdown", {
                time: ctd,
            });
            if (ctd <= 0) {
                clearInterval(this.countdownTimer);
                this.countdownTimer = undefined;
                console.log("The end of the timer!");
                UserConnection.emitToAll(this.openConnections)("gameStart");
            }
        }, 1000);
    }

    terminateCountdown() {
        if (!this.countdownTimer) return;
        clearInterval(this.countdownTimer);
        this.countdownTimer = undefined;
        UserConnection.emitToAll(this.openConnections)("terminateCountdown");
    }

    join(playerid: string, c: UserConnection) {
        this.players.set(playerid, c);
        UserConnection.emitToAll(this.openConnections)("join", {
            playerid,
        });
    }

    leave(playerid: string) {
        this.players.delete(playerid);
        this.readyPlayers.delete(playerid);
        UserConnection.emitToAll(this.openConnections)("leave", {
            playerid,
        });
        if (this.countdownTimer) {
            this.terminateCountdown();
        }
    }

    get allPlayersReady() {
        return [...this.openedPlayers].reduce(
            (p, n) => (!p ? p : this.readyPlayers.has(n)),
            true
        );
    }

    markReady(playerid: string) {
        this.readyPlayers.add(playerid);
        UserConnection.emitToAll(this.openConnections)("ready", { playerid });
        console.log(this.openedPlayers.size, this.allPlayersReady);
        if (this.openedPlayers.size === 4 && this.allPlayersReady) {
            this.startCountdown();
        }
    }

    markUnready(playerid: string) {
        this.readyPlayers.delete(playerid);
        UserConnection.emitToAll(this.openConnections)("unready", { playerid });
        if (this.countdownTimer) {
            this.terminateCountdown();
        }
    }
}
