import { Hideable, Movable, Styled, Vector2 } from "../../../utils/utils";
import { BoundedGameObject } from "../../GameObject";
import { RectangleBounds } from "./RectangleBounds";

export interface RRectangleStyle {
    fillColor: string;
    strokeColor: string;
    strokeWidth: number;
    fillGradient?: (
        ctx: CanvasRenderingContext2D,
        bounds: RectangleBounds
    ) => CanvasGradient;
    strokeGradient?: (
        ctx: CanvasRenderingContext2D,
        bounds: RectangleBounds
    ) => CanvasGradient;
    radii: [number, number, number, number];
    shadow?: {
        color: string;
        blur: number;
        offsetX?: number;
        offsetY?: number;
    };
}

export const RectangleDefaultStyle: RRectangleStyle = {
    fillColor: "transparent",
    strokeColor: "black",
    strokeWidth: 1,
    radii: [0, 0, 0, 0],
};

export class RRectangle
    extends BoundedGameObject<RectangleBounds>
    implements Hideable, Styled<RRectangleStyle>, Movable
{
    style: RRectangleStyle;
    initStyles: RRectangleStyle;
    clearStyles(): void {
        this.style = { ...this.initStyles };
    }
    constructor(
        id: string,
        bounds: RectangleBounds,
        style?: Partial<RRectangleStyle>,
        zIndex?: number
    ) {
        super(id, [bounds], zIndex);
        this.style = { ...RectangleDefaultStyle, ...style };
        this.initStyles = { ...this.style };
    }
    moveBy(v: Vector2): void {
        this.bounds[0].pos.x += v[0];
        this.bounds[0].pos.y += v[1];
    }
    moveTo(v: Vector2): void {
        this.bounds[0].pos.x = v[0];
        this.bounds[0].pos.y = v[1];
    }
    #hidden = false;
    hide(): void {
        this.#hidden = true;
    }
    show(): void {
        this.#hidden = false;
    }
    async update() {}
    async render(ctx: CanvasRenderingContext2D) {
        if (this.#hidden) return;
        const { x, y, width: w, height: h } = this.bounds[0];
        if (w * h === 0) return;
        ctx.beginPath();
        ctx.fillStyle =
            this.style.fillGradient?.(ctx, this.bounds[0]) ??
            this.style.fillColor;
        ctx.strokeStyle =
            this.style.strokeGradient?.(ctx, this.bounds[0]) ??
            this.style.strokeColor;
        ctx.lineWidth = this.style.strokeWidth;
        ctx.roundRect(x, y, w, h, this.style.radii);
        if (this.style.shadow) {
            ctx.shadowBlur = this.style.shadow.blur;
            ctx.shadowColor = this.style.shadow.color;
            if (this.style.shadow.offsetX) {
                ctx.shadowOffsetX = this.style.shadow.offsetX;
            }
            if (this.style.shadow.offsetY) {
                ctx.shadowOffsetY = this.style.shadow.offsetY;
            }
        }
        ctx.fill();
        ctx.stroke();
        ctx.closePath();
    }
    intersects(bounds: RectangleBounds) {
        if (this.#hidden) return;
        return this.bounds[0].intersects(bounds);
    }
}
