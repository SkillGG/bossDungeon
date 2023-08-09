import { Hideable, Movable, Styled, Vector2 } from "../../../utils/utils";
import { BoundedGameObject } from "../../GameObject";
import { RectangleBounds } from "./RectangleBounds";

export interface RectangleStyle {
    fillColor: string;
    fillGradient?: CanvasGradient;
    strokeGradient?: CanvasGradient;
    strokeColor: string;
    strokeWidth: number;
    shadow?: {
        color: string;
        blur: number;
        offsetX?: number;
        offsetY?: number;
    };
}

export const RectangleDefaultStyle: RectangleStyle = {
    fillColor: "transparent",
    strokeColor: "black",
    strokeWidth: 1,
};

export class Rectangle
    extends BoundedGameObject<RectangleBounds>
    implements Hideable, Styled<RectangleStyle>, Movable
{
    style: RectangleStyle;
    initStyles: RectangleStyle;
    constructor(
        id: string,
        bounds: RectangleBounds,
        style?: Partial<RectangleStyle>,
        zIndex?: number
    ) {
        super(id, bounds, zIndex);
        this.style = { ...RectangleDefaultStyle, ...style };
        this.initStyles = { ...this.style };
    }
    moveBy(v: Vector2): void {
        this.bounds.pos.x += v[0];
        this.bounds.pos.y += v[1];
    }
    moveTo(v: Vector2): void {
        this.bounds.pos.x = v[0];
        this.bounds.pos.y = v[1];
    }
    clearStyles(): void {
        this.style = { ...this.initStyles };
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
        const { x, y, width: w, height: h } = this.bounds;
        if (w * h === 0) return;
        ctx.beginPath();
        ctx.fillStyle = this.style.fillGradient ?? this.style.fillColor;
        ctx.strokeStyle = this.style.strokeGradient ?? this.style.strokeColor;
        ctx.lineWidth = this.style.strokeWidth;
        ctx.rect(x, y, w, h);
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
        return this.bounds.intersects(bounds);
    }
}
