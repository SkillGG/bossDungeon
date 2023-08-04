import { Card } from "./../../../shared/card";

export class Deck {
    private cards: Card[] = [];

    constructor() {}

    discardCard(id: string) {
        this.cards = this.cards.filter((c) => c.id !== id);
    }

    addCard(c: Card) {
        this.cards.push(c);
    }

    toString() {
        return `${JSON.stringify(this.cards.map((c) => c.toString()))}`;
    }
}
