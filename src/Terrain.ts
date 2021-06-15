import { ChildGameObject, GameObject, Vector } from './engine';
import { LevelData } from './levels/levelList';

export class Terrain {
    _levelData: LevelData;
    tiles: GameObject[];
    props: GameObject[];
    route: Vector[];
    planeSpawns: Vector[];
    baseVisual: BaseVisual;
    constructor(levelData: LevelData) {
        const propSize = .75 * this.tileSize;

        this._levelData = levelData;

        this.tiles = levelData.tiles.map(tile => {
            const pos = tile.position.mult(this.tileSize).add(.5 * this.tileSize);
            return new GameObject(
                pos.x, pos.y,
                this.tileSize, this.tileSize,
                tile.type,
                'terrain',
            );
        });

        this.props = levelData.tiles.filter(tile => tile.prop).map(tile => {
            // choose a random position within the tile (the prop is smaller)
            let offset = new Vector(.5 * this.tileSize - .5 * propSize, .5 * this.tileSize - .5 * propSize);
            if (tile.prop !== 'spawnMarker') {
                offset = new Vector(Math.random(), Math.random()).mult(this.tileSize - propSize);
            }
            const pos = tile.position.mult(this.tileSize).add(.5 * propSize).add(offset);
            // place prop on the tile
            return new GameObject(
                pos.x, pos.y,
                propSize, propSize,
                tile.prop!,
                'terrain',
                // random rotation
                tile.prop === 'spawnMarker' ? 0 : Math.random() * Math.PI * 2,
            );
        });

        this.route = levelData.route;
        this.planeSpawns = levelData.planeSpawns;

        // create a base (only visual)
        const goalPos = this.route[this.route.length - 1];
        const realGoalPos = goalPos.mult(this.tileSize).add(.5 * this.tileSize);
        this.baseVisual = new BaseVisual(realGoalPos, this.route[this.route.length - 2].sub(goalPos).norm(), this.tileSize);
    }

    get tileSize() {
        return 64;
    }

    get name() {
        return this._levelData.name;
    }

    getTileAt(position: Vector) {
        const tilePos = position.divide(this.tileSize).floor();
        const tile = this._levelData.tiles.find(tile => tilePos.isEqual(tile.position));

        if (!tile) {
            return null;
        }

        return {
            x: tilePos.x,
            y: tilePos.y,
            tile: tile,
            buildable: !tile.prop && tile.type === 'gras',
        }
    }

    /** Returns the route with an additional offset applied
     * @param offset 0 means no offset. Leave empty for random offset
     */
    getOffsetRoute(offset?: number) {
        if (offset === undefined) {
            offset = Math.random() - .5;
        }

        let offsetRoute = []
        // calculate offset
        const off0 = this.route[1].sub(this.route[0]).flipRight().norm().mult(offset);
        // the route should start outside of the canvas (times 2 to be safe)
        const outside0 = this.route[0].sub(this.route[1]).norm().mult(2);
        offsetRoute.push(this.route[0].add(off0).add(outside0));
        for (let i = 1; i < this.route.length - 1; i += 1) {
            const before = this.route[i - 1];
            const pos = this.route[i];
            const after = this.route[i + 1];

            const offBefore = pos.sub(before).flipRight().norm().mult(offset);
            const offAfter = after.sub(pos).flipRight().norm().mult(offset);
            const off = offBefore.add(offAfter);

            offsetRoute.push(pos.add(off));
        }
        const off1 = this.route[this.route.length - 1].sub(this.route[this.route.length - 2]).flipRight().norm().mult(offset);
        // the route should end outside of the canvas (times 2 to be safe)
        const outside1 = this.route[this.route.length - 1].sub(this.route[this.route.length - 2]).norm().mult(2);
        offsetRoute.push(this.route[this.route.length - 1].add(off1).add(outside1));

        return offsetRoute.map((pos, i) => {
            return pos.mult(this.tileSize).add(.5 * this.tileSize);
        });
    }

    getPlaneRoute() {
        if (this.planeSpawns.length === 0) {
            throw 'No spawn position for planes!';
        }
        const offset = Math.random() - .5;
        const goalPos = this.route[this.route.length - 1];
        const beforeGoalPos = this.route[this.route.length - 2];
        const startPos = this.planeSpawns[0];

        const goal = goalPos.add(goalPos.sub(beforeGoalPos).norm().mult(1));
        const start = startPos.add(startPos.sub(goal).norm().mult(1));

        const normal = goal.sub(start).norm().flipRight().mult(offset);

        return [start, goal].map(pos => pos.add(normal).mult(this.tileSize).add(.5 * this.tileSize));
    }
}

class BaseVisual {
    position: Vector;
    forward: Vector;
    baseParts: ChildGameObject[];
    constructor(position: Vector, forward: Vector, tileSize: number) {
        this.position = position;
        this.forward = forward;

        this.baseParts = [
            new ChildGameObject(this, 0, 0, tileSize, tileSize, 'baseRight', 'tower'),
            new ChildGameObject(this, 0, 0, tileSize, tileSize, 'baseMiddle', 'tower'),
            new ChildGameObject(this, 0, 0, tileSize, tileSize, 'baseMiddle', 'tower'),
            new ChildGameObject(this, 0, 0, tileSize, tileSize, 'baseLeft', 'tower'),
        ];

        this.baseParts.forEach(part => part.forward = forward);

        this.baseParts[0].localPosition = new Vector(-1.5 * tileSize, 0);
        this.baseParts[1].localPosition = new Vector(-0.5 * tileSize, 0);
        this.baseParts[2].localPosition = new Vector(0.5 * tileSize, 0);
        this.baseParts[3].localPosition = new Vector(1.5 * tileSize, 0);
    }
    destroy() {
        this.baseParts.forEach(part => part.destroy());
    }
}
