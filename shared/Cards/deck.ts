import { Card, Cards } from "./card";
import { z } from "zod";

export class Deck {
    static fromStringData = z.array(z.string());

    private cards: Cards.Type[] = [];

    constructor() {}

    discardCard(id: string) {
        this.cards = this.cards.filter((c) => c.id !== id);
    }

    addCard(c: Cards.Type) {
        this.cards.push(c);
    }

    clearDeck() {
        this.cards = [];
    }

    toString() {
        return JSON.stringify(this.cards.map((c) => c.toString()));
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
