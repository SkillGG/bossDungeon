import {
    Hideable,
    Movable,
    Styled,
    Vector2,
    getTextMeasures,
} from "../../../utils/utils";
import { BoundedGameObject } from "../../GameObject";
import { RRectangle, RRectangleStyle } from "../Rectangle/RRectangle";
import { RectangleStyle, Rectangle } from "../Rectangle/Rectangle";
import { RectangleBounds } from "../Rectangle/RectangleBounds";

type AlignText = "center" | "right" | "left";
type JustifyText = "center" | "top" | "bottom";

interface RectStyle {
    label?: Partial<LabelTextStyle>;
    border?: Partial<RectangleStyle>;
}

interface RoundedStyle {
    label?: Partial<LabelTextStyle>;
    border?: Partial<RRectangleStyle>;
    rounded: true;
}

export type LabelWithBorderStyle = RectStyle | RoundedStyle;

const isRoundedStyle = (style: LabelWithBorderStyle): style is RoundedStyle =>
    (style as any).rounded;

export interface LabelTextStyle {
    textColor: string;
    font: string;
    halign: AlignText;
    valign: JustifyText;
    textStroke?: {
        color:
            | string
            | ((
                  ctx: CanvasRenderingContext2D,
                  bounds: RectangleBounds
              ) => CanvasGradient);
        width: number;
    };
}

export class Label
    extends BoundedGameObject<RectangleBounds>
    implements Hideable, Styled<LabelTextStyle>, Movable
{
    border: Rectangle | RRectangle;
    style: LabelTextStyle;
    initStyles: LabelTextStyle;
    static defaultStyle: LabelTextStyle = {
        halign: "center",
        font: "",
        valign: "center",
        textColor: "black",
    };
    constructor(
        id: string,
        bounds: RectangleBounds,
        public text: string = "",
        style?: LabelWithBorderStyle,
        zIndex?: number
    ) {
        super(id, bounds, zIndex);
        this.style = { ...Label.defaultStyle, ...style?.label };
        if (!style || !isRoundedStyle(style)) {
            this.border = new Rectangle(`${id}_border`, this.bounds, {
                ...style?.border,
            });
        } else {
            this.border = new RRectangle(`${id}_border`, this.bounds, {
                ...style?.border,
            });
        }
        this.initStyles = { ...this.style };
    }
    moveBy(v: Vector2): void {
        this.border.moveBy(v);
        this.bounds.pos.x += v[0];
        this.bounds.pos.y += v[1];
    }
    moveTo(v: Vector2): void {
        this.border.moveTo(v);
        this.bounds.pos.x = v[0];
        this.bounds.pos.y = v[1];
    }

    clearStyles() {
        this.style = { ...this.initStyles };
    }

    #hidden = false;

    get isHidden() {
        return this.#hidden;
    }

    show() {
        this.#hidden = false;
    }

    hide() {
        this.#hidden = true;
    }

    async render(ctx: CanvasRenderingContext2D) {
        if (this.#hidden) return;
        await this.border.render(ctx);
        const { x, y, width: w, height: h } = this.bounds;
        ctx.beginPath();
        ctx.font = this.style.font;
        const textBounds = getTextMeasures(ctx, this.text);
        const textWidth = textBounds.width;
        const textHeight = textBounds.height;
        const boundHeight = h || textHeight;
        const boundWidth = w || textWidth;
        const textX =
            this.style.halign === "left"
                ? x
                : this.style.halign === "right"
                ? x + w - textWidth
                : x + (boundWidth - textWidth) / 2;
        const textY =
            this.style.valign === "top"
                ? y + textBounds.ascent
                : this.style.valign === "bottom"
                ? y + h - textBounds.descent
                : y + (boundHeight + textHeight) / 2 - textBounds.descent;
        ctx.fillStyle = this.style.textColor;
        ctx.fillText(
            this.text,
            textX,
            textY,
            w ? w - this.border.style.strokeWidth * 2 : undefined
        );
        const strokeColor = this.getStroke(ctx);
        if (strokeColor) {
            ctx.strokeStyle = strokeColor.color;
            ctx.lineWidth = strokeColor.width;
            ctx.strokeText(
                this.text,
                textX,
                textY,
                w ? w - this.border.style.strokeWidth * 2 : undefined
            );
        }
        ctx.closePath();
    }

    getStroke(ctx: CanvasRenderingContext2D) {
        if (!this.style.textStroke) return undefined;
        return {
            color:
                typeof this.style.textStroke.color === "function"
                    ? this.style.textStroke.color(ctx, this.bounds)
                    : this.style.textStroke.color,
            width: this.style.textStroke.width,
        };
    }

    async update() {}
}
