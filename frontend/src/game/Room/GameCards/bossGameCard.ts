import { BossCard } from "../../../../../shared/Cards/card";
import { Label } from "../../../components/Primitives/Label/Label";
import { RectangleBounds } from "../../../components/Primitives/Rectangle/RectangleBounds";
import { RotatedRectangleBounds } from "../../../components/Primitives/Rectangle/RotatedRectangleBounds";
import { oCARD_Z } from "../../../utils/zLayers";
import { GameCard } from "../card";

export class BossGameCard extends GameCard<BossCard> {
    nameLabel: Label;
    lifeLabel: Label;
    constructor(
        card: BossCard,
        bounds: RotatedRectangleBounds,
        zIndex = oCARD_Z
    ) {
        super(card, bounds, zIndex);
        const { width: w, height: h } = bounds;
        this.nameLabel = new Label(
            `card_${card.id}_label`,
            new RectangleBounds(0, 0, w, 25),
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
                lifePadding,
                lifePadding,
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
        this.style = {
            ...GameCard.DefaultStyle,
            fillColor: "#ce1121cc",
            strokeColor: "black",
            strokeWidth: 4,
        };
        this.labels.push(this.lifeLabel, this.nameLabel);
    }

    async update(dT: number): Promise<void> {
        if(this.hidden) return;
        await super.update(dT);
        this.nameLabel.update();
        this.lifeLabel.update();
        this.nameLabel.text = this.card.name;
        this.lifeLabel.text = `${this.card.life}`;
    }

    async render(ctx: CanvasRenderingContext2D): Promise<void> {
        if(this.hidden) return;
        await super.render(ctx);

        ctx.beginPath();
        await this.renderLabels(ctx);
        ctx.closePath();
    }
}
