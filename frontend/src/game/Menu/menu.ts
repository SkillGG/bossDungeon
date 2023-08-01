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
import { Room } from "../Room/room";

import { Server } from "../../utils/server";
import { DataParsers } from "../../utils/utils";

export class GameMenu extends StateManager<GameState> {
    static DefaultID = "menu";

    mapSize = 10;

    eventSource?: EventSource;

    nameLabel: Label;
    settingsButton: Button;
    joinRoomButton: Button;

    room: Room;

    get defaultID() {
        return GameMenu.DefaultID;
    }
    constructor(
        manager: ObjectManager<GameState>,
        room: Room,
        zIndex = mMENU_Z
    ) {
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
        this.room = room;

        room.on("connectionLost", () => {
            this.eventSource?.close();
            this.eventSource = undefined;
        });

        const buttonHover: ButtonOnCalls = {
            onenter(ev) {
                ev.target.label.border.style.fillColor = "blue";
            },
            onleave(ev) {
                ev.target.label.clearStyles();
                ev.target.label.border.clearStyles();
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
                    room.loginAs(id);
                    const evS = Server.sendRoomEnter(id);
                    this.eventSource = evS;
                    if (!this.eventSource) return;
                    this.eventSource.onerror = (err) => {
                        console.log(err);
                        this.eventSource?.close();
                        this.eventSource = undefined;
                    };

                    evS.on("roomData", DataParsers.parseRoomData, (data) => {
                        room.setRoomData(data.playersIn, evS);
                        manager.switchState(GameState.GAME_LOBBY);
                    });
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
                onclick: () => {},
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
