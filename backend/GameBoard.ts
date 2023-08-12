import { randomInt } from "crypto";
import { BossCard, Cards, DungeonCard, SpellCard } from "../shared/Cards/card";
import { Deck } from "../shared/Cards/deck";

export class GameBoard {
    _boss?: BossCard;

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

    getRandomCard<T extends Cards.Type>(cards: T[]) {
        const rC = cards[randomInt(cards.length)];
        if (!rC) throw "Error selecting random card!";
        return rC;
    }

    randomizePlayerDecks() {
        for (const [player] of Object.entries(this._decks)) {
            const deck = this.getPlayerDeck(player);
            deck.clearDeck();
            const getCardInDeckIndex = (x: Cards.Type) => {
                return deck.cards.filter((c) => c.dbid === x.dbid).length;
            };
            for (let i = 0; i < 5; i++) {
                const card = this.getRandomCard(Cards.dungCards);
                deck.addCard(
                    new DungeonCard(
                        card,
                        `${card.dbid}_${player}_${getCardInDeckIndex(card)}`
                    )
                );
            }
            for (let i = 0; i < 2; i++) {
                const card = this.getRandomCard(Cards.spellCards);
                deck.addCard(
                    new SpellCard(
                        card,
                        `${card.dbid}_${player}_${getCardInDeckIndex(card)}`
                    )
                );
            }
        }
    }

    getPlayerDeck(id: string) {
        const tD = this._decks[id];
        if (tD) {
            return tD;
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
