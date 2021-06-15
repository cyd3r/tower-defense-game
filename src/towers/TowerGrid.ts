import { Tower, TowerStatic, TowerType } from '.';
import { Enemy } from '../Enemy';
import { GameObject, Vector } from '../engine';
import { RangeRenderer } from './RangeRenderer';

interface TowerCell {
    x: number;
    y: number;
    tower: Tower;
}

export class TowerGrid {
    private tileSize: number;
    private tiles: TowerCell[];
    private previewTile: PreviewTile;

    constructor(tileSize: number) {
        this.tileSize = tileSize;
        this.tiles = [];

        this.previewTile = new PreviewTile(tileSize);
    }
    buildTower(towerStatic: TowerStatic, position: Vector) {
        const x = Math.floor(position.x / this.tileSize);
        const y = Math.floor(position.y / this.tileSize);
        const placePos = new Vector(x * this.tileSize + .5 * this.tileSize, y * this.tileSize + .5 * this.tileSize);
        this.tiles.push({ x, y, tower: towerStatic.build(placePos) });
    }
    demolishTower(tower: Tower) {
        this.tiles = this.tiles.filter(t => t.tower !== tower);
        tower.destroy();
    }
    getTowerAt(position: Vector) {
        const tileX = Math.floor(position.x / this.tileSize);
        const tileY = Math.floor(position.y / this.tileSize);
        const tile = this.tiles.find(tile => tile.x === tileX && tile.y === tileY);
        return tile?.tower;
    }
    update(enemies: Enemy[]) {
        this.tiles.forEach(tile => tile.tower.update(enemies));
    }
    previewTower(position: Vector, active: boolean, buildable: boolean, outerRange?: number, innerRange?: number) {
        if (active) {
            this.previewTile.position = position.divide(this.tileSize).floor().mult(this.tileSize).add(.5 * this.tileSize);
            buildable = buildable && !this.getTowerAt(position);
            this.previewTile.setTileData(buildable ? 'buildable' : 'notBuildable');
            this.previewTile.rangeRenderer.outerRange = outerRange;
            this.previewTile.rangeRenderer.innerRange = innerRange;
        }
        this.previewTile.isActive = active;
    }
}

class PreviewTile extends GameObject {
    _isActive: boolean;
    rangeRenderer: RangeRenderer;
    constructor(tileSize: number) {
        super(0, 0, tileSize, tileSize, 'notBuildable', 'ui');
        this._isActive = false;
        this.rangeRenderer = new RangeRenderer(this, 0);
    }
    get isActive() {
        return this._isActive;
    }
    set isActive(value) {
        this._isActive = value;
        this.rangeRenderer.show = value;
    }
    draw(ctx: CanvasRenderingContext2D, tilesheet: CanvasImageSource) {
        if (this.isActive) {
            super.draw(ctx, tilesheet);
        }
    }
}