import { Hideable, Styled, getTextMeasures } from "../../../utils/utils";
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
    extends BoundedGameObject
    implements Hideable, Styled<LabelTextStyle>
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
        ctx.beginPath();
        ctx.font = this.style.font;
        const textBounds = getTextMeasures(ctx, this.text);
        const textWidth = textBounds.width;
        const textHeight = textBounds.height;
        const boundHeight = this.bounds.height || textHeight;
        const boundWidth = this.bounds.width || textWidth;
        const textX =
            this.style.halign === "left"
                ? this.bounds.x
                : this.style.halign === "right"
                ? this.bounds.x + this.bounds.width - textWidth
                : this.bounds.x + (boundWidth - textWidth) / 2;
        const textY =
            this.style.valign === "top"
                ? this.bounds.y + textBounds.ascent
                : this.style.valign === "bottom"
                ? this.bounds.y + this.bounds.height - textBounds.descent
                : this.bounds.y +
                  (boundHeight + textHeight) / 2 -
                  textBounds.descent;
        ctx.fillStyle = this.style.textColor;
        ctx.fillText(
            this.text,
            textX,
            textY,
            this.bounds.width
                ? this.bounds.width - this.border.style.strokeWidth * 2
                : undefined
        );
        if (this.style.textStroke) {
            ctx.strokeStyle =
                typeof this.style.textStroke.color === "function"
                    ? this.style.textStroke.color(ctx, this.bounds)
                    : this.style.textStroke.color;
            ctx.lineWidth = this.style.textStroke.width;
            ctx.strokeText(
                this.text,
                textX,
                textY,
                this.bounds.width
                    ? this.bounds.width - this.border.style.strokeWidth * 2
                    : undefined
            );
        }
        ctx.closePath();
    }
    async update() {}
}
