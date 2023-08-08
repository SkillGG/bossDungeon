import { Updateable, Renderable } from "../utils/utils";
import { RectangleBounds } from "./Primitives/Rectangle/RectangleBounds";
import { TriangleBounds } from "./Triangle/TriangleBounds";

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

export abstract class BoundedGameObject<
    T extends RectangleBounds | TriangleBounds
> extends GameObject {
    bounds: T[];
    constructor(id: string, bounds: T[], zIndex?: number) {
        super(id, zIndex);
        this.bounds = bounds;
    }
}
