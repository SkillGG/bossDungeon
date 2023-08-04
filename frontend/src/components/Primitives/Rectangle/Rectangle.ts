import { Hideable, Styled } from "../../../utils/utils";
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
    extends BoundedGameObject
    implements Hideable, Styled<RectangleStyle>
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
        if (this.bounds.width * this.bounds.height === 0) return;
        ctx.beginPath();
        ctx.fillStyle = this.style.fillGradient ?? this.style.fillColor;
        ctx.strokeStyle = this.style.strokeGradient ?? this.style.strokeColor;
        ctx.lineWidth = this.style.strokeWidth;
        ctx.rect(
            this.bounds.x,
            this.bounds.y,
            this.bounds.width,
            this.bounds.height
        );
        if (this.style.shadow) {
            console.log("shadow from", this.id);
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
