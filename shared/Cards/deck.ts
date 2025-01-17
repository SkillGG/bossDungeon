import { Card, Cards } from "./card";
import { z } from "zod";

export class Deck {
    static fromStringData = z.array(z.string());

    private _cards: Cards.Type[] = [];

    constructor() {}

    discardCard(id: string) {
        this._cards = this._cards.filter((c) => c.id !== id);
    }

    addCard(c: Cards.Type) {
        this._cards.push(c);
    }

    clearDeck() {
        this._cards = [];
    }

    toString() {
        return JSON.stringify(this._cards.map((c) => c.toString()));
    }

    get cards(): readonly Cards.Type[] {
        return this._cards as readonly Cards.Type[];
    }

    static fromString(s: string) {
        const deck = new Deck();
        const deckAsArray = JSON.parse(s);
        for (const cardStr of Deck.fromStringData.parse(deckAsArray)) {
            const card = Card.fromString(cardStr);
            deck.addCard(card);
        }
        return deck;
    }
}
