type BaseCardOptions = {
    name: string;
    life: number;
    type: "boss" | "dungeon" | "spell" | "hero";
    special?: true;
};

type ChangeableBaseCardOptions = Partial<
    Omit<BaseCardOptions, "dbid" | "type" | "id">
>;

export abstract class Card {
    name: string;
    id: string;
    dbid: string;

    life: number;

    type: BaseCardOptions["type"];

    special: boolean = false;
    constructor(c: Card, newid: string, o?: ChangeableBaseCardOptions);
    constructor(dbid: string, options: BaseCardOptions);
    constructor(
        cardOrID: string | Card,
        newidOrOptions: BaseCardOptions | string,
        o?: ChangeableBaseCardOptions
    ) {
        if (
            typeof cardOrID === "string" &&
            typeof newidOrOptions === "object"
        ) {
            // creating new card
            this.dbid = cardOrID;
            this.id = cardOrID;
            this.life = newidOrOptions.life;
            this.name = newidOrOptions.name;
            this.type = newidOrOptions.type;
            this.special = newidOrOptions.special ?? this.special;
        } else if (
            typeof cardOrID === "object" &&
            typeof newidOrOptions === "string"
        ) {
            // copying card with different id
            this.id = newidOrOptions;
            this.dbid = cardOrID.dbid;
            this.life = o?.life ?? cardOrID.life;
            this.name = o?.name ?? cardOrID.name;
            this.type = cardOrID.type;
            this.special = o?.special ?? cardOrID.special;
        } else throw "Incorrect Card constructor!";
    }

    toString() {
        return `${this.type}{${this.special ? "#" : ""}${this.dbid}:${
            this.id
        },${this.life}}`;
    }

    static fromString(s: string): Card {
        const exec = Card.stringRegex.exec(s.trim());
        console.log("Creating card from string", s, exec, Card.stringRegex);
        if (exec) {
            const [_, type, dbid, id, lStr] = exec;
            const life = parseInt(lStr);
            switch (type) {
                case "boss":
                    return new BossCard(Cards.getCard(dbid), id, {
                        life,
                    });
                case "dungeon":
                    return new DungeonCard(Cards.getCard(dbid), id);
                case "spell":
                    return new SpellCard(Cards.getCard(dbid), id);
                case "hero":
                    return new HeroCard(Cards.getCard(dbid), id, { life });
            }
        }
        throw new Error(`Could not create card from string ` + s);
    }

    static get stringRegex() {
        return /(boss|dungeon|spell|hero)\s*\{\s*(\S+?):(\S+?)\s*,\s*(\d+?)\s*}/gi;
    }
}

type SpellCardOptions = {
    action(): void;
    name: string;
    special?: true;
};

export class SpellCard extends Card {
    action: () => void;

    constructor(c: SpellCard, id: string);
    constructor(dbid: string, options: SpellCardOptions);
    constructor(
        cardOrID: string | SpellCard,
        newidOrOptions: SpellCardOptions | string
    ) {
        if (
            typeof cardOrID === "string" &&
            typeof newidOrOptions === "object"
        ) {
            // create new card
            super(cardOrID, {
                name: newidOrOptions.name,
                life: 0,
                type: "spell",
            });
            this.action = newidOrOptions.action;
        } else if (
            typeof cardOrID === "object" &&
            typeof newidOrOptions === "string"
        ) {
            // copy the card
            super(cardOrID, newidOrOptions);
            this.action = cardOrID.action;
        } else throw "Incorrect constructor";
    }

    static isSpellCard(c: Card): c is SpellCard {
        return c.type === "spell";
    }
}

type BossCardOptions = { name: string; life: number };

export class BossCard extends Card {
    constructor(c: BossCard, newid: string, o?: Partial<BossCardOptions>);
    constructor(id: string, options: BossCardOptions);
    constructor(
        cardOrID: string | BossCard,
        newidOrOptions: string | BossCardOptions,
        o?: Partial<BossCardOptions>
    ) {
        if (
            typeof cardOrID === "string" &&
            typeof newidOrOptions === "object"
        ) {
            // create new card
            super(cardOrID, {
                name: newidOrOptions.name,
                life: newidOrOptions.life,
                type: "boss",
            });
        } else if (
            typeof cardOrID === "object" &&
            typeof newidOrOptions === "string"
        ) {
            // copy the card
            super(cardOrID, newidOrOptions, o);
        } else throw "Incorrect constructor";
    }
}

