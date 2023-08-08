import { theme } from "../../main";
import { Vector2, getTextMeasuresWithFont } from "../../utils/utils";
import { oFPS_Z } from "../../utils/zLayers";
import { GameObject } from "../GameObject";
import { Label } from "../Primitives/Label/Label";
import { RectangleBounds } from "../Primitives/Rectangle/RectangleBounds";

export class FpsCounter extends GameObject {
    fps: Label;
    version: Label;
    constructor(pos: Vector2, version: string, font?: string, zIndex = oFPS_Z) {
        super("fpsCounter", zIndex);
        this.fps = new Label("fpsLabel", new RectangleBounds(pos, [0, 0]), "", {
            label: {
                valign: "top",
                textColor: theme.textColor,
            },
        });
        this.fps.style.font = font || "normal 1em auto";
        this.version = new Label(
            "versionlabel",
            new RectangleBounds(pos, [0, 0]),
            version,
            { label: { textColor: theme.textColor } }
        );
        this.version.style.font = font || "normal 1em auto";
        this.version.style.valign = "top";
        this.createTime = this.curTime = performance.now();
    }
    createTime: number;
    upsDelta: number = 0;
    fpsCount: number = 0;
    fpsValues: number[] = [];
    curTime: number;
    static readonly fpsAverageCount: number = 5;
    async update(timeStep: number) {
        var currentFps =
            Math.round(
                (1000 / ((this.curTime - this.createTime) / this.fpsCount)) *
                    100
            ) / 100;
        this.upsDelta += timeStep;
        if (this.upsDelta > 1000) {
            this.createTime = this.curTime;
            this.fpsCount = 0;
            this.fpsValues.push(currentFps);
            if (this.fpsValues.length > FpsCounter.fpsAverageCount)
                this.fpsValues = this.fpsValues.filter(
                    (_, i, a) => i > a.length - FpsCounter.fpsAverageCount
                );
            this.upsDelta = 0;
        }
    }
    getAverageFPS() {
        if (this.fpsValues.length > 0)
            return Math.round(
                this.fpsValues.reduce((p, n) => p + n, 0) /
                    this.fpsValues.length
            );
        return 0;
    }

    #firstRender = true;

    async render(ctx: CanvasRenderingContext2D) {
        this.fpsCount++;
        this.fps.text = "FPS: " + this.getAverageFPS();
        if (this.#firstRender) {
            this.#firstRender = false;
            this.fps.moveBy([
                0,
                getTextMeasuresWithFont(this.fps.style.font, this.version.text)
                    .height,
            ]);
        }
        await this.fps.render(ctx);
        await this.version.render(ctx);
    }
}
