import { Hideable, Movable, Styled, Vector2 } from "../../utils/utils";
import { BoundedGameObject } from "../GameObject";
import { TriangleBounds } from "./TriangleBounds";

export interface TriangleStyle {
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

export const TriangleDefaultStyle: TriangleStyle = {
    fillColor: "transparent",
    strokeColor: "black",
    strokeWidth: 1,
};

export class Triangle
    extends BoundedGameObject<TriangleBounds>
    implements Hideable, Styled<TriangleStyle>, Movable
{
    constructor(
        id: string,
        bounds: TriangleBounds,
        style: Partial<TriangleStyle>,
        zIndex: number = 0
    ) {
        super(id, [bounds], zIndex);
        this.style = {
            ...TriangleDefaultStyle,
            ...style,
            shadow: style.shadow ? { ...style.shadow } : undefined,
        };
        this.initStyles = {
            ...this.style,
            shadow: this.style.shadow ? { ...this.style.shadow } : undefined,
        };
    }
    moveBy(v: Vector2): void {
        this.bounds[0].moveBy({ x: v[0], y: v[1] });
    }
    moveTo(v: Vector2): void {
        this.bounds[0].moveTo({ x: v[0], y: v[1] });
    }

    #hidden = false;
    hide(): void {
        this.#hidden = true;
    }
    show(): void {
        this.#hidden = false;
    }
    style: TriangleStyle;
    initStyles: TriangleStyle;
    clearStyles(): void {
        this.style = { ...this.initStyles };
    }

    async render(ctx: CanvasRenderingContext2D): Promise<void> {
        if (this.#hidden) return;
        ctx.beginPath();
        const { a, b, c } = this.bounds[0];

        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.lineTo(c.x, c.y);
        ctx.lineTo(a.x, a.y);

        ctx.fillStyle = this.style.fillGradient ?? this.style.fillColor;
        ctx.strokeStyle = this.style.strokeGradient ?? this.style.strokeColor;
        ctx.lineWidth = this.style.strokeWidth;
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
        ctx.stroke();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.lineTo(c.x, c.y);
        ctx.lineTo(a.x, a.y);
        ctx.fill();
        ctx.closePath();
    }
    async update(): Promise<void> {
        if (this.#hidden) return;
    }
}
