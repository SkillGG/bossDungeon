import { Cards } from "../../../../shared/Cards/card";
import { LEFT_MOUSE_BUTTON } from "../../components/KeyboardManager";

import { Label } from "../../components/Primitives/Label/Label";
import { RotatedRectangle } from "../../components/Primitives/Rectangle/RotatedRectangle";
import { RotatedRectangleBounds } from "../../components/Primitives/Rectangle/RotatedRectangleBounds";
import { Game } from "../../game";
import { oCARD_Z } from "../../utils/zLayers";
import { CardDeckType } from "./CardDeck";

export abstract class GameCard<T extends Cards.Type> extends RotatedRectangle {
    card: T;

    labels: Label[] = [];

    state: "dismissed" | "normal" = "normal";

    private _deckType: CardDeckType = CardDeckType.NORMAL;

    get deckType() {
        return this._deckType;
    }

    set deckType(d: CardDeckType) {
        this._deckType = d;
        this.onDeckTypeChanged(d);
    }

    onClicked: (dT: number) => void = () => {};
    onDeckTypeChanged: (deckType: CardDeckType) => void = () => {};

    toggleDismiss() {
        this.state =
            this.state === "dismissed" ? (this.state = "normal") : "dismissed";
    }

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

        if (this.state === "dismissed") {
            console.log("drawing cross");
            ctx.lineWidth = 10;
            ctx.strokeStyle = "red";
            ctx.lineCap = "round";
            ctx.beginPath();
            ctx.moveTo(this.bounds.width / 4, this.bounds.height / 4);
            ctx.lineTo(
                (this.bounds.width / 4) * 3,
                (this.bounds.height / 4) * 3
            );
            ctx.stroke();
            ctx.closePath();
            ctx.beginPath();
            ctx.moveTo((this.bounds.width / 4) * 3, this.bounds.height / 4);
            ctx.lineTo(this.bounds.width / 4, (this.bounds.height / 4) * 3);
            ctx.stroke();
            ctx.closePath();
        }
        ctx.restore();
    }

    async update(dT: number): Promise<void> {
        if (this.hidden) return;
        await super.update(dT);
        if (
            Game.input.hasMouseClicked(LEFT_MOUSE_BUTTON) &&
            Game.input.isPointerInTriangles(this.bounds.triangles)
        ) {
            console.log("clicked");
            this.onClicked(dT);
        }
    }

    async render(ctx: CanvasRenderingContext2D): Promise<void> {
        if (this.hidden) return;
        await super.render(ctx);
    }
}
