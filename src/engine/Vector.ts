export interface XY {
    x: number;
    y: number;
}

export class Vector implements XY {
    x: number;
    y: number;
    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
    }

    get magnitude() {
        return Math.sqrt(this.x * this.x + this.y * this.y);
    }

    isEqual(other: XY) {
        return this.x === other.x && this.y === other.y;
    }
    /** Add vector or scalar */
    add(other: number | XY) {
        if (typeof(other) === 'number') {
            return new Vector(this.x + other, this.y + other);
        } else {
            return new Vector(this.x + other.x, this.y + other.y);
        }
    }
    /** Calculate `this - other` */
    sub(other: XY) {
        return new Vector(this.x - other.x, this.y - other.y);
    }
    /** Multiply with scalar: `scalar * this` */
    mult(scalar: number) {
        return new Vector(scalar * this.x, scalar * this.y);
    }
    /** Divide by scalar: `(1 / scalar) * this` */
    divide(scalar: number) {
        return new Vector(this.x / scalar, this.y / scalar);
    }
    norm() {
        const magnitude = this.magnitude;
        return new Vector(this.x / magnitude, this.y / magnitude);
    }
    /** `(x, y)` -> `(-y, x)` */
    flipRight() {
        return new Vector(-this.y, this.x);
    }
    distanceTo(to: XY) {
        return this.sub(to).magnitude;
    }
    /** Dot product between `this` and `other`
     */
    dot(other: XY) {
        return this.x * other.x + this.y * other.y;
    }

    rotate(angle: number) {
        const c = Math.cos(angle);
        const s = Math.sin(angle);
        return new Vector(
            this.x * c - this.y * s,
            this.x * s + this.y * c,
        )
    }
    toRotation() {
        return Math.atan2(this.y, this.x);
    }
    static fromRotation(rotation: number) {
        return new Vector(Math.cos(rotation), Math.sin(rotation));
    }
    static angleBetween(a: Vector, b: Vector) {
        let cos = (a.x * b.x + a.y * b.y) / (a.magnitude * b.magnitude);
        // sometimes, the acos seems to get numbers that are outside the [-1,1] range (due to rounding errors)
        // in this case, clip the values
        if (cos <= -1) {
            return Math.PI;
        } else if (cos >= 1) {
            return 0;
        }
        return Math.acos(cos);
    }

    relativeTo(orientation: XY) {
        // TODO: did I confuse left and right?
        return new Vector(
            this.x * orientation.y + this.y * orientation.x,
            this.y * orientation.y - this.x * orientation.x,
        );
    }
    inCoordSystem(yAxis: XY) {
        return new Vector(
            this.x * yAxis.y - this.y * yAxis.x,
            this.x * yAxis.x + this.y * yAxis.y,
        );
    }
    static randomFromEllipse(a: number, b: number) {
        const angle = Math.random() * 2 * Math.PI;
        return new Vector(Math.cos(angle) * a, Math.sin(angle) * b);
    }

    floor() {
        return new Vector(Math.floor(this.x), Math.floor(this.y));
    }
}
