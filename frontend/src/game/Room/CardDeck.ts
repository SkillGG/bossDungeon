import { Cards, DungeonCard, SpellCard } from "../../../../shared/Cards/card";
import { Deck } from "../../../../shared/Cards/deck";
import { LEFT_MOUSE_BUTTON } from "../../components/KeyboardManager";

import { Group } from "../../components/Primitives/Group/Group";
import { RectangleBounds } from "../../components/Primitives/Rectangle/RectangleBounds";
import {
    Anchor,
    RotatedRectangleBounds,
} from "../../components/Primitives/Rectangle/RotatedRectangleBounds";
import { Game } from "../../game";
import { Vector2 } from "../../utils/utils";
import { DungeonGameCard } from "./GameCards/dungeonGameCard";
import { SpellGameCard } from "./GameCards/spellGameCard";
import { GameCard } from "./card";

export enum CardDeckType {
    NORMAL,
    DISMISS,
    THROW,
}

export class CardDeck extends Group {
    deck: Deck;

    cards: GameCard<Cards.Type>[] = [];

    private _deckType: CardDeckType = CardDeckType.NORMAL;

    get type() {
        return this._deckType;
    }

    set type(v: CardDeckType) {
        for (const card of this.cards) {
            card.deckType = v;
        }
        this._deckType = v;
    }

    _pos: Vector2;

    get pos() {
        return this._pos;
    }

    set pos(v: Vector2) {
        this._pos = v;
        for (const c of this.cards) {
            c.moveTo(v);
        }
    }

    constructor(id: string, pos: Vector2, zIndex = 0) {
        super(id, zIndex);

        this.deck = new Deck();

        this._pos = pos;
    }

    startRemoveAnimation(cardid: string) {
        const c = this.cards.find((c) => c.card.id === cardid);
        if (!c) return;
        let frame = 0;
        const animInterv = setInterval(() => {
            const tetX = Math.sin(c.radAngle);
            const tetY = Math.cos(c.radAngle);
            // console.log(tetX, tetY);
            c.bounds.moveBy(tetX, -tetY);
            c.style.opacity = Math.max(c.style.opacity - 0.05, 0);
            // console.log(c.style.opacity);
            // console.log("frame", frame);
            if (++frame > 20) {
                // console.log("end", "hiding");
                clearInterval(animInterv);
                this.cards = this.cards.filter((x) => x.card.id !== c.card.id);
                c.hide();
                this.restackCards();
            }
        }, 1000 / 60);
    }

    restackCards() {
        if (this.cards.length <= 0) return;
        let i = 0;

        const sAngle =
            -45 +
            (this.cards.length > 4 ? 0 : (5 - this.cards.length) * (45 / 4));
        const eAngle = -sAngle;
        const int =
            (-sAngle + eAngle) /
            (this.cards.length > 1 ? this.cards.length - 1 : 1);
        for (const c of this.cards) {
            c.bounds = CardDeck.getCardBounds(
                sAngle + i * int,
                this.pos[0] + 20 * i,
                this.pos[1] + Math.abs(i - this.cards.length / 2) * 5
            );
            i++;
        }
    }

    static getCardBounds(angle: number, x = 0, y = 0) {
        return RotatedRectangleBounds.fromRectangleBounds(
            new RectangleBounds(x, y, 100, 150),
            angle,
            new Anchor(0.5, 1.5)
        );
    }

    addCard(c: SpellCard | DungeonCard) {
        const card = SpellCard.isSpellCard(c)
            ? new SpellGameCard(c, CardDeck.getCardBounds(0))
            : new DungeonGameCard(c, CardDeck.getCardBounds(0));
        // console.log("Adding card to deck", card.card, card);
        this.deck.addCard(c);
        this.objects.unshift(card);
        this.cards.push(card);
        card.deckType = this._deckType;
        this.restackCards();
    }

    async render(ctx: CanvasRenderingContext2D): Promise<void> {
        await super.render(ctx);
    }

    async update(dT: number): Promise<void> {
        await super.update(dT);
        let isInCard = false;
        for (const card of this.cards) {
            if (isInCard) continue;
            if (Game.input.isPointerInTriangles(card.bounds.triangles)) {
                card.zIndex = 9;
                isInCard = true;
                if (this._deckType === CardDeckType.DISMISS) {
                    if (Game.input.hasKeyReleased("KeyX")) {
                        this.startRemoveAnimation(card.card.id);
                    }
                    if (Game.input.hasMouseClicked(LEFT_MOUSE_BUTTON)) {
                        if (
                            card.state !== "normal" ||
                            this.cards.filter((c) => c.state === "dismissed")
                                .length < 2
                        )
                            card.toggleDismiss();
                    }
                }
            } else {
                card.zIndex = 0;
            }
        }
    }
}
