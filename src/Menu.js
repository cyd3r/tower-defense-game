import { BufferLoader } from './engine/BufferLoader.js';
import { GameEngine } from './engine/GameEngine.js';
import { GameObject } from './engine/GameObject.js';
import { Vector } from './engine/Vector.js';
import { Level } from './Level.js';
import { levelList } from './levels/levelList.js';
import { Wallet } from './Wallet.js';

class HighlightableGameObject extends GameObject {
    constructor(position, width, height, tileName, drawLayer) {
        super(position.x, position.y, width, height, tileName, drawLayer);
        this.highlighted = false;
    }
    draw(ctx, tilesheet) {
        if (this.highlighted) {
            ctx.filter = 'brightness(150%)';
        }
        super.draw(ctx, tilesheet);
        ctx.filter = 'none';
    }
}

class TwoFloorBuilding {
    /**
     * @param {'castle' | 'tower'} buildingType
     * @param {Vector} position
     */
    constructor(buildingType, position, tileSize) {
        const topPos = position.sub({ x: 0, y: 1 }).mult(tileSize);
        const bottomPos = position.mult(tileSize);
        this.topPart = new HighlightableGameObject(topPos, tileSize, tileSize, `${buildingType}Top`, 'terrain');
        this.bottomPart = new HighlightableGameObject(bottomPos, tileSize, tileSize, `${buildingType}Bottom`, 'terrain');
    }
    update() {
        // is this building highlighted?
        const top = this.bottomPart.position.y - 1.5 * this.bottomPart.height;
        const left = this.bottomPart.position.x - .5 * this.bottomPart.width;
        const right = this.bottomPart.position.x + .5 * this.bottomPart.width;
        const bottom = this.bottomPart.position.y + .5 * this.bottomPart.height;

        const { x, y } = GameEngine.singleton.cursorPosition;
        this.highlighted = (y > top && y < bottom && x > left && x < right);
    }
    set highlighted(value) {
        this.bottomPart.highlighted = value;
        this.topPart.highlighted = value;
    }
    get highlighted() {
        return this.bottomPart.highlighted;
    }
    destroy() {
        this.topPart.destroy();
        this.bottomPart.destroy();
    }
}

