// #region Math

import {
    endTimerShape,
    playerIDShape,
    roomDataShape,
    terminateTimerShape,
    timerShape,
} from "../../../shared/events";

export type Vector2 = [number, number];
export type Vector3 = [number, number, number];
export type Vector4 = [number, number, number, number];
export type Vector_2 = { x: number; y: number };
export type Vector_3 = { x: number; y: number; z: number };
export type Vector_4 = { x: number; y: number; z: number; w: number };

export const crossProduct = ([Ax, Ay, Az]: Vector3, [Bx, By, Bz]: Vector3) => [
    Ay * Bz - Az * By,
    Az * Bx - Ax * Bz,
    Ax * By - Ay * Bx,
];
export const dotProduct = ([Ax, Ay]: Vector2, [Bx, By]: Vector2): number =>
    Ax * Bx - Ay * By;

export const crossProduct2D = (p1: Vector2, p2: Vector2): number => {
    const cP = crossProduct([...p1, 0], [...p2, 0])[2];
    return cP || 0;
};

export const lerp = (v0: number, v1: number, t: number) =>
    (1 - t) * v0 + t * v1;

export const lerpPos = (pos1: Vector2, pos2: Vector2, t: number) => {
    const [x1, y1] = pos1;
    const [x2, y2] = pos2;
    return [lerp(x1, x2, t), lerp(y1, y2, t)] as Vector2;
};

export const normalizeVector2RelativeToElement = (
    elem: HTMLElement,
    v: Vector2
): Vector2 => [v[0] + elem.offsetLeft, v[1] + elem.offsetTop];

export const denormalizeVector2RelativeToElement = (
    elem: HTMLElement,
    v: Vector2
): Vector2 => [v[0] - elem.offsetLeft, v[1] - elem.offsetTop];

export const randomInt = (min: number, max: number) => {
    return Math.floor(Math.random() * (max - min + 1) + min);
};

export const getRandomWeightedNumber = <T>(weights: [number, T][]): T => {
    const weightSum = weights.reduce((p, n) => p + n[0], 0);

    const rand = Math.random() * weightSum;

    let sum = 0;

    for (const [weight, value] of weights) {
        sum += weight;
        if (rand <= sum) return value;
    }
    const wNum = weights[weights.length - 1];
    if (wNum) return wNum[1];
    else throw "Item with id" + (weights.length - 1) + " not found!";
};

// #endregion Math

// #region DOM

type PropList = Record<string, string>;
type ChildArray = HTMLElement[];

