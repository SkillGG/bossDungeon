import { UserSSEEvents } from "../../../../shared/events";
import { ObjectManager } from "../../components/ObjectManager";
import { Label } from "../../components/Primitives/Label/Label";
import { RectangleBounds } from "../../components/Primitives/Rectangle/RectangleBounds";
import { StateManager } from "../../components/StateManager";
import { GameState } from "../../main";

export class Room extends StateManager<GameState> {
    static DefaultID = "room";
    get defaultID() {
        return Room.DefaultID;
    }

    players: Set<string> = new Set();
    eventSource?: EventSource;
    labels: Label[] = [];

    constructor(manager: ObjectManager<GameState>) {
        super(Room.DefaultID, manager, GameState.GAME);
    }

    moveLabels() {
        this.labels.forEach((e, i) => {
            e.bounds = new RectangleBounds(250, 20 + 40 * i, 0, 0);
        });
    }

    addPlayerLabel(pl: string) {
        const label = new Label(`${pl}_label`, RectangleBounds.zero, pl, {
            label: {
                font: "3em normal Arial",
                textColor: "red",
            },
        });
        this.labels.push(label);
        this.registerObject(label);
        console.log("adding player", pl, "label");
        this.moveLabels();
    }
    removePlayerLabel(pl: string) {
        const lb = this.labels.find((l) => l.text === pl);
        if (lb) {
            this.removeObject(lb);
            this.labels = this.labels.filter((l) => l.text !== pl);
        }
        this.moveLabels();
    }
    setRoomData(pl: string[], eS: EventSource) {
        this.players = new Set(pl);
        this.labels = [];
        this.eventSource = eS;
        this.eventSource.addEventListener(
            "join",
            (event: MessageEvent<string>) => {
                console.log(event);
                const data = event.data;
                const username = UserSSEEvents.shape.join.items[0].safeParse(
                    JSON.parse(data)
                );
                console.log(username, JSON.parse(data));
                if (username.success) {
                    // on player joins
                    this.playerJoined(username.data.playerid);
                } else {
                    console.error(data, username.error);
                }
            }
        );
        this.eventSource.addEventListener(
            "leave",
            (event: MessageEvent<string>) => {
                console.log(event);
                const data = event.data;
                const username = UserSSEEvents.shape.leave.items[0].safeParse(
                    JSON.parse(data)
                );
                console.log(username, JSON.parse(data));
                if (username.success) {
                    // on player leaves
                    this.playerLeft(username.data.playerid);
                } else {
                    console.error(data, username.error);
                }
            }
        );
        for (const [_, player] of Object.entries(pl)) {
            this.addPlayerLabel(player);
        }
    }
    playerJoined(pl: string) {
        this.players.add(pl);
        this.addPlayerLabel(pl);
    }
    playerLeft(pl: string) {
        this.players.delete(pl);
        this.removePlayerLabel(pl);
    }
    async update(t: number): Promise<void> {}
}
