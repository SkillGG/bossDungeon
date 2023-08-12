import {
    BossCard,
    Card,
    DungeonCard,
    SpellCard,
} from "../../../../shared/Cards/card";
import { Deck } from "../../../../shared/Cards/deck";
import { ObjectManager } from "../../components/ObjectManager";
import { Label } from "../../components/Primitives/Label/Label";
import { RectangleBounds } from "../../components/Primitives/Rectangle/RectangleBounds";
import { RotatedRectangleBounds } from "../../components/Primitives/Rectangle/RotatedRectangleBounds";
import { StateManager } from "../../components/StateManager";
import { Game } from "../../game";
import { GameState, theme } from "../../main";
import { CardDeck, CardDeckType } from "./CardDeck";
import { BossGameCard } from "./GameCards/bossGameCard";
import { RoomLobby } from "./lobby";
import { Room } from "./room";

export class RoomBoard extends StateManager<GameState> {
    static readonly DefaultID = "board";
    get defaultID(): string {
        return RoomBoard.DefaultID;
    }

    room: Room;

    boss?: BossCard;

    selectionDeck?: CardDeck;

    bossCard?: BossGameCard;

    // deckSelection: CardDeck;

    pickBossTimer: Label;

    playerNameLabel: Label;

    constructor(manager: ObjectManager<GameState>, room: Room) {
        super(RoomBoard.DefaultID, manager, GameState.GAME_BOARD);
        this.room = room;

        this.pickBossTimer = new Label(
            "pickBossLabel",
            new RectangleBounds(0, 45, Game.WIDTH, 0),
            "",
            {
                label: {
                    font: "normal 3em 'Lumanosimo', cursive",
                    textColor: theme.textColor,
                },
            }
        );

        this.playerNameLabel = new Label(
            "playerName",
            new RectangleBounds(Game.WIDTH - 100, 50, 100, 0),
            "",
            {
                label: {
                    font: "normal 2em 'Lumanosimo', cursive",
                    textColor: theme.textColor,
                },
            }
        );

        this.add(this.pickBossTimer, this.playerNameLabel);
        this.pickBossTimer.hide();
        this.playerNameLabel.hide();
    }

    resetBoard() {
        if (this.bossCard) {
            this.removeObject(this.bossCard);
            this.remove(this.bossCard);
        }
        if (this.selectionDeck) {
            this.removeObject(this.selectionDeck);
        }
        this.bossCard = undefined;
        this.boss = undefined;
    }

    initBoard() {
        this.initListeners();
        this.playerNameLabel.text = "You: " + this.room.player;
        this.playerNameLabel.show();
        this.registerObjects();
    }

    showCardDismissDeck(deckStr: string) {
        const gameDeck = Deck.fromString(deckStr);
        this.selectionDeck = new CardDeck(
            "scd",
            [Game.WIDTH / 4, Game.HEIGHT / 2],
            5
        );
        this.selectionDeck.type = CardDeckType.DISMISS;
        for (const card of gameDeck.cards) {
            if (SpellCard.isSpellCard(card) || DungeonCard.isDungeonCard(card))
                this.selectionDeck.addCard(card);
        }
        this.registerObject(this.selectionDeck);
    }

    initListeners() {
        this.room.removeAllEventListeners();
        this.room.on("initCountdown", ({ type: data, time }) => {
            if (data === "pickBoss") {
                this.initPickingBoss(time);
            } else if (typeof data === "object") {
                if (data.type === "deckSelection") {
                    this.showCardDismissDeck(data.deck.deckStr);
                }
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
                const card = Card.fromString(data.boss.cardStr);
                if (BossCard.isBossCard(card)) this.bossPicked(card);
            }
        });
        this.room.on("terminateCountdown", ({ reason }) => {
            console.log("terminatedCountdown!", reason);
            if (reason && reason.type === "disconnect" && reason.playerid) {
                alert(
                    `User ${reason.playerid} disconnected! Throwing out the game and returning to lobby!`
                );
                this.resetBoard();
                this.room.removeAllEventListeners();
                this.manager.switchState(GameState.GAME_LOBBY);
                this.manager
                    .getStateManager<RoomLobby>(RoomLobby.DefaultID)
                    .initRoomListeners();
                this.room.playerLeft(reason.playerid);
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
            RotatedRectangleBounds.fromRectangleBounds(
                new RectangleBounds(100, 100, 200, 100),
                0
            )
        );
        this.add(this.bossCard);
        this.registerObject(this.bossCard);
        this.pickBossTimer.hide();
    }

    async update(): Promise<void> {}
}
