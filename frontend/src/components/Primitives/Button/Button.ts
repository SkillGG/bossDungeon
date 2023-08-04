import { Game } from "../../../game";
import { Vector2, Hideable, Styled } from "../../../utils/utils";
import { BoundedGameObject } from "../../GameObject";
import { LEFT_MOUSE_BUTTON, RIGHT_MOUSE_BUTTON } from "../../KeyboardManager";
import { LabelWithBorderStyle, Label } from "../Label/Label";
import { RectangleBounds } from "../Rectangle/RectangleBounds";

export interface ButtonMouseEvent {
    mousePos: Vector2;
    target: Button;
}

export interface ButtonClickEvent extends ButtonMouseEvent {
    button: Set<"left" | "middle" | "right">;
}

type ButtonStyle = LabelWithBorderStyle;

export interface ButtonOnCalls {
    onclick?: (ev: ButtonClickEvent) => void;
    onenter?: (ev: ButtonMouseEvent) => void;
    onleave?: (ev: ButtonMouseEvent) => void;
}

export class Button
    extends BoundedGameObject
    implements Hideable, Styled<LabelWithBorderStyle>
{
    label: Label;
    onCalls: ButtonOnCalls;
    constructor(
        id: string,
        bounds: RectangleBounds,
        on: ButtonOnCalls,
        label?: string,
        style?: ButtonStyle,
        zIndex?: number
    ) {
        super(id, bounds, zIndex);
        this.onCalls = on;
        this.label = new Label(`${id}_label`, bounds, label, style);
    }
    get style() {
        return { label: this.label.style };
    }
    get initStyles() {
        return { label: this.label.initStyles };
    }
    clearStyles(): void {
        this.label.clearStyles();
        this.label.border.clearStyles();
    }
    isIn: boolean = false;

    #hidden = false;

    hide() {
        this.#hidden = true;
    }
    show() {
        this.#hidden = false;
    }

    async update() {
        if (this.#hidden) return;
        const { _mousePosition: mousePos } = Game.input;
        const MouseEvent = { mousePos, target: this };
        if (Game.input.isPointerIn(this.bounds)) {
            if (this.isIn === false) this.onCalls.onenter?.(MouseEvent);
            this.isIn = true;
        } else {
            if (this.isIn === true) this.onCalls.onleave?.(MouseEvent);
            this.isIn = false;
        }
        if (Game.input.pointerButtonsClicked.size > 0 && this.isIn) {
            this.onCalls.onclick?.({
                ...MouseEvent,
                button: new Set(
                    [...Game.input.pointerButtonsClicked].map((q) =>
                        q === LEFT_MOUSE_BUTTON
                            ? "left"
                            : q === RIGHT_MOUSE_BUTTON
                            ? "right"
                            : "middle"
                    )
                ),
            });
        }
    }
    async render(ctx: CanvasRenderingContext2D) {
        if (this.#hidden) return;
        await this.label.render(ctx);
    }
}
