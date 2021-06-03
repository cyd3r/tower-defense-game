import { GameObject } from '../engine/GameObject.js';
import { Vector } from '../engine/Vector.js';
import { RangeRenderer } from './RangeRenderer.js';

export class TowerGrid {
    constructor(tileSize) {
        this.tileSize = tileSize;
        this.tiles = [];

        this.previewTile = new PreviewTile(tileSize);
    }
    buildTower(TowerType, position) {
        const x = Math.floor(position.x / this.tileSize);
        const y = Math.floor(position.y / this.tileSize);
        const placePos = new Vector(x * this.tileSize + .5 * this.tileSize, y * this.tileSize + .5 * this.tileSize);
        this.tiles.push({ x, y, tower: new TowerType(placePos) });
    }
    demolishTower(tower) {
        this.tiles = this.tiles.filter(t => t.tower !== tower);
        tower.destroy();
    }
    getTowerAt(position) {
        const tileX = Math.floor(position.x / this.tileSize);
        const tileY = Math.floor(position.y / this.tileSize);
        const tile = this.tiles.find(tile => tile.x === tileX && tile.y === tileY);
        return tile?.tower;
    }
    update(enemies) {
        this.tiles.forEach(tile => tile.tower.update(enemies));
    }
    previewTower(position, active, terrainTile, outerRange, innerRange) {
        if (active) {
            this.previewTile.position = position.divide(this.tileSize).floor().mult(this.tileSize).add(.5 * this.tileSize);
            const buildable = terrainTile?.buildable && !this.getTowerAt(position);
            this.previewTile.setTileData(buildable ? 'buildable' : 'notBuildable');
            this.previewTile.rangeRenderer.outerRange = outerRange;
            this.previewTile.rangeRenderer.innerRange = innerRange;
        }
        this.previewTile.isActive = active;
    }
}

class PreviewTile extends GameObject {
    constructor(tileSize) {
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
    draw(ctx, tilesheet) {
        if (this.isActive) {
            super.draw(ctx, tilesheet);
        }
    }
}