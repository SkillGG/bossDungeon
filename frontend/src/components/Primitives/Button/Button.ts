import { Game } from "../../../game";
import { Vector2, Hideable, Styled, Movable } from "../../../utils/utils";
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
    onmousedown?: (ev: ButtonClickEvent) => void;
    onmouseup?: (ev: ButtonClickEvent) => void;
    onenter?: (ev: ButtonMouseEvent) => void;
    onleave?: (ev: ButtonMouseEvent) => void;
}

export class Button
    extends BoundedGameObject<RectangleBounds>
    implements Hideable, Styled<LabelWithBorderStyle>, Movable
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
        super(id, [bounds], zIndex);
        this.onCalls = on;
        this.label = new Label(`${id}_label`, bounds, label, style);
    }
    moveBy(v: Vector2): void {
        this.bounds[0].moveBy(v);
    }
    moveTo(v: Vector2): void {
        this.bounds[0].pos.x = v[0];
        this.bounds[0].pos.y = v[1];
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

    pressedIn: boolean = false;

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
        if (Game.input.isPointerInRects(this.bounds)) {
            if (this.isIn === false) this.onCalls.onenter?.(MouseEvent);
            this.isIn = true;
        } else {
            if (this.isIn === true) this.onCalls.onleave?.(MouseEvent);
            this.isIn = false;
        }
        if (this.isIn) {
            if (Game.input.hasPressedMouseButton(LEFT_MOUSE_BUTTON)) {
                this.onCalls.onmousedown?.({
                    ...MouseEvent,
                    button: new Set(["left"]),
                });
                this.pressedIn = true;
            }
            if (
                Game.input.hasReleasedTouch() ||
                (this.pressedIn &&
                    Game.input.hasReleasedMouseButton(LEFT_MOUSE_BUTTON))
            ) {
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
        if (this.pressedIn) {
            if (Game.input.hasReleasedMouseButton(LEFT_MOUSE_BUTTON)) {
                this.onCalls.onmouseup?.({
                    ...MouseEvent,
                    button: new Set(["left"]),
                });
                this.pressedIn = false;
            }
        }
    }
    async render(ctx: CanvasRenderingContext2D) {
        if (this.#hidden) return;
        await this.label.safeCTXRender(ctx);
    }
}