export type TreasureType = "fight" | "holy" | "gold";

type DungeonCardOptions = {
    name: string;
    special?: true;
    treasure: TreasureType;
};

export class DungeonCard extends Card {
    treasure: TreasureType;
    constructor(c: DungeonCard, newid: string);
    constructor(id: string, options: DungeonCardOptions);
    constructor(
        cardOrID: string | DungeonCard,
        newidOrOptions: string | DungeonCardOptions
    ) {
        if (
            typeof cardOrID === "string" &&
            typeof newidOrOptions === "object"
        ) {
            // create new card
            super(cardOrID, {
                name: newidOrOptions.name,
                life: 0,
                type: "dungeon",
            });
            this.treasure = newidOrOptions.treasure;
        } else if (
            typeof cardOrID === "object" &&
            typeof newidOrOptions === "string"
        ) {
            // copy the card
            super(cardOrID, newidOrOptions);
            this.treasure = cardOrID.treasure;
        } else throw "Incorrect constructor";
    }
}

type HeroCardOptions = { name: string; life: number };

export class HeroCard extends Card {
    constructor(c: HeroCard, newid: string, o?: Partial<HeroCardOptions>);
    constructor(id: string, options: HeroCardOptions);
    constructor(
        cardOrID: string | HeroCard,
        newidOrOptions: string | HeroCardOptions,
        o?: Partial<HeroCardOptions>
    ) {
        if (
            typeof cardOrID === "string" &&
            typeof newidOrOptions === "object"
        ) {
            // create new card
            super(cardOrID, {
                name: newidOrOptions.name,
                life: newidOrOptions.life,
                type: "hero",
            });
        } else if (
            typeof cardOrID === "object" &&
            typeof newidOrOptions === "string"
        ) {
            // copy the card
            super(cardOrID, newidOrOptions, o);
        } else throw "Incorrect constructor";
    }
}

export namespace Cards {
    export const bossCards: BossCard[] = [
        new BossCard("boss1", { life: 5, name: "Boss 1" }),
        new BossCard("boss2", { life: 5, name: "Boss 2" }),
        new BossCard("boss3", { life: 5, name: "Boss 3" }),
        new BossCard("boss4", { life: 8, name: "Boss 4" }),
    ];

    export const spellCards: SpellCard[] = [
        new SpellCard("spell1", {
            name: "Spell 1",
            action: () => {},
        }),
        new SpellCard("spell2", { name: "Spell 2", action: () => {} }),
        new SpellCard("spell3", { name: "Spell 3", action: () => {} }),
        new SpellCard("spell4", { name: "Spell 4", action: () => {} }),
        new SpellCard("spell5", { name: "Spell 5", action: () => {} }),
        new SpellCard("spell6", { name: "Spell 6", action: () => {} }),
    ];

    export const dungCards: DungeonCard[] = [
        new DungeonCard("dung1", { name: "Dung 1", treasure: "fight" }),
        new DungeonCard("dung2", { name: "Dung 2", treasure: "holy" }),
        new DungeonCard("dung3", { name: "Dung 3", treasure: "gold" }),
        new DungeonCard("dung4", { name: "Dung 4", treasure: "gold" }),
        new DungeonCard("dung5", { name: "Dung 5", treasure: "fight" }),
        new DungeonCard("dung6", { name: "Dung 6", treasure: "holy" }),
    ];

    export const heroCards: HeroCard[] = [];

    export const getCard = <T extends Card>(id: string): T => {
        const card = [
            ...bossCards,
            ...spellCards,
            ...dungCards,
            ...heroCards,
        ].find(({ id: cid }) => cid === id);
        if (card) return card as T;
        throw "";
    };
}
