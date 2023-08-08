import { Hideable, Movable, Styled, Vector2 } from "../../../utils/utils";
import { BoundedGameObject } from "../../GameObject";
import { TriangleBounds } from "../../Triangle/TriangleBounds";

export interface RotatedRectangleStyle {
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

export const RotatedRectangleDefaultStyle: RotatedRectangleStyle = {
    fillColor: "transparent",
    strokeColor: "black",
    strokeWidth: 1,
};

export class RotatedRectangle
    extends BoundedGameObject<TriangleBounds>
    implements Hideable, Styled<RotatedRectangleStyle>, Movable
{
    constructor(
        id: string,
        bounds: {
            a: Vector2;
            b: Vector2;
            d: Vector2;
        },
        styles?: Partial<RotatedRectangleStyle>,
        zIndex = 0
    ) {
        // A - B
        // | / |
        // C - D

        const a = bounds.a;
        const b = bounds.b;
        const c: Vector2 = [
            bounds.b[0] + bounds.d[0],
            bounds.b[1] + bounds.d[1],
        ];
        const d: Vector2 = [
            bounds.a[0] + bounds.d[0],
            bounds.a[1] + bounds.d[1],
        ];

        super(
            id,
            [new TriangleBounds(a, b, c), new TriangleBounds(c, a, d)],
            zIndex
        );
        this.style = { ...RotatedRectangleDefaultStyle, ...styles };
        this.initStyles = { ...this.style };
    }

    async render(ctx: CanvasRenderingContext2D): Promise<void> {
        if (this.#hidden) return;
        ctx.beginPath();
        const { x: ax, y: ay } = this.bounds[0].a;
        const { x: bx, y: by } = this.bounds[0].b;
        const { x: cx, y: cy } = this.bounds[0].c;
        const { x: dx, y: dy } = this.bounds[1].c;
        const drawShape = () => {
            ctx.moveTo(ax, ay);
            ctx.lineTo(bx, by);
            ctx.lineTo(cx, cy);
            ctx.lineTo(dx, dy);
            ctx.lineTo(ax, ay);
        };
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
        drawShape();
        ctx.fill();
        drawShape();
        ctx.stroke();

        ctx.closePath();

    }
    async update(): Promise<void> {}
    #hidden = false;
    hide(): void {
        this.#hidden = true;
    }
    show(): void {
        this.#hidden = false;
    }
    style: RotatedRectangleStyle;
    initStyles: RotatedRectangleStyle;
    clearStyles(): void {
        this.style = { ...this.initStyles };
    }
    moveBy(v: Vector2): void {
        this.bounds[0].moveBy(v);
        this.bounds[1].moveBy(v);
    }
    moveTo(v: Vector2): void {
        throw new Error("Method not implemented.");
    }
}
