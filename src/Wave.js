import { createEnemy, PRESETS } from './Enemy.js';
import { BufferLoader } from './engine/BufferLoader.js';
import { GameEngine } from './engine/GameEngine.js';
import { ElectroTower } from './towers/ElectroTower.js';
import { SlowdownArea } from './towers/SlowdownArea.js';

export class Wave {
    /** @type {Wave} */
    static singleton = undefined;
    constructor(terrain, waveData) {
        this.terrain = terrain;
        this.enemies = [];
        this.startTime = undefined;

        this.waiting = waveData.reduce((wave, enemy) => {
            if (wave.length > 0) {
                // convert relative times to absolute times
                enemy.when += wave[wave.length - 1].when;
            }
            return [...wave, enemy];
        }, []);

        this.totalHitpoints = waveData.reduce((hitpoints, enemy) => hitpoints + PRESETS[enemy.what].hitpoints, 0);
        this.aliveHitpoints = 0;
        this.waitingHitpoints = 0;

        this.reachedBaseCount = 0;

        this.hearts = document.querySelectorAll('.lives img');
        this.updateHearts();

        this.waveProgressBar = document.querySelector('.wave-progress');
        this.isDestroyed = false;
        GameEngine.singleton.registerDrawable(this, 'ui');
        Wave.singleton = this;
    }
    start() {
        this.startTime = GameEngine.timeSinceStartup;
        BufferLoader.play('waveStarted');
    }
    /** Wether the wave of enemies was successfully defended by the player */
    get isDefeated() {
        return this.enemies.length === 0 && this.waiting.length === 0;
    }
    updateHearts() {
        for (let i = 0; i < 3; i += 1) {
            if (2 - i < this.reachedBaseCount) {
                this.hearts[i].src = 'static/images/platformer-pack-redux/hudHeart_empty.png';
            } else {
                this.hearts[i].src = 'static/images/platformer-pack-redux/hudHeart_full.png';
            }
        }
    }
    update() {
        if (this.startTime !== undefined && this.waiting.length > 0 && GameEngine.timeSinceStartup - this.startTime > this.waiting[0].when) {
            const enemyType = this.waiting.splice(0, 1)[0].what;
            this.enemies.push(createEnemy(enemyType, this.terrain));
        }

        this.enemies = this.enemies.filter(enemy => {
            if (enemy.reachedBase) {
                this.reachedBaseCount += 1;
                this.updateHearts();
            }
            return !enemy.isDestroyed;
        });

        const environments = [...SlowdownArea.all, ...ElectroTower.barriers];
        this.enemies.forEach(enemy => enemy.update(environments));
    }
    draw(ctx, tilesheet) {
        const waitingHitpoints = this.waiting.reduce((hitpoints, enemy) => hitpoints + PRESETS[enemy.what].hitpoints, 0);

        const stop = (this.totalHitpoints - waitingHitpoints) / this.totalHitpoints * 100;

        // https://codepen.io/oldminer/pen/VrqXBo'
        this.waveProgressBar.style.background = `linear-gradient(to right, green 0%, green ${stop}%, gray ${stop}%, gray 100%)`;
        return true;
    }
}
