import { Vector2, Vector_2 } from "../../../utils/utils";
import { TriangleBounds } from "../Triangle/TriangleBounds";
import { RectangleBounds } from "./RectangleBounds";

export class Anchor implements Vector_2 {
    x: number;
    y: number;

    static get center() {
        return new Anchor(0.5, 0.5);
    }

    static get bottomLeft() {
        return new Anchor(0, 1);
    }

    static get bottomRight() {
        return new Anchor(1, 1);
    }

    static get topLeft() {
        return new Anchor(0, 0);
    }

    static get topRight() {
        return new Anchor(1, 0);
    }

    constructor(p1: number, p2: number) {
        this.x = p1;
        this.y = p2;
    }
}

export class RotatedRectangleBounds {
    triangles: [TriangleBounds, TriangleBounds];

    anchor: Anchor = Anchor.topLeft;

    get absAnchor() {
        const rot = ({ x, y }: Vector_2, angle: number) => {
            const sin = Math.sin(angle);
            const cos = Math.cos(angle);
            const ret = [x * cos - y * sin, x * sin + y * cos] as Vector2;
            return ret;
        };

        const r = rot(
            {
                x: this.anchor.x * this.width,
                y: this.anchor.y * this.height,
            },
            (this.angle * Math.PI) / 180
        );

        return [this.a.x + r[0], this.a.y + r[1]] as Vector2;
    }

    static fromAWHDA(a: Vector2, size: Vector2, angle: number, anchor: Anchor) {
        const rads = (Math.PI * angle) / 180;
        const cos = Math.cos(rads);
        const sin = Math.sin(rads);
        const [Ax, Ay] = a;
        const [w, h] = size;
        // change rotation anchor from percentages to real values
        const [Ox, Oy] = [a[0] + anchor.x * w, a[1] + anchor.y * h];
        const applyRotation = ({ x: Nx, y: Ny }: Vector_2) => {
            // translate Ox,Oy to 0,0
            const x = Nx - Ox;
            const y = Ny - Oy;
            // rotate
            const rot = [x * cos - y * sin, x * sin + y * cos] as Vector2;
            // reverse translations
            return [rot[0] + Ox, rot[1] + Oy] as Vector2;
        };
        const normA = { x: Ax, y: Ay };
        const normB = { x: normA.x + w, y: normA.y };
        const normC = { x: normA.x, y: normA.y + h };
        const normD = { x: normA.x + w, y: normA.y + h };
        const rotA = applyRotation(normA);
        const rotB = applyRotation(normB);
        const rotC = applyRotation(normC);
        const rotD = applyRotation(normD);
        return new RotatedRectangleBounds(rotA, rotB, rotC, rotD, anchor);
    }

    static fromRectangleBounds(
        r: RectangleBounds,
        angle: number = 0,
        anchor: Anchor = Anchor.topLeft
    ) {
        return RotatedRectangleBounds.fromAWHDA(
            r.getPosition(),
            r.getSize(),
            angle,
            anchor
        );
    }

    get radAngle() {
        return (this.angle * Math.PI) / 180;
    }

    get width() {
        return Math.round(
            Math.sqrt(
                Math.pow(this.ax - this.bx, 2) + Math.pow(this.ay - this.by, 2)
            )
        );
    }

    get height() {
        return Math.round(
            Math.sqrt(
                Math.pow(this.ax - this.cx, 2) + Math.pow(this.ay - this.cy, 2)
            )
        );
    }

    get angle() {
        var dy = this.by - this.ay;
        var dx = this.bx - this.ax;
        var rads = Math.atan2(dy, dx);
        const signedDegs = (rads * 180) / Math.PI;
        const unsignedDegs = signedDegs < 0 ? 360 + signedDegs : signedDegs;
        return Math.round(unsignedDegs);
    }

    set angle(n: number) {
        this.rotate(n);
    }

    rotate(deg: number) {
        const nR = RotatedRectangleBounds.fromAWHDA(
            [
                this.absAnchor[0] - this.anchor.x * this.width,
                this.absAnchor[1] - this.anchor.y * this.height,
            ],
            [this.width, this.height],
            deg,
            this.anchor
        );
        this.triangles = nR.triangles;
    }

