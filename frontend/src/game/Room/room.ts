import { UserSSEEvents } from "../../../../shared/events";
import { DataParsers, EventEmitter, TypedEventSource } from "../../utils/utils";

type RoomEvents = Omit<UserSSEEvents, "close"> & {
    initData: [{ playerList: string[] }];
    connectionLost: [];
};

export type LobbyData = {
    ready: boolean;
};

export class Room extends EventEmitter<RoomEvents> {
    players: Set<string> = new Set();

    lobbyData: Map<string, LobbyData> = new Map();

    private _player?: string;
    eventSource?: TypedEventSource<UserSSEEvents>;

    countdownInt = 0;

    get player() {
        if (!this._player) throw "Did not set the player yet!";
        return this._player;
    }

    get playerLobbyData() {
        const pD = this.lobbyData.get(this.player);
        if (!pD) throw "Could not get player's data!";
        return pD;
    }

    loginAs(pl: string) {
        this._player = pl;
    }

    setRoomData(
        pl: Record<string, { ready: boolean }>,
        eS: TypedEventSource<UserSSEEvents>
    ) {
        this.players = new Set(Object.keys(pl));
        this.eventSource = eS;
        this.emit("initData", { playerList: [...this.players] });
        [...Object.entries(pl)]
            .filter((x) => x[1].ready)
            .forEach((x) => {
                this.ready(x[0]);
            });
        this.eventSource.onerror = () => {
            this.emit("connectionLost");
            alert("Server connection lost!");
            this.eventSource?.close();
            this.eventSource = undefined;
            this.players = new Set();
            this.lobbyData = new Map();
            this._player = undefined;
        };
        this.eventSource.on("join", DataParsers.usernameParser, (data) => {
            // on player joins
            this.playerJoined(data.playerid);
        });
        this.eventSource.on("leave", DataParsers.usernameParser, (data) => {
            this.playerLeft(data.playerid);
        });
        this.eventSource.on("ready", DataParsers.usernameParser, (data) => {
            this.ready(data.playerid);
        });
        this.eventSource.on("unready", DataParsers.usernameParser, (data) => {
            this.unready(data.playerid);
        });
        this.eventSource.on(
            "endCountdown",
            DataParsers.dataCounterParsed,
            (data) => {
                this.emit("endCountdown", data);
            }
        );
        this.eventSource.on(
            "initCountdown",
            DataParsers.counterParser,
            (data) => {
                this.emit("initCountdown", data);
            }
        );
        this.eventSource.on("countdown", DataParsers.counterParser, (data) => {
            this.emit("countdown", data);
        });
        this.eventSource.on(
            "terminateCountdown",
            DataParsers.counterParser,
            (data) => {
                this.emit("terminateCountdown", data);
            }
        );
    }

    playerJoined(pl: string) {
        this.players.add(pl);
        if (!this.lobbyData.has(pl)) this.lobbyData.set(pl, { ready: false });
        this.emit("join", { playerid: pl });
    }
    playerLeft(pl: string) {
        this.players.delete(pl);
        this.lobbyData.delete(pl);
        this.emit("leave", { playerid: pl });
    }
    ready(pl: string) {
        this.lobbyData.set(pl, { ready: true });
        this.emit("ready", { playerid: pl });
    }
    unready(pl: string) {
        this.lobbyData.set(pl, { ready: false });
        this.emit("unready", { playerid: pl });
    }
}
