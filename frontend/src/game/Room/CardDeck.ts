import {
    Card,
    Cards,
    DungeonCard,
    SpellCard,
} from "../../../../shared/Cards/card";
import { Deck } from "../../../../shared/Cards/deck";
import { BoundedGameObject } from "../../components/GameObject";
import { RectangleBounds } from "../../components/Primitives/Rectangle/RectangleBounds";
import { RotatedRectangleBounds } from "../../components/Primitives/Rectangle/RotatedRectangleBounds";
import { DungeonGameCard } from "./GameCards/dungeonGameCard";
import { SpellGameCard } from "./GameCards/spellGameCard";
import { GameCard } from "./card";

export class CardDeck extends BoundedGameObject<RectangleBounds> {
    deck: Deck;

    cards: GameCard<Cards.Type>[] = [];

    constructor(id: string, bounds: RectangleBounds, zIndex = 0) {
        super(id, bounds, zIndex);

        this.deck = new Deck();
    }

    addSpellCard(c: SpellCard) {
        this.deck.addCard(c);
        const spellCard = new SpellGameCard(
            c,
            RotatedRectangleBounds.fromRectangleBounds(
                new RectangleBounds(
                    100 + 150 * this.cards.length,
                    25,
                    100,
                    150
                ),
                0
            )
        );
        this.cards.push(spellCard);
    }

    addDungeonCard(c: DungeonCard) {
        this.deck.addCard(c);
        const spellCard = new DungeonGameCard(
            c,
            RotatedRectangleBounds.fromRectangleBounds(
                new RectangleBounds(
                    100 + 150 * this.cards.length,
                    25,
                    100,
                    150
                ),
                0
            )
        );
        this.cards.push(spellCard);
    }

    async render(ctx: CanvasRenderingContext2D): Promise<void> {
        for (const c of this.cards) {
            await c.render(ctx);
        }
    }
    async update(): Promise<void> {}
}
