import { Game } from "../../game";
import { GameState, theme } from "../../main";
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
            new RectangleBounds(0, 55, Game.WIDTH, 1),
            "Boss Dungeon",
            {
                border: { strokeColor: "transparent" },
                label: {
                    textColor: theme.textColor,
                    font: `normal 3em 'Lumanosimo', cursive`,
                },
            },
            zIndex
        );
        this.room = room;

        const buttonOnStyles: ButtonOnCalls = {
            onenter(ev) {
                ev.target.label.border.style.shadow = {
                    color: "#3b82f6",
                    blur: 5,
                    offsetY: 5,
                };
            },
            onleave(ev) {
                ev.target.label.clearStyles();
                ev.target.label.border.clearStyles();
            },
            onmousedown(ev) {
                if (ev.target.label.border.style.shadow) {
                    ev.target.label.border.style.shadow.blur = 1;
                    ev.target.label.border.style.shadow.offsetY = 1;
                }
                ev.target.bounds.setPosition(
                    ev.target.bounds.x,
                    ev.target.bounds.y + 5
                );
            },
            onmouseup(ev) {
                ev.target.bounds.setPosition(
                    ev.target.bounds.x,
                    ev.target.bounds.y - 5
                );
                ev.target.label.border.style.shadow = undefined;
                if (ev.target.isIn) {
                    ev.target.onCalls.onenter?.({
                        mousePos: ev.mousePos,
                        target: ev.target,
                    });
                }
            },
        };

        this.joinRoomButton = new Button(
            `btnJoin`,
            new RectangleBounds(Game.WIDTH / 2 - 90, 90 + 90 * 1, 180, 65),
            {
                ...buttonOnStyles,
                onclick: () => {
                    if (this.eventSource) {
                        console.error("Connection already exists!");
                        return;
                    }
                    const id = prompt("NICK:");
                    if (!id) return;
                    const evS = Server.sendRoomEnter(id);
                    this.eventSource = evS;
                    if (!this.eventSource) return;
                    room.loginAs(id);
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
                    fillGradient: (
                        ctx: CanvasRenderingContext2D,
                        bounds: RectangleBounds
                    ) => {
                        const { x, y, width: w, height: h } = bounds;
                        const gradient = ctx.createLinearGradient(
                            x + w / 2,
                            y,
                            x + w / 2,
                            y + h
                        );
                        gradient.addColorStop(0, "#538FFB");
                        gradient.addColorStop(1, "#5B54FA");
                        return gradient;
                    },
                },
                label: {
                    textColor: theme.textColor,
                    font: `normal 1.6em "Fira Sans", serif`,
                },
            },
            zIndex
        );

        this.settingsButton = new Button(
            `btnSettings`,
            new RectangleBounds(Game.WIDTH / 2 - 90, 90 + 90 * 2, 180, 65),
            {
                ...buttonOnStyles,
                onclick: () => {},
            },
            "Settings",
            {
                rounded: true,
                border: {
                    radii: [10, 10, 90, 90],
                    fillGradient: (
                        ctx: CanvasRenderingContext2D,
                        bounds: RectangleBounds
                    ) => {
                        const { x, y, width: w, height: h } = bounds;
                        const gradient = ctx.createLinearGradient(
                            x + w / 2,
                            y,
                            x + w / 2,
                            y + h
                        );
                        gradient.addColorStop(0, "#5B54FA");
                        gradient.addColorStop(1, "#538FFB");
                        return gradient;
                    },
                },
                label: {
                    textColor: theme.textColor,
                    font: `normal 1.5em "Fira Sans", serif`,
                },
            },
            zIndex
        );
        this.add(this.nameLabel, this.joinRoomButton, this.settingsButton);
        room.on("connectionLost", () => {
            this.eventSource?.close();
            this.eventSource = undefined;
        });
    }
    async update() {}
}
