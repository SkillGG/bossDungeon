import { SpellCard } from "../../../../../shared/Cards/card";
import { Label } from "../../../components/Primitives/Label/Label";
import { RectangleBounds } from "../../../components/Primitives/Rectangle/RectangleBounds";
import { RotatedRectangleBounds } from "../../../components/Primitives/Rectangle/RotatedRectangleBounds";
import { oCARD_Z } from "../../../utils/zLayers";
import { GameCard } from "../card";

export class SpellGameCard extends GameCard<SpellCard> {
    nameLabel: Label;
    constructor(
        card: SpellCard,
        bounds: RotatedRectangleBounds,
        zIndex = oCARD_Z
    ) {
        super(card, bounds, zIndex);
        const { width: w} = bounds;
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
        this.style = {
            fillColor: "#cc7c",
            strokeColor: card.special ? "gold" : "black",
            strokeWidth: 4,
        };
        this.labels.push(this.nameLabel);
    }

    async update(): Promise<void> {
        this.nameLabel.update();
        this.nameLabel.text = this.card.name;
    }

    async render(ctx: CanvasRenderingContext2D): Promise<void> {
        await super.render(ctx);

        ctx.beginPath();
        await this.renderLabels(ctx);
        ctx.closePath();
    }
}