export const $$ = (
    name: string = "div",
    props: PropList = {},
    children: ChildArray = [],
    innerHTML: string = ""
): HTMLElement => {
    if (!name) name = "div";
    const nameRX = /^(.*?)((?:\.|#).*)*$/.exec(name);
    if (nameRX && nameRX[1] !== undefined) {
        name = nameRX[1] || "div";
        const specifier = nameRX[2];
        const classes: string[] = [];
        const classRX = /\.(.*?)(?=\.|#|$)/g;
        let foundClass: RegExpExecArray | null;
        if (specifier)
            while ((foundClass = classRX.exec(specifier))) {
                if (foundClass[1]) classes.push(foundClass[1]);
            }
        let id: string = "";
        const idRX = /\#(.*?)(?=\.|#|$)/g;
        let foundID: RegExpExecArray | null;
        if (specifier)
            while ((foundID = idRX.exec(specifier))) {
                if (foundID[1]) id = foundID[1];
            }
        props.id = props.id || id;
        props["class"] =
            (props["class"] ? props["class"] + " " : "") + classes.join(" ");
        if (!props["class"]) delete props["class"];
        if (!props.id) delete props.id;
    }
    const element = document.createElement(name);
    Object.entries(props || []).forEach((prop) => {
        element.setAttribute(prop[0], prop[1]);
    });
    element.innerHTML = innerHTML;
    children?.forEach((ch) => element.append(ch));
    return element;
};

export const $ =
    <T extends HTMLElement>(
        strings: TemplateStringsArray,
        ...params: string[]
    ) =>
    ({
        props: p,
        children: c,
        _html: h,
    }: { props?: PropList; children?: ChildArray; _html?: string } = {}) =>
        $$(
            strings.reduce((p, n, i) => {
                return `${p}${n}${params[i] || ""}`;
            }, ""),
            p,
            c,
            h
        ) as T;

export const getHTMLBoxes = (s: string[]) => {
    return s.map((q) => document.querySelector(q));
};

export class CleanableCanvas extends OffscreenCanvas {
    clearCanvas(w?: number, h?: number) {
        if (w) this.width = w;
        if (h) this.height = h;
        const ctx = this.getContext("2d");
        ctx?.clearRect(0, 0, this.width, this.height);
    }
}

export const getTextMeasures = (
    ctx: CanvasRenderingContext2D,
    text: string
) => {
    const measures = ctx.measureText(text);
    return {
        width: measures.actualBoundingBoxRight - measures.actualBoundingBoxLeft,
        height:
            measures.actualBoundingBoxAscent +
            measures.actualBoundingBoxDescent,
        ascent: measures.actualBoundingBoxAscent,
        descent: measures.actualBoundingBoxDescent,
    };
};

export const getTextMeasuresWithFont = (font: string, text: string) => {
    const { ctx } = createNewCanvas();
    ctx.font = font;
    return getTextMeasures(ctx, text);
};

// #endregion DOM

// #region Images

type ColorData = [number, number, number, number];

const colorCache: Record<string, ColorData | null> = {};

const memoColor = (
    factory: (ctx: CanvasRenderingContext2D, c?: string) => ColorData | null,
    ctx: CanvasRenderingContext2D
) => {
    return function (color?: string) {
        if (!color) return null;
        if (!(color in colorCache)) {
            colorCache[color] = factory(ctx, color);
        }
        const colorFromCache = colorCache[color];
        if (!colorFromCache) throw "There is no color" + color + "in cache!";
        return colorFromCache;
    };
};

export const colorToRGBA: (color?: string) => ColorData | null = (function (): (
    c?: string
) => ColorData | null {
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = 1;
    const ctx = canvas.getContext("2d");
    if (!ctx) return () => null;
    return memoColor((x, c) => {
        if (!c) return null;
        x.clearRect(0, 0, 1, 1);
        x.fillStyle = "#000";
        x.fillStyle = c;
        var computed = x.fillStyle;
        x.fillStyle = "#fff";
        x.fillStyle = c;
        if (computed !== x.fillStyle) {
            return null; // invalid color
        }
        x.fillRect(0, 0, 1, 1);
        return [...x.getImageData(0, 0, 1, 1).data] as ColorData;
    }, ctx);
})();

export const colorOrFallbackColorToRGBA = (
    color: string,
    fallbackColor: string
) => {
    // Don't short-circuit getting the fallback RGBA -
    // it's already memoized, and we want to show an error
    // if the fallback color is invalid even if the main color is valid
    const fallbackRGBA = colorToRGBA(fallbackColor);
    if (!fallbackRGBA) {
        throw new Error(
            `Invalid fallbackColor ${
                fallbackColor != null
                    ? JSON.stringify(fallbackColor)
                    : fallbackColor
            }`
        );
    }
    return colorToRGBA(color) || fallbackRGBA;
};

export const colorDataToString = (d: ColorData | null) => {
    if (!d) return null;
    if (d.find((n) => n > 255 || n < 0)) return "#0000";
    else
        return (
            `#` + d.reduce((p, n) => p + n.toString(16).padStart(2, "0"), "")
        );
};

export const imageDataToImage = async (d: ImageData) => {
    return await createImageBitmap(d);
};

export const loadImg = (
    src: string | HTMLImageElement
): Promise<HTMLImageElement> =>
    new Promise((res, rej) => {
        let img: HTMLImageElement;
        if (typeof src === "string") {
            img = new Image();
            img.src = src;
        } else img = src;

        img.onload = () => res(img);
        img.onerror = (e) => rej(e);
    });

export const createNewCanvas = () => {
    const can = $<HTMLCanvasElement>`canvas`();
    const ctx = can.getContext("2d");
    if (!ctx) throw "Canvas context couldn't be created!";
    return { e: can, ctx } as const;
};

// #endregion Images

// #region Game interfaces

export interface Updateable {
    update: (time: number) => Promise<void>;
}
export interface Renderable {
    render: (ctx: CanvasRenderingContext2D) => Promise<void>;
}
export interface Hideable {
    hide(): void;
    show(): void;
}
export interface Movable {
    moveBy(v: Vector2): void;
    moveTo(v: Vector2): void;
}

export interface Styled<T extends object> {
    style: T;
    initStyles: T;
    clearStyles(): void;
}

// #endregion Game interfaces

// #region

export const noop: (...a: any[]) => any = () => {};
export const asyncNoop: (...a: any[]) => Promise<any> = async () => {};

//#endregion

type Listener<T extends any[]> = (...args: T) => void;

export class EventEmitter<EventMap extends Record<string, any[]>> {
    private listeners: { [K in keyof EventMap]?: Set<Listener<EventMap[K]>> } =
        {};
    protected prefix: string | null = null;

    removeListeners<T extends keyof EventMap & string>(id: T) {
        const listeners = this.listeners[id] ?? new Set();
        listeners.clear();
        if (this.prefix)
            console.log(`removing ${id} listeners in ${this.prefix}`);
    }
    on<T extends keyof EventMap & string>(
        id: T,
        listener: (...data: EventMap[T]) => void
    ) {
        const listeners = this.listeners[id] ?? new Set();
        listeners.add(listener);
        this.listeners[id] = listeners;
        if (this.prefix) console.log(`adding on ${id} to ${this.prefix}`);
    }
    once<T extends keyof EventMap & string>(
        id: T,
        listener: (...data: EventMap[T]) => void
    ) {
        const listeners = this.listeners[id] ?? new Set();
        const wrapper = (...data: EventMap[T]) => {
            listeners.delete(wrapper);
            listener(...data);
        };
        listeners.add(wrapper);
        this.listeners[id] = listeners;
        if (this.prefix) console.log(`adding once ${id} in ${this.prefix}`);
    }
    emit<T extends keyof EventMap & string>(id: T, ...data: EventMap[T]) {
        const listeners = this.listeners[id] ?? new Set();
        for (const list of listeners) {
            list(...data);
        }
        if (this.prefix)
            console.log(`got emitted ${id} in ${this.prefix} with ${data}`);
    }
    removeAllEventListeners() {
        this.listeners = {};
    }
    static emitToAll<T extends Record<string, any[]>>(
        arr: EventEmitter<T>[],
        except: (ev: EventEmitter<T>) => boolean = () => true
    ) {
        return <K extends keyof T & string>(id: K, ...data: T[K]) => {
            arr.filter((e) => except(e)).forEach((em) => {
                em.emit(id, ...data);
            });
        };
    }
}

export class TypedEventSource<
    T extends Record<string, readonly any[]>
> extends EventSource {
    debug = false;
    on<K extends keyof T>(
        type: K & string,
        parser: (s: string) => T[K] | null,
        fn: (...d: T[K]) => void
    ) {
        if (this.debug) console.log("adding ES listener", type);
        this.addEventListener(type, (ev: MessageEvent<string>) => {
            if (this.debug) console.log("Got event", type, "with", ev);
            const d = parser(ev.data);
            if (d) fn(...d);
        });
    }
}
export namespace DataParsers {
    export const parseRoomData = <K>(s: string) => {
        const data = roomDataShape.safeParse(JSON.parse(s));
        if (data.success) {
            return [data.data] as K;
        } else {
            throw data.error;
        }
    };
    export const usernameParser = <K>(s: string) => {
        const data = playerIDShape.safeParse(JSON.parse(s));
        if (data.success) {
            return [data.data] as K;
        } else {
            console.error(data.error);
            return null;
        }
    };
    export const counterParser = <K>(s: string) => {
        const data = timerShape.safeParse(JSON.parse(s));
        if (data.success) return [data.data] as K;
        else {
            console.error(data.error);
            return null;
        }
    };
    export const terminateTimerParser = <K>(s: string) => {
        const data = terminateTimerShape.safeParse(JSON.parse(s));
        if (data.success) return [data.data] as K;
        else {
            console.error(data.error);
            return null;
        }
    };
    export const dataCounterParser = <K>(s: string) => {
        const data = endTimerShape.safeParse(JSON.parse(s));
        if (data.success) return [data.data] as K;
        else {
            console.error(data.error);
            return null;
        }
    };
    export const noop = <K>() => {
        return [] as K;
    };
}
