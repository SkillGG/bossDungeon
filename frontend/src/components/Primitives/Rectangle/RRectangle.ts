import { Hideable, Styled } from "../../../utils/utils";
import { BoundedGameObject } from "../../GameObject";
import { RectangleBounds } from "./RectangleBounds";

export interface RRectangleStyle {
    fillColor: string;
    strokeColor: string;
    strokeWidth: number;
    radii: [number, number, number, number];
}

export const RectangleDefaultStyle: RRectangleStyle = {
    fillColor: "transparent",
    strokeColor: "black",
    strokeWidth: 1,
    radii: [0, 0, 0, 0],
};

export class RRectangle
    extends BoundedGameObject
    implements Hideable, Styled<RRectangleStyle>
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
        super(id, bounds, zIndex);
        this.style = { ...RectangleDefaultStyle, ...style };
        this.initStyles = { ...this.style };
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
        ctx.fillStyle = this.style.fillColor;
        ctx.strokeStyle = this.style.strokeColor;
        ctx.lineWidth = this.style.strokeWidth;
        ctx.roundRect(
            this.bounds.x,
            this.bounds.y,
            this.bounds.width,
            this.bounds.height,
            this.style.radii
        );
        ctx.fill();
        ctx.stroke();
    }
    intersects(bounds: RectangleBounds) {
        if (this.#hidden) return;
        return this.bounds.intersects(bounds);
    }
}
