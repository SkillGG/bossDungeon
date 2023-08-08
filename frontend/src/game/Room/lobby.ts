import { ObjectManager } from "../../components/ObjectManager";
import { Button } from "../../components/Primitives/Button/Button";
import { Counter } from "../../components/Primitives/Counter/Counter";
import { Label } from "../../components/Primitives/Label/Label";
import { RectangleBounds } from "../../components/Primitives/Rectangle/RectangleBounds";
import { StateManager } from "../../components/StateManager";
import { Game } from "../../game";
import { GameState, theme } from "../../main";
import { Server } from "../../utils/server";
import { RoomBoard } from "./board";
import { Room } from "./room";

export class RoomLobby extends StateManager<GameState> {
    static DefaultID = "lobby";
    get defaultID() {
        return RoomLobby.DefaultID;
    }
    room: Room;

    labels: Label[] = [];

    countdownLabel: Counter;

    readyButton: Button;

    constructor(manager: ObjectManager<GameState>, room: Room) {
        super(RoomLobby.DefaultID, manager, GameState.GAME_LOBBY);
        this.room = room;
        this.readyButton = new Button(
            "startButton",
            new RectangleBounds(400, 90, 100, 50),
            {
                onclick: () => {
                    if (!room.playerLobbyData.ready)
                        Server.sendToServer(`/lobby/ready/${room.player}`, {
                            method: "get",
                        });
                    else
                        Server.sendToServer(`/lobby/unready/${room.player}`, {
                            method: "get",
                        });
                },
            },
            "READY",
            {
                border: {
                    radii: [10, 10, 10, 10],
                    fillGradient: (ctx, { x, y, width: w, height: h }) => {
                        const gradient = ctx.createLinearGradient(
                            x + w / 2,
                            y,
                            x + w / 2,
                            y + h
                        );
                        gradient.addColorStop(0, "#fc002e");
                        gradient.addColorStop(0.5, "#fc4f00");
                        return gradient;
                    },
                },
                rounded: true,
                label: {
                    textColor: theme.textColor,
                    font: "1.5em normal Arial",
                },
            }
        );
        const countdownLabelSize = 80;
        this.countdownLabel = new Counter(
            "lobbyCountdownCounter",
            new RectangleBounds(
                Game.WIDTH / 2 - countdownLabelSize / 2,
                Game.HEIGHT / 2 - countdownLabelSize / 2,
                countdownLabelSize,
                countdownLabelSize
            ),
            {
                style: {
                    arcColor: "#538ffb",
                    label: {
                        font: "2em normal Arial",
                        textColor: theme.textColor,
                    },
                },
                currTime: 0,
                interval: 0,
            }
        );
        this.countdownLabel.hide();
        this.objects.push(this.readyButton, this.countdownLabel);
        this.initRoomListeners();
    }

    initRoomListeners() {
        this.room.on("join", ({ playerid }) => {
            this.addPlayerLabel(playerid);
        });
        this.room.on("connectionLost", () => {
            this.resetLobby();
            this.manager.switchState(GameState.MENU);
        });
        this.room.on("leave", ({ playerid }) => {
            this.removePlayerLabel(playerid);
        });
        this.room.on("initData", ({ playerList }) => {
            for (const pl of playerList) {
                this.addPlayerLabel(pl);
            }
        });
        this.room.on("ready", ({ playerid }) => {
            const pLabel = this.labels.find((f) => f.text === playerid);
            if (pLabel) pLabel.style.textColor = "green";
            if (playerid === this.room.player) {
                this.readyButton.label.border.style.fillGradient = (
                    ctx,
                    { x, y, width: w, height: h }
                ) => {
                    const gradient = ctx.createLinearGradient(
                        x + w / 2,
                        y,
                        x + w / 2,
                        y + h
                    );
                    gradient.addColorStop(0, "#21fc00");
                    gradient.addColorStop(0.5, "#00fc5c");
                    return gradient;
                };
            }
        });
        this.room.on("unready", ({ playerid }) => {
            const pLabel = this.labels.find((f) => f.text === playerid);
            if (pLabel) {
                pLabel.clearStyles();
            }
            if (playerid === this.room.player) {
                this.readyButton.label.clearStyles();
                this.readyButton.label.border.clearStyles();
            }
        });
        this.room.on("initCountdown", ({ time, type, ms }) => {
            if (type === "gameLaunch") {
                this.countdownLabel.show();
                this.countdownLabel.initCounter(time, ms);
                this.countdownLabel.updateTime(time);
            }
        });
        this.room.on("countdown", ({ time, type }) => {
            if (type === "gameLaunch") this.countdownLabel.updateTime(time);
        });
        this.room.on("terminateCountdown", () => {
            this.countdownLabel.hide();
        });
        this.room.on("endCountdown", ({ data: { type } }) => {
            if (type === "gameLaunch") {
                this.manager
                    .getStateManager<RoomBoard>(RoomBoard.DefaultID)
                    .initBoard();
                this.manager.switchState(GameState.GAME_BOARD);
                this.countdownLabel.hide();
            }
        });
    }

    resetLobby() {
        for (const l of this.labels) this.removeObject(l);
        this.labels = [];
        this.countdownLabel.hide();
        this.readyButton.show();
        this.readyButton.label.clearStyles();
        this.readyButton.label.border.clearStyles();
    }

    rearrangeLabels() {
        this.labels.forEach((e, i) => {
            e.moveTo([250, 20 + 40 * i]);
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
        this.rearrangeLabels();
    }
    removePlayerLabel(pl: string) {
        const lb = this.labels.find((l) => l.text === pl);
        if (lb) {
            this.removeObject(lb);
            this.labels = this.labels.filter((l) => l.text !== pl);
        }
        this.rearrangeLabels();
    }
    async update(): Promise<void> {}
}
