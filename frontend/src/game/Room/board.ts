import { BossCard, Card } from "../../../../shared/Cards/card";
import { ObjectManager } from "../../components/ObjectManager";
import { Label } from "../../components/Primitives/Label/Label";
import { RectangleBounds } from "../../components/Primitives/Rectangle/RectangleBounds";
import { StateManager } from "../../components/StateManager";
import { Game } from "../../game";
import { GameState, theme } from "../../main";
import { BossGameCard } from "./card";
import { Room } from "./room";

export class RoomBoard extends StateManager<GameState> {
    static readonly DefaultID = "board";
    get defaultID(): string {
        return RoomBoard.DefaultID;
    }

    room: Room;

    boss?: BossCard;

    bossCard?: BossGameCard;

    pickBossTimer: Label;

    constructor(manager: ObjectManager<GameState>, room: Room) {
        super(RoomBoard.DefaultID, manager, GameState.GAME_BOARD);
        this.room = room;

        this.pickBossTimer = new Label(
            "pickBossLabel",
            new RectangleBounds(0, 15, Game.WIDTH, 0),
            "",
            {
                label: {
                    font: "1.5em normal Arial",
                    textColor: theme.textColor,
                },
            }
        );

        this.add(this.pickBossTimer);
        this.pickBossTimer.hide();
    }

    initListeners() {
        this.room.removeAllEventListeners();
        console.log("cleaned all room event listeners!");
        this.room.on("initCountdown", ({ type, time }) => {
            if (type === "pickBoss") {
                this.initPickingBoss(time);
            } else {
            }
        });

        this.room.on("countdown", ({ type, time }) => {
            if (type === "pickBoss") {
                this.pickingBossCountdown(time);
            } else {
            }
        });

        this.room.on("endCountdown", ({ data }) => {
            if (data.type === "pickBoss") {
                console.log("got boss", data.boss.cardStr);
                const card = Card.fromString(data.boss.cardStr);
                if (card.type !== "boss") return;
                this.bossPicked(card);
            }
        });
    }

    initPickingBoss(time: number) {
        this.pickBossTimer.text = `Picking boss: ${time}`;
        this.pickBossTimer.show();
    }

    pickingBossCountdown(time: number) {
        this.pickBossTimer.text = `Picking boss: ${time}`;
    }

    bossPicked(boss: BossCard) {
        this.boss = boss;
        this.bossCard = new BossGameCard(
            boss,
            new RectangleBounds(100, 100, 200, 100)
        );
        this.add(this.bossCard);
        this.registerObject(this.bossCard);
        this.pickBossTimer.hide();
    }

    async update(): Promise<void> {}
}
