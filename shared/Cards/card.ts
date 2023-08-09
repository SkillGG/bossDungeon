import {
    z,
    number,
    object,
    string,
    literal,
    union,
    boolean,
    optional,
} from "zod";

// #region Card Util Types

export const TreasureType = union([
    literal("fight"),
    literal("holy"),
    literal("gold"),
]);

export type TreasureType = z.infer<typeof TreasureType>;
type CardType = "boss" | "dungeon" | "spell" | "hero";

// #endregion

export abstract class Card<T extends object> {
    name: string;
    id: string;
    dbid: string;

    type: CardType;

    constructor(c: Card<any>, newid: string);
    constructor(dbid: string, name: string, type: CardType);
    constructor(
        cardOrID: string | Card<any>,
        nameOrID?: string,
        type?: CardType
    ) {
        if (
            typeof cardOrID === "string" &&
            typeof nameOrID === "string" &&
            typeof type === "string"
        ) {
            // creating new card
            this.id = cardOrID;
            this.dbid = cardOrID;
            this.name = nameOrID;
            this.type = type;
        } else if (
            typeof cardOrID === "object" &&
            typeof nameOrID === "string"
        ) {
            // copying card with different id
            this.id = nameOrID;
            this.dbid = cardOrID.dbid;
            this.name = cardOrID.name;
            this.type = cardOrID.type;
        } else throw "Incorrect Card constructor!";
    }

    abstract get uniqueData(): T;
    abstract set uniqueData(d: T);

    toString() {
        return `${this.type}{${this.dbid}:${this.id},${JSON.stringify(
            this.uniqueData
        )}}`;
    }

