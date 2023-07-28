import { Game } from "../../game";
import { GameState } from "../../main";
import { Vector2 } from "../../utils/utils";
import { GameObject } from "../GameObject";
import { StateManager } from "../StateManager";

export interface CanAnimate {
    render(ctx: CanvasRenderingContext2D, frame: number): void;
    moveOffsetBy(x: number, y: number): void;
    moveOffsetBy(v: Vector2): void;
    resizeOffsetBy(x: number, y: number): void;
    resizeOffsetBy(v: Vector2): void;
}

export abstract class GameAnimation<
    T extends GameObject[]
> extends StateManager<GameState> {
    objects: T;
    frame: number;
    defaultID = "animation";
    animating = false;
    startAnimation() {
        this.animating = true;
    }
    onend: (id: string) => void;
    constructor(
        id: string,
        end: (id: string) => void,
        defaultState: GameState,
        ...objs: T
    ) {
        super(id, Game.instance!.manager, defaultState);
        this.frame = 0;
        this.onend = end;
        this.objects = objs;
    }

    abstract renderAnimation(_: CanvasRenderingContext2D): Promise<void>;
    abstract updateAnimation(_: number): Promise<void>;

    async render(ctx: CanvasRenderingContext2D): Promise<void> {
        if (this.animating) await this.renderAnimation(ctx);
    }
    async update(dt: number): Promise<void> {
        if (this.animating) await this.updateAnimation(dt);
    }

    end() {
        this.removeObjects();
        this.onend(this.id);
    }

    removeObjects(): void {
        this.objects.forEach((t) => {
            this.removeObject(t);
        });
    }
    registerObjects(): void {
        this.objects.forEach((t) => this.registerObject(t));
    }
}
