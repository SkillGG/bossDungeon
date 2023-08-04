import { Card } from "./card";

export class Deck {
    private cards: Card[] = [];

    constructor() {}

    discardCard(id: string) {
        this.cards = this.cards.filter((c) => c.id !== id);
    }

    addCard(c: Card) {
        this.cards.push(c);
    }

    clearDeck() {
        this.cards = [];
    }

    toString() {
        return `${JSON.stringify(this.cards.map((c) => c.toString()))}`;
    }

    static fromString(s: string) {
        const deck = new Deck();
        for (const [cardStr] of s.matchAll(Card.stringRegex)) {
            const card = Card.fromString(cardStr);
            deck.addCard(card);
        }
        return deck;
    }

    static stringRegex = new RegExp(`(?:(${Card.stringRegex.source});?)`, "gi");
}
