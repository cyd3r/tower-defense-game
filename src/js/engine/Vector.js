export class Vector {
    constructor(x, y) {
        if (y === undefined) {
            this.x = x.x;
            this.y = x.y;
        } else {
            this.x = x;
            this.y = y;
        }
    }

    get magnitude() {
        return Math.sqrt(this.x * this.x + this.y * this.y);
    }

    isEqual(other) {
        return this.x === other.x && this.y === other.y;
    }
    /** Add vector or scalar */
    add(other) {
        if (other.hasOwnProperty('x')) {
            return new Vector(this.x + other.x, this.y + other.y);
        } else {
            return new Vector(this.x + other, this.y + other);
        }
    }
    /** Calculate `this - other` */
    sub(other) {
        return new Vector(this.x - other.x, this.y - other.y);
    }
    /** Multiply with scalar: `scalar * this` */
    mult(scalar) {
        return new Vector(scalar * this.x, scalar * this.y);
    }
    /** Divide by scalar: `(1 / scalar) * this` */
    divide(scalar) {
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
    distanceTo(to) {
        return this.sub(to).magnitude;
    }
    /** Dot product between `this` and `other`
     * @param {Vector} other
     */
    dot(other) {
        return this.x * other.x + this.y * other.y;
    }

    rotate(angle) {
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
    static fromRotation(rotation) {
        return new Vector(Math.cos(rotation), Math.sin(rotation));
    }
    static angleBetween(a, b) {
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

    /** @param {Vector} orientation */
    relativeTo(orientation) {
        // TODO: did I confuse left and right?
        return new Vector(
            this.x * orientation.y + this.y * orientation.x,
            this.y * orientation.y - this.x * orientation.x,
        );
    }
    /** @param {Vector} yAxis */
    inCoordSystem(yAxis) {
        return new Vector(
            this.x * yAxis.y - this.y * yAxis.x,
            this.x * yAxis.x + this.y * yAxis.y,
        );
    }
    static randomFromEllipse(a, b) {
        const angle = Math.random() * 2 * Math.PI;
        return new Vector(Math.cos(angle) * a, Math.sin(angle) * b);
    }

    floor() {
        return new Vector(Math.floor(this.x), Math.floor(this.y));
    }
}
