import { BossCard, Card } from "../../../../shared/Cards/card";
import { BoundedGameObject } from "../../components/GameObject";
import { Label } from "../../components/Primitives/Label/Label";
import { RectangleBounds } from "../../components/Primitives/Rectangle/RectangleBounds";
import { oCARD_Z } from "../../utils/zLayers";

export class GameCard extends BoundedGameObject {
    card: Card;

    nameLabel: Label;
    lifeLabel: Label;

    constructor(card: Card, bounds: RectangleBounds, zIndex = oCARD_Z) {
        super(`card_${card.id}`, bounds, zIndex);
        this.card = card;
        const { x, y, width: w, height: h } = bounds;
        this.nameLabel = new Label(
            `card_${card.id}_label`,
            new RectangleBounds(x, y, w, 25),
            card.name,
            {
                label: {
                    font: "1em normal Arial",
                },
            }
        );
        const lifePadding = 5;
        this.lifeLabel = new Label(
            `card_${card.id}_life`,
            new RectangleBounds(
                x + lifePadding,
                y + lifePadding,
                w - lifePadding * 2,
                h - lifePadding * 2
            ),
            `${card.life}`,
            {
                label: {
                    font: "1.1em normal Arial",
                    halign: "right",
                    valign: "bottom",
                },
                border: {
                    strokeColor: "transparent",
                },
            }
        );
    }

    async update(): Promise<void> {
        this.nameLabel.update();
        this.lifeLabel.update();
        this.nameLabel.text = this.card.name;
        this.lifeLabel.text = `${this.card.life}`;
    }

    async render(ctx: CanvasRenderingContext2D): Promise<void> {
        const { x, y, width: w, height: h } = this.bounds;

        ctx.beginPath();

        if (this.card.type === "boss") {
            ctx.fillStyle = "#ce1121cc";
            ctx.fillRect(x, y, w, h);
            ctx.strokeStyle = "black";
            ctx.lineWidth = 4;
            ctx.strokeRect(x, y, w, h);
        }

        this.nameLabel.render(ctx);
        this.lifeLabel.render(ctx);

        ctx.closePath();
    }
}

export class BossGameCard extends GameCard {
    constructor(boss: BossCard, bounds: RectangleBounds, zIndex = oCARD_Z) {
        super(boss, bounds, zIndex);
    }
}
