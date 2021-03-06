import { GameEngine } from './GameEngine';
import { TileName, tilesheet, TilesheetEntry } from './tilesheet';
import { Vector, XY } from './Vector';

export interface Drawable {
    isDestroyed: boolean;
    draw: (ctx: CanvasRenderingContext2D, tilesheet: CanvasImageSource) => void;
}

export class GameObject implements Drawable {
    width: number;
    height: number;
    tileData: TilesheetEntry;
    isDestroyed: boolean;

    private _forward: Vector;
    private _position: Vector;

    /** Creates a new GameObject
     * @param x x position of center on canvas
     * @param y y position of center on canvas
     * @param width Width on canvas
     * @param height Height on canvas
     * @param tileName Name of the tile as specified in `tilesheet.js`.
     * This is then used to get the image onto the canvas.
     * @param rotation (optional) initial rotation
     */
    constructor(x: number, y: number, width: number, height: number, tileName: TileName, drawLayer: string, rotation?: number) {
        this.width = width;
        this.height = height;

        this._position = new Vector(x, y);
        if (rotation === undefined) {
            this._forward = new Vector(1, 0);
        } else {
            this._forward = Vector.fromRotation(rotation);
        }

        this.tileData = tilesheet[tileName];
       
        if (!this.tileData) {
            throw `${tileName} is not registered`;
        }

        this.isDestroyed = false;
        GameEngine.singleton!.registerDrawable(this, drawLayer);
    }

    /** @deprecated Use `position` instead */
    get x() { return this.position.x; }
    /** @deprecated Use `position` instead */
    set x(value) { this.position.x = value; }
    /** @deprecated Use `position` instead */
    get y() { return this.position.y; }
    /** @deprecated Use `position` instead */
    set y(value) { this.position.y = value; }
    
    setTileData(tileName: TileName){ this.tileData = tilesheet[tileName]}

    get position() { return this._position; }
    set position(value) { this._position = value; }
    get forward() {
        return this._forward;
    }
    set forward(value) {
        // the forward vector only represents a direction
        // the magnitude should not matter, therefore normalize
        this._forward = value.norm();
    }

    /** Moves the object respecting the current rotation
     * @param forwards Distance to move along the look direction
     * @param sidewards Distance to move to the right of the look direction
    */
     move(forwards: number, sidewards: number) {
        this.position = this.position.add(new Vector(-sidewards, forwards).relativeTo(this.forward));
    }

    /** Makes the object look at the given coordinates
     * @param target Position on the canvas as Vector
     * @param deltaRotation The maximum rotation allowed (in radians)
     * @param _compat Don't use this parameter. Only exists for backwards compatibility
    */
    lookAt(target: Vector, deltaRotation: number) {
        this.forward = this.forward.norm();
        const targetForward = target.sub(this.position).norm();

        if (deltaRotation === undefined || Vector.angleBetween(this.forward, targetForward) <= deltaRotation) {
            this.forward = targetForward;
        } else {
            const turnDir = Math.sign(this.forward.x * targetForward.y - this.forward.y * targetForward.x) || 1;
            this.forward = new Vector(
                this.forward.x * Math.cos(deltaRotation) - turnDir * this.forward.y * Math.sin(deltaRotation),
                this.forward.y * Math.cos(deltaRotation) + turnDir * this.forward.x * Math.sin(deltaRotation)
            );
        }
    }

    destroy() {
        this.isDestroyed = true;
    }
    draw(ctx: CanvasRenderingContext2D, tilesheetImg: CanvasImageSource) {
        // https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/rotate#rotating_a_shape_around_its_center
        ctx.translate(this.position.x, this.position.y);
        ctx.rotate(this.forward.toRotation() + this.tileData.rotation);
        ctx.drawImage(
            tilesheetImg,
            this.tileData.x, this.tileData.y, this.tileData.width, this.tileData.height,
            -this.width / 2, -this.height / 2, this.width, this.height
        );
        // reset transformation
        ctx.setTransform(1, 0, 0, 1, 0, 0);
    }

