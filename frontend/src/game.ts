
import { InputManager } from "./components/KeyboardManager";
import { ObjectManager } from "./components/ObjectManager";
import { GameState } from "./main";
import {
    Renderable,
    Updateable,
    Vector2,
    denormalizeVector2RelativeToElement,
    normalizeVector2RelativeToElement,
} from "./utils/utils";

export class Game<T extends string>
    extends HTMLCanvasElement
    implements Updateable, Renderable
{
    static readonly VERSION = "alpha 0.0";

    static readonly desiredFPS = 60;

    canvasContext: CanvasRenderingContext2D;
    running: boolean = false;
    manager: ObjectManager<T>;
    static readonly WIDTH = 1200;
    static readonly HEIGHT = 800;
    readonly gameHeight: number = Game.HEIGHT;
    readonly gameWidth: number = Game.WIDTH;

    static input: InputManager = new InputManager();

    static get instance(): Game<any> {
        if (Game._instance) return Game._instance;
        else throw "Game has not been created yet";
    }

    private static _instance: Game<any> | null = null;

    static getRelativeVector(v: Vector2): Vector2 {
        return Game.instance.getRelativeVector(v);
    }

    static getNormalVector(v: Vector2): Vector2 {
        return Game.instance.getNormalVector(v);
    }

    static getWidth() {
        return this._instance?.width || Game.WIDTH;
    }
    static getHeight() {
        return this._instance?.height || Game.HEIGHT;
    }
    static getSize(): Vector2 {
        return [Game.getWidth(), Game.getHeight()];
    }

    constructor(
        defaultState: T
    ) {
        super();
        const cC = this.getContext("2d");
        this.manager = new ObjectManager<T>(this, defaultState);
        if (!cC) {
            this.canvasContext = new CanvasRenderingContext2D();
            this.stop();
            return;
        }
        this.id = "board";
        this.canvasContext = cC;
        this.width = this.gameWidth;
        this.height = this.gameHeight;
        Game._instance = this;
    }
    getComputedStyle() {
        return window.getComputedStyle(this);
    }
    getRelativeVector(v: Vector2): Vector2 {
        return normalizeVector2RelativeToElement(this, v);
    }
    getNormalVector(v: Vector2): Vector2 {
        return denormalizeVector2RelativeToElement(this, v);
    }
    run() {
        this.running = true;
    }
    stop() {
        this.running = false;
    }
    async update(timeStep: number) {
        await this.manager.update(timeStep);
        await Game.input.update();
    }
    async render() {
        this.canvasContext.clearRect(0, 0, this.width, this.height);
        await this.manager.render(this.canvasContext);
    }
}
customElements.define("game-", Game, { extends: "canvas" });
declare global {
    interface Window {
        game: Game<GameState>;
        Game: typeof Game;
    }
}
window.Game = Game;
