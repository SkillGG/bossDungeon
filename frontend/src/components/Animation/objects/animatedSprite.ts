import { Vector2 } from "../../../utils/utils";
import { oANIMATEDSPRITE_Z } from "../../../utils/zLayers";
import { BoundedGameObject } from "../../GameObject";
import { RectangleBounds } from "../../Primitives/Rectangle/RectangleBounds";
import { Sprite } from "../../Primitives/Sprite/Sprite";
import { CanAnimate } from "../animation";

export class AnimatedSprite
    extends BoundedGameObject<RectangleBounds>
    implements CanAnimate
{
    sprites: Sprite[];
    frameTick = 0;
    frame = 0;
    frameNumber: number;
    frameDelays: number[] = [];

    fps;

    onPlay: (as: AnimatedSprite) => Promise<void>;
    onFinish: (as: AnimatedSprite) => Promise<void>;
    constructor(
        id: string,
        bounds: RectangleBounds,
        sprites: Sprite[],
        frameDelays: number[] = [],
        onPlay: (as: AnimatedSprite) => Promise<void>,
        onFinish: (as: AnimatedSprite) => Promise<void>,
        fps = 60,
        zIndex = oANIMATEDSPRITE_Z
    ) {
        super(id, bounds, zIndex);
        this.sprites = sprites;
        this.frameDelays = frameDelays;
        while (frameDelays.length < sprites.length) {
            this.frameDelays.push(0);
        }
        this.frameNumber = this.frameDelays.reduce(
            (p, n) => (n ? p + n : p + 1),
            0
        );
        this.fps = fps;
        this.onPlay = onPlay;
        this.onFinish = onFinish;
    }
    offsetXY: Vector2 = [0, 0];
    offsetSize: Vector2 = [0, 0];
    async render(ctx: CanvasRenderingContext2D) {
        if (this.frame > this.sprites.length - 1) return;
        const sprite = this.sprites[this.frame];
        const { x, y, width, height } = this.bounds;
        if (!sprite) return;
        sprite.moveTo(
            new RectangleBounds(
                x + this.offsetXY[0],
                y + this.offsetXY[1],
                width + this.offsetSize[0],
                height + this.offsetSize[1]
            )
        );
        await sprite.render(ctx);
    }
    moveOffsetBy(x: number | Vector2, y?: number) {
        if (Array.isArray(x) && typeof y === "undefined") {
            this.offsetXY[0] += x[0];
            this.offsetXY[1] += x[1];
        } else if (typeof x === "number" && typeof y === "number") {
            this.offsetXY[0] += x;
            this.offsetXY[1] += x;
        }
    }
    resizeOffsetBy(widthOrSize: number | Vector2, height?: number) {
        if (Array.isArray(widthOrSize) && typeof height === "undefined") {
            this.offsetSize[0] += widthOrSize[0];
            this.offsetSize[1] += widthOrSize[1];
        } else if (
            typeof widthOrSize === "number" &&
            typeof height === "number"
        ) {
            this.offsetSize[0] += widthOrSize;
            this.offsetSize[1] += widthOrSize;
        }
    }
    async play() {
        this.playing = true;
        await this.onPlay(this);
    }
    private playing = false;
    stop() {
        this.playing = false;
    }

    timeElapsed = 0;

    async update(time: number) {
        const frameInterval = 1000 / this.fps;
        if (this.playing) {
            const fD = this.frameDelays[this.frame] || 0;
            if (fD < this.frameTick) {
                const framesUpBy = Math.floor(
                    this.frameTick / (this.frameDelays[this.frame] || 1)
                );
                this.frame += framesUpBy;
                this.frameTick = 0;
            }

            if (this.timeElapsed > frameInterval) {
                const frameTicksUpBy = Math.floor(
                    this.timeElapsed / frameInterval
                );
                this.frameTick += frameTicksUpBy;
                this.timeElapsed = 0;
            }

            this.timeElapsed += time;

            if (this.frame > this.sprites.length - 1) {
                this.stop();
                await this.onFinish(this);
            }
        }
    }
}
