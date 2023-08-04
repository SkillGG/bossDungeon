import { randomInt } from "crypto";
import { Card } from "../shared/card";
import { Deck } from "./game/cards/deck";

export class GameBoard {
    _boss?: Card;

    get boss() {
        if (!this._boss) throw "Boss not set yet!";
        return this._boss;
    }

    private playerDecks: Record<string, Deck> = {};

    constructor() {
        this._boss = undefined;
    }

    getRandomBossCard() {
        this._boss = GameBoard.bossCards[randomInt(GameBoard.bossCards.length)];
    }

    getPlayerDeck(id: string) {
        if (this.playerDecks[id]) {
            return this.playerDecks[id];
        } else {
            const err = new Error(`Cannot find deck of ${id}`);
            console.error(err.stack);
            throw err;
        }
    }

    initPlayerDeck(id: string) {
        this.playerDecks[id] = new Deck();
    }

    static bossCards: Card[] = [
        new Card("boss1", { life: 5, name: "Boss1", type: "boss" }),
    ];
}
