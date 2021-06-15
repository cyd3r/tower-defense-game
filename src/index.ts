import { BufferLoader, GameEngine, Vector } from './engine';
import { Menu } from './Menu.js';
import { ParticleEmitter } from './Particles.js';
import { SoldierRagdoll } from './Enemy.js';
import { Projectile } from './Projectile.js';
import { Level } from './Level.js';

// enable back button after history.pushState
// https://stackoverflow.com/a/66104582
window.addEventListener('popstate', () => {
    window.location.href = location.href;
});

const LIFES = 3;
document.querySelector('.play-again')!.addEventListener('click', () => location.reload());
document.querySelector('.back-to-map')!.addEventListener('click', () => location.search = '');
document.querySelector('.open-map')!.addEventListener('click', () => location.search = '');

class GameLogic {
    private engine: GameEngine;
    private bufferLoader: BufferLoader;
    private state: 'menu' | 'level' | 'gameover';
    private menu: Menu
    private level?: Level

    constructor() {
        const screen = document.querySelector<HTMLCanvasElement>('#screen')!;
        const tilesheet = document.querySelector<HTMLImageElement>('#tilesheet')!;
        this.engine = new GameEngine(screen, tilesheet,
            this.update.bind(this), this.click.bind(this),
            // this is the order in which the gameobjects are drawn
            ['terrain', 'enemy', 'tower', 'plane', 'particles', 'projectile', 'aura', 'healthbar', 'ui']);

        this.bufferLoader = new BufferLoader();
        this.bufferLoader.loadAll().catch(console.error);

        this.state = 'menu';
        this.menu = new Menu();

        // URL points to a level?
        const params = new URLSearchParams(location.search);
        const levelIndex = params.get('level');
        if (levelIndex) {
            this.loadLevel(parseInt(levelIndex));
        } else {
            this.level = undefined;
            document.querySelector<HTMLElement>('.logo')!.innerText = 'Tower Defense';
        }
    }

    start() {
        this.engine.gameLoop();
    }

    loadLevel(levelIndex: number) {
        if (levelIndex >= 0 && levelIndex < this.menu.levelList.length) {
            const level = this.menu.loadLevel(levelIndex);
            if (level) {
                this.level = level;
                this.state = 'level';
                document.querySelector('.towers')!.classList.remove('hidden');
                document.querySelector<HTMLElement>('.logo')!.innerText = `Level ${levelIndex + 1}: ${this.level.name}`;
            }
        }
    }

    /** Triggered when the user clicks on the canvas. */
    click(position: Vector) {
        switch(this.state){
            case 'menu':
                const levelIndex = this.menu.hoveredLevelIndex;
                this.loadLevel(levelIndex);
                break;
            case 'level':
                this.level?.click(position);
                break;
        }
    }

    update() {
        this.level?.wave.update();
        this.level?.towerGrid.update(this.level.wave.enemies);
        if (this.state === 'level') {
            const overlay = document.querySelector('.overlay')!;
            const gameoverText = overlay.querySelector<HTMLElement>('.gameover-text')!;
            if (this.level!.wave.reachedBaseCount >= LIFES) {
                this.state = 'gameover';
                overlay.classList.remove('hidden');
                BufferLoader.play('gameOverLost');
                BufferLoader.stopAtmo();
                gameoverText.innerText = 'You failed to defend the base';
            } else if (this.level!.wave.isDefeated) {
                this.state = 'gameover';
                overlay.classList.remove('hidden');
                BufferLoader.play('gameOverVictory');
                BufferLoader.stopAtmo();
                gameoverText.innerText = 'Base secured!';
            }

            this.level!.towerGrid.previewTower(
                GameEngine.singleton.cursorPosition,
                !!this.level!.wallet.towerToBuild,
                this.level!.terrain.getTileAt(GameEngine.singleton.cursorPosition)?.buildable ?? false,
                this.level!.wallet.towerToBuild?.range,
                this.level!.wallet.towerToBuild?.innerRange,
            );
        }
        if (this.level) {
            Projectile.updateAll(this.level.wave.enemies);
        }
        if (this.state === 'menu') {
            this.menu.update();
        }
        ParticleEmitter.updateAll();
        SoldierRagdoll.updateAll();
    }
}



const game = new GameLogic();
(window as any).game = game;
game.start();