    static fromString(s: string): Cards.Type {
        const exec = Card.stringRegex.exec(s.trim());
        if (exec) {
            const [_, type, dbid, id, uDStr] = exec;
            try {
                const uDObj = JSON.parse(uDStr.replace(/\/"/, '"'));
                switch (type) {
                    case "boss":
                        return new BossCard(
                            Cards.getCard(dbid),
                            id,
                            BossCard.data.parse(uDObj)
                        );
                    case "dungeon":
                        return new DungeonCard(
                            Cards.getCard(dbid),
                            id,
                            DungeonCard.data.parse(uDObj)
                        );
                    case "spell":
                        return new SpellCard(
                            Cards.getCard(dbid),
                            id,
                            SpellCard.data.parse(uDObj)
                        );
                    case "hero":
                        return new HeroCard(
                            Cards.getCard(dbid),
                            id,
                            HeroCard.data.parse(uDObj)
                        );
                }
            } catch (err) {
                console.error(err);
                throw (
                    "There was and error parsing uniqueData string from " +
                    uDStr
                );
            }
        }
        throw new Error(`Could not create card from string ` + s);
    }

    static get stringRegex() {
        return /(boss|dungeon|spell|hero)\s*\{\s*(\S+?):(\S+?)\s*,\s*({.*?})\s*}/gi;
    }
}

// #region HeroCard

export type HeroCardData = z.infer<(typeof HeroCard)["data"]>;

type HeroCardOptions = z.infer<(typeof HeroCard)["options"]>;

export class HeroCard extends Card<HeroCardData> {
    static data = object({
        life: number().int(),
    });
    static options = object({
        life: number().int(),
        name: string(),
    });

    life: number;

    constructor(c: HeroCard, newid: string, o?: HeroCardData);
    constructor(dbid: string, o: HeroCardOptions);
    constructor(
        cardOrID: string | HeroCard,
        id: string | HeroCardOptions,
        opts?: HeroCardData
    ) {
        if (typeof cardOrID === "string" && typeof id === "object") {
            const options = id;
            // create new card
            super(cardOrID, options.name, "hero");
            this.life = options.life;
        } else if (typeof cardOrID === "object" && typeof id === "string") {
            // copy the card
            super(cardOrID, id);
            this.life = opts?.life ?? cardOrID.life;
        } else throw "Incorrect constructor";
    }
    get uniqueData(): HeroCardData {
        return { life: this.life };
    }
    set uniqueData(d: HeroCardData) {
        this.life = d.life;
    }
}

// #endregion

// #region DungeonCard

export type DungeonCardData = z.infer<(typeof DungeonCard)["data"]>;
type DungeonCardOptions = z.infer<(typeof DungeonCard)["options"]>;

export class DungeonCard extends Card<DungeonCardData> {
    static data = object({
        treasure: TreasureType,
        damage: number(),
        special: boolean(),
    });
    static options = object({
        name: string(),
        treasure: TreasureType,
        special: optional(boolean()),
        damage: number(),
    });

    treasure: TreasureType;
    damage: number;
    special: boolean;
    constructor(c: DungeonCard, newid: string, options?: Partial<DungeonCardData>);
    constructor(id: string, options: DungeonCardOptions);
    constructor(
        cardOrID: string | DungeonCard,
        id: string | DungeonCardOptions,
        opts?: Partial<DungeonCardData>
    ) {
        if (typeof cardOrID === "string" && typeof id === "object") {
            // create new card
            super(cardOrID, id.name, "dungeon");
            this.treasure = id.treasure;
            this.special = !!id.special;
            this.damage = id.damage;
        } else if (typeof cardOrID === "object" && typeof id === "string") {
            // copy the card
            super(cardOrID, id);
            this.treasure = opts?.treasure ?? cardOrID.treasure;
            this.special = opts?.special ?? cardOrID.special;
            this.damage = opts?.damage ?? cardOrID.damage;
        } else throw "Incorrect constructor";
    }

    get uniqueData(): DungeonCardData {
        return {
            treasure: this.treasure,
            special: this.special,
            damage: this.damage,
        };
    }
    set uniqueData(d: DungeonCardData) {
        this.treasure = d.treasure;
        this.special = d.special;
        this.damage = d.damage;
    }
    static isDungeonCard(d: Card<any>): d is DungeonCard {
        return d.type === "dungeon";
    }
}

// #endregion

// #region SpellCard

type SpellCardOptions = z.infer<(typeof SpellCard)["options"]>;

export type SpellCardData = z.infer<(typeof SpellCard)["data"]>;

export class SpellCard extends Card<SpellCardData> {
    static data = object({
        special: boolean(),
    });
    static options = object({
        action: z.function().returns(z.void()),
        name: z.string(),
        special: z.optional(z.boolean()),
    });

    action: () => void;
    special: boolean;

    get uniqueData() {
        return {
            special: this.special,
        };
    }

    set uniqueData(d: SpellCardData) {
        this.special = d.special;
    }

    constructor(c: SpellCard, id: string, opts?: SpellCardData);
    constructor(dbid: string, opts: SpellCardOptions);
    constructor(
        cardOrID: string | SpellCard,
        id: string | SpellCardOptions,
        opts?: SpellCardData
    ) {
        if (typeof cardOrID === "string" && typeof id === "object") {
            const options = id;
            // create new card
            super(cardOrID, options.name, "spell");
            this.special = !!options.special;
            this.action = options.action;
        } else if (typeof cardOrID === "object" && typeof id === "string") {
            // copy the card
            super(cardOrID, id);
            this.action = cardOrID.action;
            this.special = opts?.special ?? cardOrID.special;
        } else throw "Incorrect constructor";
    }

    static isSpellCard(c: Card<any>): c is SpellCard {
        return (
            c.type === "spell" && SpellCard.data.safeParse(c.uniqueData).success
        );
    }
}

// #endregion

// #region BossCard

export type BossCardData = z.infer<(typeof BossCard)["data"]>;

type BossCardOptions = z.infer<(typeof BossCard)["options"]>;

export class BossCard extends Card<BossCardData> {
    static data = object({
        life: number().int(),
    });
    static options = object({
        life: number().int(),
        name: string(),
    });

    life: number;

    constructor(c: BossCard, newid: string, o: Partial<BossCardData>);
    constructor(dbid: string, o: BossCardOptions);
    constructor(
        cardOrID: string | BossCard,
        id: string | BossCardOptions,
        opts?: Partial<BossCardData>
    ) {
        if (typeof cardOrID === "string" && typeof id === "object") {
            const options = id;
            // create new card
            super(cardOrID, options.name, "boss");
            this.life = options.life;
        } else if (typeof cardOrID === "object" && typeof id === "string") {
            // copy the card
            super(cardOrID, id);
            this.life = opts?.life ?? cardOrID.life;
        } else throw "Incorrect constructor";
    }
    get uniqueData(): BossCardData {
        return { life: this.life };
    }
    set uniqueData(d: BossCardData) {
        this.life = d.life;
    }
    static isBossCard(d: Card<any>): d is BossCard {
        return d.type === "boss";
    }
}

// #endregion

export namespace Cards {
    export type Type = BossCard | HeroCard | DungeonCard | SpellCard;
    export const bossCards: BossCard[] = [
        new BossCard("boss1", { life: 5, name: "abc" }),
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
        new DungeonCard("dung1", {
            name: "Dung 1",
            treasure: "fight",
            damage: 1,
        }),
        new DungeonCard("dung2", {
            name: "Dung 2",
            treasure: "holy",
            damage: 1,
        }),
        new DungeonCard("dung3", {
            name: "Dung 3",
            treasure: "gold",
            damage: 1,
        }),
        new DungeonCard("dung4", {
            name: "Dung 4",
            treasure: "gold",
            damage: 1,
        }),
        new DungeonCard("dung5", {
            name: "Dung 5",
            treasure: "fight",
            damage: 1,
        }),
        new DungeonCard("dung6", {
            name: "Dung 6",
            treasure: "holy",
            damage: 1,
        }),
    ];

    export const heroCards: HeroCard[] = [];

    export const getCard = <T extends Type>(id: string): T => {
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
