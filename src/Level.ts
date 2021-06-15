import { Vector } from './engine';
import { LevelData } from './levels/levelList';
import { createHintElements } from './levels/parser';
import { Terrain } from './Terrain.js';
import { TowerGrid } from './towers/TowerGrid.js';
import { Wallet } from './Wallet.js';
import { Wave } from './Wave.js';

export class Level {
    terrain: Terrain;
    wave: Wave;
    towerGrid: TowerGrid;
    wallet: Wallet;
    constructor(level: LevelData) {
        this.terrain = new Terrain(level);
        this.wave = new Wave(this.terrain, level.wave);
        this.towerGrid = new TowerGrid(this.terrain.tileSize);
        this.wallet = new Wallet(document.querySelector('.towers')!, document.querySelector('.my-coins')!);

        document.body.classList.add('ingame');

        if (level.hints) {
            const hintsBox = document.querySelector('.hints .content')!;
            createHintElements(level.hints).forEach(elt => hintsBox.appendChild(elt));
        }
        document.querySelector('.hints-container')!.classList.toggle('hidden', !level.hints);
    }
    get name() {
        return this.terrain.name;
    }

    click(position: Vector) {
        const currentTile = this.terrain.getTileAt(position);
        const existingTower = this.towerGrid.getTowerAt(position);
        if(this.wallet.towerToBuild) {
            if (currentTile?.buildable && !existingTower) {
                this.towerGrid.buildTower(this.wallet.towerToBuild, position);
                this.wallet.buySelected();
                // start the wave
                if (this.wave.startTime === undefined) {
                    this.wave.start();
                }
            }
        } else if (this.wallet.demolishTower) {
            if (existingTower) {
                // get half of the buy price back
                this.wallet.coins += existingTower.cost * .5;
                this.towerGrid.demolishTower(existingTower);
                // exit demolish mode
                this.wallet.demolishTower = false;
            }
        } else {
            if (existingTower && existingTower.click) {
                existingTower.click();
            }
        }
    }
}