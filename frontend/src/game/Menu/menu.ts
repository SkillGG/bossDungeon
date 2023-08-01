import { Game } from "../../game";
import { GameState } from "../../main";
import { mMENU_Z } from "../../utils/zLayers";
import { ObjectManager } from "../../components/ObjectManager";
import {
    Button,
    ButtonOnCalls,
} from "../../components/Primitives/Button/Button";
import { Label } from "../../components/Primitives/Label/Label";
import { RectangleBounds } from "../../components/Primitives/Rectangle/RectangleBounds";
import { StateManager } from "../../components/StateManager";

import { UserSSEEvents } from "./../../../../shared/events";
import { Room } from "../Room/room";

export class GameMenu extends StateManager<GameState> {
    static DefaultID = "menu";

    mapSize = 10;

    eventSource?: EventSource;

    nameLabel: Label;
    settingsButton: Button;
    joinRoomButton: Button;

    get defaultID() {
        return GameMenu.DefaultID;
    }
    constructor(manager: ObjectManager<GameState>, zIndex = mMENU_Z) {
        super(GameMenu.DefaultID, manager, GameState.MENU);
        this.nameLabel = new Label(
            "nameLabel",
            new RectangleBounds(0, 15, Game.WIDTH, 1),
            "Boss Dungeon",
            {
                border: { strokeColor: "transparent" },
                label: {
                    textColor: "black",
                    font: "2em normal Helvetica",
                },
            },
            zIndex
        );

        const buttonHover: ButtonOnCalls = {
            onenter(ev) {
                ev.target.label.border.style.fillColor = "blue";
            },
            onleave(ev) {
                ev.target.label.border.style.fillColor =
                    ev.target.label.initStyle.border?.fillColor ||
                    "transparent";
            },
        };

        this.joinRoomButton = new Button(
            `btnJoin`,
            new RectangleBounds(Game.WIDTH / 2 - 90, 90 + 90 * 1, 180, 65),
            {
                ...buttonHover,
                onclick: () => {
                    if (this.eventSource) {
                        console.error("event source already exists!");
                        return;
                    }
                    const id = prompt("NICK:");
                    if (!id) return;
                    const evS = new EventSource(
                        `http://localhost:8080/enter/${id}`
                    );
                    this.eventSource = evS;
                    if (!this.eventSource) return;
                    this.eventSource.onerror = (err) => {
                        console.log(err);
                        this.eventSource?.close();
                        this.eventSource = undefined;
                    };
                    this.eventSource.addEventListener(
                        "roomData",
                        (event: MessageEvent<string>) => {
                            console.log(event);
                            const data = event.data;
                            const roomData =
                                UserSSEEvents.shape.roomData.items[0].safeParse(
                                    JSON.parse(data)
                                );
                            if (roomData.success) {
                                manager
                                    .getStateManager<Room>(Room.DefaultID)
                                    .setRoomData(roomData.data.playersIn, evS);
                                manager.switchState(GameState.GAME);
                            }
                        }
                    );
                    this.eventSource.onopen = () => {
                        console.log("opened");
                    };
                },
            },
            "Join",
            {
                rounded: true,
                border: {
                    radii: [90, 90, 10, 10],
                },
            },
            zIndex
        );

        this.settingsButton = new Button(
            `btnSettings`,
            new RectangleBounds(Game.WIDTH / 2 - 90, 90 + 90 * 2, 180, 65),
            {
                ...buttonHover,
                onclick: () => {
                    console.log("closing event source");
                    this.eventSource?.close();
                    this.eventSource = undefined;
                },
            },
            "Settings",
            {
                rounded: true,
                border: {
                    radii: [10, 10, 90, 90],
                },
            },
            zIndex
        );
        this.add(this.nameLabel, this.joinRoomButton, this.settingsButton);
    }
    removeObjects(): void {
        super.removeObjects();
    }
    registerObjects(): void {
        super.registerObjects();
    }
    async update() {}
}
