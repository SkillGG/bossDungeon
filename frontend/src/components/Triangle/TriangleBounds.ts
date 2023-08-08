import { Vector2, Vector_2 } from "../../utils/utils";
import { RectangleBounds } from "../Primitives/Rectangle/RectangleBounds";

export class TriangleBounds {
    static get zero() {
        return new TriangleBounds(0, 0, 0, 0, 0, 0);
    }

    a: Vector_2;
    b: Vector_2;
    c: Vector_2;

    constructor(copy: TriangleBounds);
    constructor(a: Vector_2, b: Vector_2, c: Vector_2);
    constructor(a: Vector2, b: Vector2, c: Vector2);
    constructor(
        x1: number,
        y1: number,
        x2: number,
        y2: number,
        x3: number,
        y3: number
    );
    constructor(
        x1: TriangleBounds | number | Vector_2 | Vector2,
        y1?: number | Vector_2 | Vector2,
        x2?: number | Vector_2 | Vector2,
        y2?: number,
        x3?: number,
        y3?: number
    ) {
        if (typeof x1 === "object" && x1 instanceof TriangleBounds) {
            this.a = { ...x1.a };
            this.b = { ...x1.b };
            this.c = { ...x1.c };
        } else if (
            typeof x1 === "object" &&
            !Array.isArray(x1) &&
            !(x1 instanceof TriangleBounds) &&
            typeof y1 === "object" &&
            !Array.isArray(y1) &&
            typeof x2 === "object" &&
            !Array.isArray(x2)
        ) {
            this.a = { ...x1 };
            this.b = { ...y1 };
            this.c = { ...x2 };
        } else if (
            Array.isArray(x1) &&
            Array.isArray(x2) &&
            Array.isArray(y1)
        ) {
            this.a = { x: x1[0], y: x1[1] };
            this.b = { x: y1[0], y: y1[1] };
            this.c = { x: x2[0], y: x2[1] };
        } else if (
            typeof x1 === "number" &&
            typeof y1 === "number" &&
            typeof x2 === "number" &&
            typeof y2 === "number" &&
            typeof x3 === "number" &&
            typeof y3 === "number"
        ) {
            this.a = { x: x1, y: y1 };
            this.b = { x: x2, y: y2 };
            this.c = { x: x3, y: y3 };
        } else throw "Illegal constructor!";
    }

    toRectBounds(): RectangleBounds {
        const x = Math.min(this.a.x, this.b.x, this.c.x);
        const y = Math.min(this.a.y, this.b.y, this.c.y);
        const w = Math.max(this.a.x, this.b.x, this.c.x) - x;
        const h = Math.max(this.a.y, this.b.y, this.c.y) - y;
        return new RectangleBounds(x, y, w, h);
    }

    hasPoint(p: Vector_2) {
        const { a, b, c } = this;

        const sign = (p1: Vector_2, p2: Vector_2, p3: Vector_2) => {
            return (
                (p1.x - p3.x) * (p2.y - p3.y) - (p2.x - p3.x) * (p1.y - p3.y)
            );
        };

        const d1 = sign(p, a, b);
        const d2 = sign(p, b, c);
        const d3 = sign(p, c, a);

        const has_neg = d1 < 0 || d2 < 0 || d3 < 0;
        const has_pos = d1 > 0 || d2 > 0 || d3 > 0;

        return !(has_neg && has_pos);
    }

    moveTo(v: Vector_2) {
        throw new Error("Triangle.moveTo not implemented yet!");
    }

    moveBy(pos: Vector_2): void;
    moveBy(pos: Vector2): void;
    moveBy(x: number, y: number): void;
    moveBy(posOrX: Vector2 | Vector_2 | number, y?: number): void {
        if (typeof posOrX === "number" && typeof y === "number") {
            this.a.x += posOrX;
            this.a.y += y;
            this.b.x += posOrX;
            this.b.y += y;
            this.c.x += posOrX;
            this.c.y += y;
        } else if (Array.isArray(posOrX)) {
            const [x, y] = posOrX;
            this.a.x += x;
            this.a.y += y;
            this.b.x += x;
            this.b.y += y;
            this.c.x += x;
            this.c.y += y;
        } else if (typeof posOrX !== "number") {
            this.a.x += posOrX.x;
            this.a.y += posOrX.y;
            this.b.x += posOrX.x;
            this.b.y += posOrX.y;
            this.c.x += posOrX.x;
            this.c.y += posOrX.y;
        } else
            throw `Incorrect parameters in moveBy! ${typeof posOrX},${typeof y}`;
    }
}
