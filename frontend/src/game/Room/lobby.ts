import { ObjectManager } from "../../components/ObjectManager";
import { Button } from "../../components/Primitives/Button/Button";
import { Label } from "../../components/Primitives/Label/Label";
import { RectangleBounds } from "../../components/Primitives/Rectangle/RectangleBounds";
import { StateManager } from "../../components/StateManager";
import { Game } from "../../game";
import { GameState } from "../../main";
import { Server } from "../../utils/server";
import { Room } from "./room";

export class RoomLobby extends StateManager<GameState> {
    static DefaultID = "lobby";
    get defaultID() {
        return RoomLobby.DefaultID;
    }
    room: Room;

    labels: Label[] = [];

    countdownLabel: Label;

    readyButton: Button;

    constructor(manager: ObjectManager<GameState>, room: Room) {
        super(RoomLobby.DefaultID, manager, GameState.GAME_LOBBY);
        this.room = room;
        room.on("join", ({ playerid }) => {
            this.addPlayerLabel(playerid);
        });
        room.on("connectionLost", () => {
            this.resetLobby();
            manager.switchState(GameState.MENU);
        });
        room.on("leave", ({ playerid }) => {
            this.removePlayerLabel(playerid);
        });
        room.on("initData", ({ playerList }) => {
            for (const pl of playerList) {
                this.addPlayerLabel(pl);
            }
        });
        room.on("ready", ({ playerid }) => {
            const pLabel = this.labels.find((f) => f.text === playerid);
            if (pLabel) pLabel.style.textColor = "green";
            if (playerid === room.player) {
                console.log("Making button green bc", playerid, " readied");
                this.readyButton.label.border.style.fillColor = "green";
                this.readyButton.label.style.textColor = "black";
            }
        });
        room.on("unready", ({ playerid }) => {
            const pLabel = this.labels.find((f) => f.text === playerid);
            if (pLabel) {
                pLabel.clearStyles();
            }
            if (playerid === room.player) {
                this.readyButton.label.clearStyles();
                this.readyButton.label.border.clearStyles();
            }
        });
        room.on("initCountdown", ({ time }) => {
            // this.readyButton.hide();
            this.countdownLabel.show();
            this.countdownLabel.text = `${time}`;
            // for (const l of this.labels) l.hide();
        });
        room.on("countdown", ({ time }) => {
            this.countdownLabel.text = `${time}`;
        });
        room.on("terminateCountdown", ()=>{
            this.countdownLabel.hide();
        });
        room.on("gameStart", () => {
            this.manager.switchState(GameState.GAME_BOARD);
            this.resetLobby();
        });
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
                },
                rounded: true,
                label: {
                    textColor: "#ccce",
                    font: "1.5em normal Arial",
                },
            }
        );
        this.countdownLabel = new Label(
            "countdownLabel",
            new RectangleBounds(0, 400, Game.WIDTH, 0),
            ``,
            {
                label: {
                    font: "2em normal Arial",
                },
            }
        );
        this.countdownLabel.hide();
        this.objects.push(this.readyButton, this.countdownLabel);
    }

    resetLobby() {
        for (const l of this.labels) this.removeObject(l);
        this.labels = [];
        this.countdownLabel.hide();
        this.readyButton.show();
    }

    rearrangeLabels() {
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
    async update(t: number): Promise<void> {
        t;
    }
}
