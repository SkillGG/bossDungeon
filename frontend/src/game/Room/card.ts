import { Cards } from "../../../../shared/Cards/card";
import { Label } from "../../components/Primitives/Label/Label";
import { RotatedRectangle } from "../../components/Primitives/Rectangle/RotatedRectangle";
import { RotatedRectangleBounds } from "../../components/Primitives/Rectangle/RotatedRectangleBounds";
import { oCARD_Z } from "../../utils/zLayers";

export abstract class GameCard<T extends Cards.Type> extends RotatedRectangle {
    card: T;

    labels: Label[] = [];

    constructor(card: T, bounds: RotatedRectangleBounds, zIndex = oCARD_Z) {
        super(`card_${card.id}`, bounds, {}, zIndex);
        this.card = card;
    }

    async renderLabels(ctx: CanvasRenderingContext2D): Promise<void> {
        ctx.save();
        const rB = this.bounds.getRectangleBounds();
        ctx.rect(rB.x, rB.y, rB.width, rB.height);
        ctx.clip();
        ctx.translate(this.ax, this.ay);
        ctx.rotate(this.radAngle);
        for (const l of this.labels) {
            await l.render(ctx);
        }
        ctx.restore();
    }

    async update(): Promise<void> {
        await super.update();
    }

    async render(ctx: CanvasRenderingContext2D): Promise<void> {
        await super.render(ctx);
    }
}
