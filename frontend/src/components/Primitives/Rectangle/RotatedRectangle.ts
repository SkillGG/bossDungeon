import { theme } from "../../../main";
import { Hideable, Movable, Styled, Vector2 } from "../../../utils/utils";
import { BoundedGameObject } from "../../GameObject";
import { RotatedRectangleBounds } from "./RotatedRectangleBounds";

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
    extends BoundedGameObject<RotatedRectangleBounds>
    implements Hideable, Styled<RotatedRectangleStyle>, Movable
{
    constructor(
        id: string,
        bounds: RotatedRectangleBounds,
        styles?: Partial<RotatedRectangleStyle>,
        zIndex = 0
    ) {
        super(id, bounds, zIndex);
        this.style = { ...RotatedRectangleDefaultStyle, ...styles };
        this.initStyles = { ...this.style };
    }

    debug = false;
    debugColors = {
        t1: "#00f5",
        t2: "#0f05",
        anchor: "yellow",
    };
    async render(ctx: CanvasRenderingContext2D): Promise<void> {
        if (this.#hidden) return;
        ctx.beginPath();
        const drawShape = () => {
            ctx.moveTo(this.ax, this.ay);
            ctx.lineTo(this.bx, this.by);
            ctx.lineTo(this.dx, this.dy);
            ctx.lineTo(this.cx, this.cy);
            ctx.lineTo(this.ax, this.ay);
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

        if (this.debug) {
            ctx.fillStyle = theme.textColor;
            ctx.fillText("a", this.ax - 5, this.ay);
            ctx.fillText("b", this.bx, this.by);
            ctx.fillText("c", this.cx - 5, this.cy + 5);
            ctx.fillStyle = theme.textColor;
            ctx.fillText("d", this.dx, this.dy + 5);
            ctx.beginPath();
            ctx.moveTo(this.ax, this.ay);
            ctx.lineTo(this.bx, this.by);
            ctx.lineTo(this.cx, this.cy);
            ctx.lineTo(this.ax, this.ay);
            ctx.fillStyle = this.debugColors.t1;
            ctx.fill();
            ctx.closePath();
            ctx.beginPath();
            ctx.moveTo(this.cx, this.cy);
            ctx.lineTo(this.bx, this.by);
            ctx.lineTo(this.dx, this.dy);
            ctx.lineTo(this.cx, this.cy);
            ctx.fillStyle = this.debugColors.t2;
            ctx.fill();
            ctx.closePath();
            ctx.beginPath();
            ctx.arc(
                this.bounds.absAnchor[0],
                this.bounds.absAnchor[1],
                4,
                0,
                Math.PI * 2
            );
            ctx.fillStyle = this.debugColors.anchor;
            ctx.fill();
            ctx.closePath();
        }
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
        this.bounds.moveBy(v);
        this.bounds.moveBy(v);
    }
    moveTo(v: Vector2): void {
        this.bounds.moveTo(v);
    }
    get ax() {
        return this.bounds.a.x;
    }

    get ay() {
        return this.bounds.a.y;
    }
    get bx() {
        return this.bounds.b.x;
    }

    get by() {
        return this.bounds.b.y;
    }
    get cx() {
        return this.bounds.c.x;
    }

    get cy() {
        return this.bounds.c.y;
    }
    get dx() {
        return this.bounds.d.x;
    }
    get dy() {
        return this.bounds.d.y;
    }
    get angle() {
        return this.bounds.angle;
    }
    set angle(deg: number) {
        this.bounds.angle = deg;
    }
    get radAngle() {
        return this.bounds.radAngle;
    }
}