export class Menu {
    constructor() {
        const canvasSizeX = Math.ceil(GameEngine.width / this.tileSize);
        const canvasSizeY = Math.ceil(GameEngine.height / this.tileSize);

        const tiles = [];

        for (let y = 0; y < canvasSizeY; y++){
            for (let x = 0; x < canvasSizeX; x++){
                const type = Math.round(Math.random()) === 0 ? 'menuGras1' : 'menuGras2';
                tiles.push({ position: new Vector(x, y), type: type,});
            }
        }

        tiles.push(
            //path
            { position: new Vector(1, 0), type: "pathNS"},
            { position: new Vector(1, 1), type: "pathNES"},
            { position: new Vector(1, 2), type: "pathEndS"},
            { position: new Vector(2, 1), type: "pathWE"},
            { position: new Vector(3, 1), type: "pathWE"},
            { position: new Vector(4, 1), type: "pathWS"},
            { position: new Vector(4, 2), type: "pathNS"},
            { position: new Vector(4, 3), type: "pathNS"},
            { position: new Vector(4, 4), type: "pathNS"},
            { position: new Vector(4, 5), type: "pathNWS"},
            { position: new Vector(3, 5), type: "pathEndW"},
            { position: new Vector(4, 6), type: "pathNES"},
            { position: new Vector(4, 7), type: "pathNS"},
            { position: new Vector(4, 8), type: "pathNS"},
            { position: new Vector(4, 9), type: "pathWN"},
            { position: new Vector(3, 9), type: "pathWE"},
            { position: new Vector(2, 9), type: "pathWE"},
            { position: new Vector(1, 9), type: "pathWE"},
            { position: new Vector(0, 9), type: "pathNE"},
            { position: new Vector(0, 8), type: "pathEndN"},
            { position: new Vector(5, 6), type: "pathWE"},
            { position: new Vector(6, 6), type: "pathWS"},
            { position: new Vector(6, 7), type: "pathNES"},
            { position: new Vector(6, 8), type: "pathEndS"},
            { position: new Vector(7, 7), type: "pathWE"},
            { position: new Vector(8, 7), type: "pathWE"},
            { position: new Vector(9, 7), type: "pathWE"},
            { position: new Vector(10, 7), type: "pathWE"},
            { position: new Vector(11, 7), type: "pathWE"},
            { position: new Vector(12, 7), type: "pathWN"},
            { position: new Vector(12, 6), type: "pathNS"},
            { position: new Vector(12, 5), type: "pathNWS"},
            { position: new Vector(11, 5), type: "pathEndW"},
            { position: new Vector(12, 4), type: "pathNS"},
            { position: new Vector(12, 3), type: "pathWS"},
            { position: new Vector(11, 3), type: "pathWE"},
            { position: new Vector(10, 3), type: "pathWNE"},
            { position: new Vector(10, 2), type: "pathNS"},
            { position: new Vector(10, 1), type: "pathNS"},
            { position: new Vector(10, 0), type: "pathSE"},
            { position: new Vector(11, 0), type: "pathWE"},
            { position: new Vector(12, 0), type: "pathEndE"},
            { position: new Vector(9, 3), type: "pathWE"},
            { position: new Vector(8, 3), type: "pathWSE"},
            { position: new Vector(8, 4), type: "pathEndS"},
            { position: new Vector(7, 3), type: "pathNE"},
            { position: new Vector(7, 2), type: "pathNS"},
            { position: new Vector(7, 1), type: "pathEndN"},

            //forest
            { position: new Vector(0, 0), type: "conifer4"},
            { position: new Vector(0, 1), type: "conifer4"},
            { position: new Vector(0, 2), type: "conifer3"},
            { position: new Vector(0, 3), type: "conifer2"},
            { position: new Vector(0, 5), type: "conifer3"},
            { position: new Vector(0, 6), type: "conifer4"},
            { position: new Vector(1, 6), type: "conifer2"},
            { position: new Vector(1, 7), type: "conifer4"},
            { position: new Vector(1, 8), type: "conifer4"},
            { position: new Vector(2, 0), type: "conifer1"},
            { position: new Vector(2, 2), type: "conifer4"},
            { position: new Vector(2, 5), type: "conifer4"},
            { position: new Vector(2, 7), type: "conifer3"},
            { position: new Vector(2, 8), type: "conifer4"},
            { position: new Vector(3, 0), type: "conifer3"},
            { position: new Vector(3, 8), type: "conifer1"},
            { position: new Vector(4, 0), type: "conifer4"},
            { position: new Vector(5, 0), type: "conifer4"},
            { position: new Vector(5, 1), type: "conifer4"},
            { position: new Vector(5, 7), type: "conifer4"},
            { position: new Vector(6, 0), type: "conifer4"},
            { position: new Vector(6, 1), type: "conifer4"},
            { position: new Vector(8, 0), type: "conifer3"},
            { position: new Vector(8, 1), type: "conifer1"},
            { position: new Vector(9, 0), type: "conifer2"},
            { position: new Vector(9, 5), type: "conifer1"},
            { position: new Vector(9, 9), type: "conifer3"},
            { position: new Vector(10, 9), type: "conifer4"},
            { position: new Vector(11, 2), type: "conifer4"},
            { position: new Vector(11, 8), type: "conifer3"},
            { position: new Vector(11, 9), type: "conifer4"},
            { position: new Vector(12, 2), type: "conifer4"},
            { position: new Vector(12, 8), type: "conifer4"},
            { position: new Vector(12, 9), type: "conifer4"},

            //stones
            { position: new Vector(0, 4), type: "stone3"},
            { position: new Vector(3, 7), type: "stone2"},
            //{ position: new Vector(7, 0), type: "stone4"},
            { position: new Vector(7, 4), type: "stone3"},
            //{ position: new Vector(9, 2), type: "stone2"},
            { position: new Vector(10, 8), type: "stone2"},
            //{ position: new Vector(12, 1), type: "stone4"},

            //buildings
            { position: new Vector(7, 6), type: "house2"},
            { position: new Vector(8, 2), type: "house1"},
            { position: new Vector(3, 2), type: "house3"},
            { position: new Vector(11, 6), type: "house4"},
            { position: new Vector(5, 2), type: "windmillTop"},
            { position: new Vector(5, 3), type: "windmillBottom"},
            { position: new Vector(9, 1), type: "windmillTop"},
            { position: new Vector(9, 2), type: "windmillBottom"},
            { position: new Vector(8, 8), type: "windmillTop"},
            { position: new Vector(8, 9), type: "windmillBottom"},
            { position: new Vector(5, 4), type: "field1"},
            { position: new Vector(6, 3), type: "field2"},
            { position: new Vector(5, 5), type: "field2"},
            { position: new Vector(9, 8), type: "field1"},
            { position: new Vector(10, 6), type: "field2"},
        );

        this.tiles = tiles.map(tile => {
            const pos = tile.position.mult(this.tileSize).add(.5 * this.tileSize);
            return new GameObject(
                pos.x, pos.y,
                this.tileSize, this.tileSize,
                tile.type,
                'terrain',
            );
        });

        this.castles = [
            { x: 1.5, y: 3.5, type: 'castle' },
            { x: 3.5, y: 5.2, type: 'tower' },
            { x: 0.5, y: 8.2, type: 'tower' },
            { x: 6.5, y: 9.5, type: 'castle' },
            { x: 11.5, y: 5.2, type: 'tower' },
            { x: 12.5, y: 1.5, type: 'castle' },
            { x: 8.5, y: 5.5, type: 'castle' },
            { x: 7.5, y: 1.2, type: 'tower' },
        ].map(data => new TwoFloorBuilding(data.type, new Vector(data.x, data.y), this.tileSize));

        this.windmill1 = new GameObject(5.5*this.tileSize, 3*this.tileSize, this.tileSize, this.tileSize, "windmillSail", 'terrain', 1);
        this.windmill2 = new GameObject(9.5*this.tileSize, 2*this.tileSize, this.tileSize, this.tileSize, "windmillSail", 'terrain', 2);
        this.windmill3 = new GameObject(8.5*this.tileSize, 9*this.tileSize, this.tileSize, this.tileSize, "windmillSail", 'terrain', 3);
        this.levelList = levelList;

        this._hoveredLevelIndex = -1;
    }