    getCollisionBox() {
        return [
            this.position.add(new Vector(-this.width / 2, this.height / 2).relativeTo(this.forward)),
            this.position.add(new Vector(this.width / 2, this.height / 2).relativeTo(this.forward)),
            this.position.add(new Vector(this.width / 2, -this.height / 2).relativeTo(this.forward)),
            this.position.add(new Vector(-this.width / 2, -this.height / 2).relativeTo(this.forward)),
        ];
    }

    collidesWith(other: { getCollisionBox: () => Vector[] }) {
        return rectanglesIntersect(this.getCollisionBox(), other.getCollisionBox());
    }

    unrotatedBoxContains(point: XY) {
        const { x, y } = point;
        return x > this.position.x - .5 * this.width && x < this.position.x + .5 * this.width && y > this.position.y - .5 * this.height && y < this.position.y + .5 * this.height;
    }
}

export interface GameObjectLike {
    position: Vector;
    forward: Vector;
}

/** Like `GameObject` but follows a parent `GameObject`'s position and rotation */
export class ChildGameObject extends GameObject {
    localPosition: Vector;
    localForward: Vector;
    parent?: GameObjectLike;
    constructor(parent: GameObjectLike, x: number, y: number, width: number, height: number, tileName: TileName, drawLayer: string, rotation?: number) {
        super(x, y, width, height, tileName, drawLayer, rotation);
        this.localPosition = this.position;
        this.localForward = this.forward;
        this.parent = parent;
    }
    get position() {
        if (this.parent) {
            return this.parent.position.add(this.localPosition.relativeTo(this.parent.forward));
        }
        return this.localPosition;
    }
    set position(value) {
        if (this.parent) {
            this.localPosition = value.sub(this.parent.position).inCoordSystem(this.parent.forward);
        } else {
            this.localPosition = value;
        }
    }
    get forward() {
        if (this.parent) {
            return this.localForward.relativeTo(this.parent.forward);
        }
        return this.localForward;
    }
    set forward(value) {
        if (this.parent) {
            this.localForward = value.inCoordSystem(this.parent.forward);
        } else {
            this.localForward = value;
        }
    }
    /** Detach from parent, turning this child into a normal GameObject */
    detach() {
        this.localPosition = this.position;
        this.localForward = this.forward;
        this.parent = undefined;
    }
}

/** Checks if to rectangles `a` and `b` intersect. The rectangles are given as a list of the 4 corners
 */
 function rectanglesIntersect (a: Vector[], b: Vector[]) {
    // simplified version of https://stackoverflow.com/a/12414951
    for (let polygon of [a, b]) {
        // for each polygon, look at each edge of the polygon, and determine if it separates
        // the two shapes
        const normal1 = polygon[1].sub(polygon[0]);
        const normal2 = normal1.flipRight();
        for (let normal of [normal1, normal2]) {
            let minA = normal.dot(a[0]);
            let maxA = minA;
            // for each vertex in the first shape, project it onto the line perpendicular to the edge
            // and keep track of the min and max of these values
            for (let j = 1; j < a.length; j++) {
                const projected = normal.dot(a[j]);
                minA = Math.min(minA, projected);
                maxA = Math.max(maxA, projected);
            }

            // for each vertex in the second shape, project it onto the line perpendicular to the edge
            // and keep track of the min and max of these values
            let minB = normal.dot(b[0]);
            let maxB = minB;
            for (let j = 1; j < b.length; j++) {
                const projected = normal.dot(b[j]);
                minB = Math.min(minB, projected);
                maxB = Math.max(maxB, projected);
            }

            // if there is no overlap between the projects, the edge we are looking at separates the two
            // polygons, and we know there is no overlap
            if (maxA < minB || maxB < minA) {
                return false;
            }
        }
    }
    return true;
};
