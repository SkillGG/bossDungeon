import { Vector2, Vector_2 } from "../../../utils/utils";
import { TriangleBounds } from "../Triangle/TriangleBounds";
import { RectangleBounds } from "./RectangleBounds";

export class RotatedRectangleBounds {
    triangles: [TriangleBounds, TriangleBounds];

    static fromAWHD(a: Vector2, size: Vector2, angle: number) {
        const rad = (angle * Math.PI) / 180;
        const [w, h] = size;
        const sin = Math.sin(rad);
        const cos = Math.cos(rad);
        const b: Vector2 = [a[0] + cos * w, a[1] + sin * w];
        const d: Vector2 = [-sin * h, cos * h];
        const nR = new RotatedRectangleBounds(a, b, d);
        return nR;
    }

    static fromRectangleBounds(r: RectangleBounds, angle: number = 0) {
        return RotatedRectangleBounds.fromAWHD(
            r.getPosition(),
            r.getSize(),
            angle
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
        const nR = RotatedRectangleBounds.fromAWHD(
            [this.ax, this.ay],
            [this.width, this.height],
            deg
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
    constructor(a: Vector2, b: Vector2, delta: Vector2);
    constructor(a: Vector2, b: Vector2, c: Vector2, d: Vector2);
    constructor(a: Vector2, b: Vector2, cOrDelta: Vector2, d?: Vector2) {
        if (d) {
            const c = cOrDelta;
            this.triangles = [
                new TriangleBounds(a, b, c),
                new TriangleBounds(b, c, d),
            ];
        } else {
            const delta = cOrDelta;
            const c: Vector2 = [a[0] + delta[0], a[1] + delta[1]];
            const d: Vector2 = [b[0] + delta[0], b[1] + delta[1]];
            this.triangles = [
                new TriangleBounds(a, b, c),
                new TriangleBounds(b, c, d),
            ];
        }
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
