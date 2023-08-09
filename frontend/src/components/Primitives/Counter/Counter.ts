import { Hideable, Styled } from "../../../utils/utils";
import { oCOUNTER_Z } from "../../../utils/zLayers";
import { BoundedGameObject } from "../../GameObject";
import { Label, LabelTextStyle } from "../Label/Label";
import { RectangleBounds } from "../Rectangle/RectangleBounds";

type CounterStyles = {
    arcColor: string;
    label: Partial<LabelTextStyle>;
};

type CounterOptions = {
    style: CounterStyles;
    currTime: number;
    interval: number;
};

export class Counter
    extends BoundedGameObject<RectangleBounds>
    implements Styled<CounterStyles>, Hideable
{
    options: CounterOptions;

    get style(): CounterStyles {
        return { ...Counter.defaultStyle, ...this.options.style };
    }

    initStyles: CounterStyles;

    private timerLength: number = 0;
    private timeElapsed: number = 0;

    clearStyles(): void {
        this.options.style = this.initStyles;
        this.textLabel.clearStyles();
    }

    static defaultStyle: CounterStyles = {
        arcColor: "blue",
        label: Label.defaultStyle,
    };

    textLabel: Label;

    constructor(
        id: string,
        bounds: RectangleBounds,
        counterOptions: CounterOptions,
        zIndex = oCOUNTER_Z
    ) {
        super(id, bounds, zIndex);
        this.options = counterOptions;
        this.initStyles = { ...this.style };
        this.textLabel = new Label(
            `${id}_textlabel`,
            bounds,
            `${this.options.currTime}`,
            {
                border: {
                    fillColor: "transparent",
                    strokeColor: "transparent",
                },
                label: this.style.label,
            }
        );
    }

    initCounter(startTime: number, interval: number = 1000) {
        this.options.interval = interval;
        this.options.currTime = startTime;
        this.timerLength = startTime;
    }

    #hidden = false;

    show() {
        this.#hidden = false;
    }

    hide() {
        this.#hidden = true;
    }

    updateTime(n: number) {
        this.options.currTime = n;
        this.timeElapsed = 0;
    }

    get percentDone() {
        return (this.timerLength - this.options.currTime) / this.timerLength;
    }

    get percentDoneMS() {
        return Math.min(this.timeElapsed / this.options.interval, 1);
    }

    async render(ctx: CanvasRenderingContext2D): Promise<void> {
        if (this.#hidden) return;
        const { x, y, width: w, height: h } = this.bounds;

        ctx.beginPath();
        ctx.fillStyle = this.style.arcColor;
        ctx.moveTo(x + w / 2, y + h / 2);
        ctx.arc(
            x + w / 2,
            y + h / 2,
            w / 2,
            Math.PI * (-0.5 + this.percentDoneMS * 2),
            Math.PI * 1.5
        );
        ctx.fill();
        ctx.closePath();
        await this.textLabel.render(ctx);
    }
    async update(dT: number): Promise<void> {
        if (this.#hidden) return;
        this.textLabel.text = `${this.options.currTime}`;
        if (this.timeElapsed + dT < this.options.interval)
            this.timeElapsed += dT;
        else this.timeElapsed = this.options.interval;
    }
}
