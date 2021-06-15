import { Enemy } from './Enemy.js';
import { Drawable, GameEngine } from './engine';

const SHOW_TIME = 3;
const OUTER_DIST = 200;
const INNER_DIST = 50;

export class Healthbar implements Drawable {
    private parent: Enemy;
    private yOffset: number;
    isDestroyed: boolean;
    private lastChangeTime: number;
    private lastHitpoints: number;

    constructor(parent: Enemy, yOffset: number) {
        this.parent = parent;
        this.yOffset = yOffset;
        this.isDestroyed = false;
        GameEngine.singleton.registerDrawable(this, 'healthbar');

        this.lastChangeTime = 0;
        this.lastHitpoints = 0;
    }
    destroy() {
        this.isDestroyed = true;
    }
    draw(ctx: CanvasRenderingContext2D) {
        // only show healthbar if the value changed recently or the cursor is close
        const now = GameEngine.timeSinceStartup;
        if (this.lastHitpoints !== this.parent.hitpoints) {
            this.lastHitpoints = this.parent.hitpoints;
            this.lastChangeTime = now;
        }

        const cursorDistance = GameEngine.singleton.cursorPosition.distanceTo(this.parent.position);
        const showBlocking = now - this.lastChangeTime <= SHOW_TIME || cursorDistance <= INNER_DIST;
        const showTransparent = !showBlocking && cursorDistance <= OUTER_DIST;

        if (showBlocking || showTransparent) {
            const height = 5;
            const pixelsPerHP = 1;
            const y = this.parent.position.y - this.yOffset - height;
            const maxWidth = this.parent.maxHitpoints * pixelsPerHP;
            const width = Math.max(0, this.parent.hitpoints) * pixelsPerHP;
            const x = this.parent.position.x - maxWidth / 2;

            let opacity = 1;
            if (showTransparent && cursorDistance > INNER_DIST) {
                opacity = (OUTER_DIST - cursorDistance) / (OUTER_DIST - INNER_DIST);
            }
            // damage
            ctx.fillStyle = `rgb(228, 26, 28, ${opacity})`;
            ctx.fillRect(x, y, maxWidth, height);
            // remaining hitpoints
            ctx.fillStyle = `rgb(77, 175, 74, ${opacity})`;
            ctx.fillRect(x, y, width, height);
        }
    }
}