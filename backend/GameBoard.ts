import { randomInt } from "crypto";
import { Card, DungeonCard, Cards } from "../shared/Cards/card";
import { Deck } from "../shared/Cards/deck";

export class GameBoard {
    _boss?: Card;

    get boss() {
        if (!this._boss) throw "Boss not set yet!";
        return this._boss;
    }

    private _decks: Record<string, Deck> = {};

    get decks(): Record<string, Deck> {
        return this._decks;
    }

    constructor() {
        this._boss = undefined;
    }

    drawBossCard() {
        this._boss = this.getRandomCard(Cards.bossCards);
    }

    getRandomCard<T extends Card>(cards: T[]) {
        return cards[randomInt(cards.length)];
    }

    randomizePlayerDecks() {
        for (const [player] of Object.entries(this._decks)) {
            const deck = this.getPlayerDeck(player);
            deck.clearDeck();
            for (let i = 0; i < 5; i++) {
                const card = this.getRandomCard(Cards.dungCards);
                deck.addCard(new DungeonCard(card, `${card.dbid}_${player}`));
            }
        }
    }

    getPlayerDeck(id: string) {
        if (this._decks[id]) {
            return this._decks[id];
        } else {
            const err = new Error(`Cannot find deck of ${id}`);
            console.error(err.stack);
            throw err;
        }
    }

    initPlayerDeck(id: string) {
        this._decks[id] = new Deck();
    }
}
