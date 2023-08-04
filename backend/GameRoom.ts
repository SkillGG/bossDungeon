import { UserSSEConnection } from "./utils";

import { UserSSEEvents, timerData } from "./../shared/events";
import { Countdown } from "./countdown";
import { GameBoard } from "./GameBoard";

export class UserConnection extends UserSSEConnection<UserSSEEvents> {
    constructor(id: string) {
        super(id);
    }
    static id: number = 0;
}

export class GameRoom {
    players: Map<string, UserConnection> = new Map();
    readyPlayers: Set<string> = new Set();

    gameBoard: GameBoard = new GameBoard();

    get openedPlayers() {
        return new Set(
            [...this.players].filter((c) => !c[1].isClosed).map((q) => q[0])
        );
    }

    get openConnections() {
        return [...this.players].map((q) => q[1]).filter((c) => !c.isClosed);
    }

    gameInProgress = false;

    countdown?: Countdown;

    constructor() {}

    drawPlayerDecks() {
        this.gameBoard.randomizePlayerDecks();
        for (const [player, deck] of Object.entries(this.gameBoard.decks)) {
            this.countdown = new Countdown(
                { type: "deckSelection", deck: { deckStr: deck.toString() } },
                this.openConnections,
                30,
                {},
                () => {
                    return { type: "deckSelection" };
                }
            );
        }
    }

    pickBoss() {
        this.countdown = new Countdown(
            "pickBoss",
            this.openConnections,
            3,
            {
                beforeFinish: () => {
                    this.gameBoard.drawBossCard();
                },
                afterFinish: () => {
                    this.drawPlayerDecks();
                },
            },
            () => {
                console.log(this.gameBoard.boss.toString());
                return {
                    type: "pickBoss",
                    boss: {
                        cardStr: this.gameBoard.boss.toString(),
                    },
                };
            }
        );
        this.countdown.start();
    }

    startGame() {
        this.countdown = new Countdown(
            "gameLaunch",
            this.openConnections,
            2,
            {
                afterFinish: () => {
                    this.countdown = undefined;
                    this.pickBoss();
                },
            },
            () => {
                return { type: "gameLaunch" };
            }
        );
        this.countdown.start();
    }

    join(playerid: string, c: UserConnection) {
        this.players.set(playerid, c);
        this.gameBoard.initPlayerDeck(playerid);
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
        if (this.countdown) {
            this.countdown.abort();
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
        if (this.openedPlayers.size === 2 && this.allPlayersReady) {
            this.startGame();
        }
    }

    markUnready(playerid: string) {
        this.readyPlayers.delete(playerid);
        UserConnection.emitToAll(this.openConnections)("unready", { playerid });
        if (this.countdown) {
            this.countdown.abort();
        }
    }

    getRoomLobbyData() {
        const ret: UserSSEEvents["roomData"][0] = { playersIn: {} };
        for (const [pl] of this.players) {
            ret.playersIn[pl] = { ready: this.readyPlayers.has(pl) };
        }
        return ret;
    }
}