    get bounds() {
        return this.triangles;
    }
    get a() {
        return this.triangles[0].a;
    }
    get b() {
        return this.triangles[0].b;
    }
    get c() {
        return this.triangles[0].c;
    }
    get d() {
        return this.triangles[1].c;
    }
    constructor(a: Vector2, b: Vector2, delta: Vector2, anchor: Anchor);
    constructor(a: Vector2, b: Vector2, c: Vector2, d: Vector2, anchor: Anchor);
    constructor(
        a: Vector2,
        b: Vector2,
        cOrDelta: Vector2,
        dOrAnchor: Vector2 | Anchor,
        anchor?: Anchor
    ) {
        if (anchor && Array.isArray(dOrAnchor)) {
            const c = cOrDelta;
            const d = dOrAnchor;
            this.triangles = [
                new TriangleBounds(a, b, c),
                new TriangleBounds(b, c, d),
            ];
            this.anchor = anchor;
        } else if (dOrAnchor instanceof Anchor) {
            const delta = cOrDelta;
            const c: Vector2 = [a[0] + delta[0], a[1] + delta[1]];
            const d: Vector2 = [b[0] + delta[0], b[1] + delta[1]];
            this.triangles = [
                new TriangleBounds(a, b, c),
                new TriangleBounds(b, c, d),
            ];
            this.anchor = dOrAnchor;
        } else throw new Error("Incorrect constructor!");
    }
    moveBy(pos: Vector_2): void;
    moveBy(pos: Vector2): void;
    moveBy(x: number, y: number): void;
    moveBy(posOrX: Vector2 | Vector_2 | number, y?: number): void {
        if (typeof posOrX === "number" && typeof y === "number") {
            for (const t of this.triangles) t.moveBy(posOrX, y);
        } else if (Array.isArray(posOrX)) {
            const [x, y] = posOrX;
            for (const t of this.triangles) t.moveBy(x, y);
        } else if (typeof posOrX !== "number") {
            const { x, y } = posOrX;
            for (const t of this.triangles) t.moveBy(x, y);
        } else
            throw `Incorrect parameters in moveBy! ${typeof posOrX},${typeof y}`;
    }

    get ax() {
        return this.a.x;
    }

    get ay() {
        return this.a.y;
    }
    get bx() {
        return this.b.x;
    }

    get by() {
        return this.b.y;
    }
    get cx() {
        return this.c.x;
    }

    get cy() {
        return this.c.y;
    }
    get dx() {
        return this.d.x;
    }
    get dy() {
        return this.d.y;
    }

    moveTo(pos: Vector_2): void;
    moveTo(pos: Vector2): void;
    moveTo(x: number, y: number): void;
    moveTo(posOrX: Vector2 | Vector_2 | number, y?: number): void {
        const getDelta = (x: number, y: number): Vector_2 => {
            return {
                x: x - this.a.x,
                y: y - this.a.y,
            };
        };
        if (typeof posOrX === "number" && typeof y === "number") {
            const d = getDelta(posOrX, y);
            for (const t of this.triangles) t.moveBy(d);
        } else if (Array.isArray(posOrX)) {
            const [x, y] = posOrX;
            const d = getDelta(x, y);
            for (const t of this.triangles) t.moveBy(d);
        } else if (typeof posOrX !== "number") {
            const { x, y } = posOrX;
            const d = getDelta(x, y);
            for (const t of this.triangles) t.moveBy(d);
        } else
            throw `Incorrect parameters in moveTo! ${typeof posOrX},${typeof y}`;
    }
    getRectangleBounds() {
        const minX = Math.min(this.ax, this.bx, this.cx, this.dx);
        const maxX = Math.max(this.ax, this.bx, this.cx, this.dx);
        const minY = Math.min(this.ay, this.by, this.cy, this.dy);
        const maxY = Math.max(this.ay, this.by, this.cy, this.dy);
        return new RectangleBounds(minX, minY, maxX - minX, maxY - minY);
    }
}