    get hoveredLevelIndex() {
        return this._hoveredLevelIndex;
    }
    set hoveredLevelIndex(value) {
        if (this._hoveredLevelIndex !== value) {
            this._hoveredLevelIndex = value;
            if (value === -1) {
                document.querySelector('.logo').innerText = 'Tower Defense';
            } else {
                document.querySelector('.logo').innerText = `Level ${value + 1}: ${this.levelList[value].name}`;
            }
        }
    }

    destroy() {
        this.tiles.forEach(tile => tile.destroy());
        this.windmill1.destroy();
        this.windmill2.destroy();
        this.windmill3.destroy();
        this.castles.forEach(building => building.destroy());
    }

    update() {
        this.windmill1.forward = this.windmill1.forward.rotate(-1.5 * GameEngine.deltaTime);
        this.windmill2.forward = this.windmill2.forward.rotate(-1.5 * GameEngine.deltaTime);
        this.windmill3.forward = this.windmill2.forward.rotate(-1.5 * GameEngine.deltaTime);

        this.castles.forEach(building => building.update());
        this.hoveredLevelIndex = this.castles.findIndex(building => building.highlighted);
    }

    get tileSize() {
        return 64;
    }

    loadLevel(levelIndex) {
        if (levelIndex !== -1) {
            const level = this.levelList[levelIndex];
            history.pushState(`?level=${levelIndex}`, level.name, `?level=${levelIndex}`)
            this.level = new Level(level);
            // stop drawing the tiles
            this.destroy();
            return this.level;
        }
    }
}