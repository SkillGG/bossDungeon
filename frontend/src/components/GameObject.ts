import { Updateable, Renderable } from "../utils/utils";
import { RectangleBounds } from "./Primitives/Rectangle/RectangleBounds";
import { RotatedRectangleBounds } from "./Primitives/Rectangle/RotatedRectangleBounds";
import { TriangleBounds } from "./Primitives/Triangle/TriangleBounds";

export abstract class GameObject implements Updateable, Renderable {
    id: string;
    zIndex: number;
    constructor(id: string, zIndex = 0) {
        this.id = id;
        this.zIndex = zIndex;
    }
    async safeCTXRender(ctx: CanvasRenderingContext2D) {
        ctx.save();
        await this.render(ctx);
        ctx.restore();
    }
    abstract render(ctx: CanvasRenderingContext2D): Promise<void>;
    abstract update(time: number): Promise<void>;
}

export type TOrArr<T> = T | T[];

export type BoundingTypes =
    | TOrArr<RectangleBounds>
    | TOrArr<TriangleBounds>
    | TOrArr<RotatedRectangleBounds>;

export abstract class BoundedGameObject<
    T extends BoundingTypes
> extends GameObject {
    bounds: T;
    constructor(id: string, bounds: T, zIndex?: number) {
        super(id, zIndex);
        this.bounds = bounds;
    }
}
