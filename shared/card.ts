export class Card {
    name: string;
    id: string;

    life: number;

    type: "boss" | "dungeon" | "spell";

    super: boolean = false;

    constructor(
        id: string,
        options: {
            name: string;
            life: number;
            type: "boss" | "dungeon" | "spell";
            super?: true;
        }
    ) {
        this.id = id;
        this.life = options.life;
        this.name = options.name;
        this.type = options.type;
        this.super = options.super ?? this.super;
    }

    toString() {
        return `${this.type}{${this.super ? "#" : ""}${this.id},${this.life},${
            this.name
        }}`;
    }

    static fromString(s: string) {
        const exec = Card.stringRegex.exec(s);
        if (exec) {
            const [_, type, sup, id, lifeStr, name] = exec;
            if (type === "boss" || type === "dungeon" || type === "spell")
                return new Card(id, {
                    name,
                    super: !!sup ? true : undefined,
                    life: parseInt(lifeStr),
                    type,
                });
        }
        throw new Error(`Could not create card from string ${s}`);
    }

    static stringRegex = /(boss|dungeon|spell)\{(#)?(\S+?),(\d+),(\S+?)\}/i;
}
