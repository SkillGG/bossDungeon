import { DungeonCard, TreasureType } from "../../../../../shared/Cards/card";
import { Label } from "../../../components/Primitives/Label/Label";
import { RectangleBounds } from "../../../components/Primitives/Rectangle/RectangleBounds";
import { RotatedRectangleBounds } from "../../../components/Primitives/Rectangle/RotatedRectangleBounds";
import { oCARD_Z } from "../../../utils/zLayers";
import { GameCard } from "../card";

const treasureToEmoji: Record<TreasureType, string> = {
    fight: "✊",
    gold: "💰",
    holy: "🕇",
};

export class DungeonGameCard extends GameCard<DungeonCard> {
    nameLabel: Label;
    treauseLabel: Label;
    constructor(
        card: DungeonCard,
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
        const tLSize = 30;
        this.treauseLabel = new Label(
            `card_${card.id}_tLabel`,
            new RectangleBounds(w - tLSize, h - tLSize, tLSize, tLSize),
            treasureToEmoji[card.treasure],
            {
                label: {
                    font: "1em normal Arial",
                },
            }
        );
        this.style = {
            ...GameCard.DefaultStyle,
            fillColor: "#cc7c",
            strokeColor: card.special ? "gold" : "black",
            strokeWidth: 4,
        };
        this.labels.push(this.nameLabel, this.treauseLabel);
    }

    async update(dT: number): Promise<void> {
        if(this.hidden) return;
        await super.update(dT);
        this.nameLabel.text = this.card.name;
    }

    async render(ctx: CanvasRenderingContext2D): Promise<void> {
        if(this.hidden) return;
        await super.render(ctx);

        ctx.beginPath();
        await this.renderLabels(ctx);
        ctx.closePath();
    }
}
