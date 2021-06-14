import { GameEngine } from '../engine/GameEngine.js';
import { GameObject } from '../engine/GameObject.js';

export class RangeRenderer {
    /** @param {GameObject} parent */
    constructor(parent, outerRange, innerRange) {
        this.parent = parent;
        this.outerRange = outerRange;
        this.innerRange = innerRange;
        this.isDestroyed = false;
        this.show = false;
        GameEngine.singleton.registerDrawable(this, 'ui');
    }
    destroy() {
        this.isDestroyed = true;
    }
    draw(ctx) {
        if (this.show && this.outerRange > 0) {
            if (this.innerRange) {
                ctx.beginPath();
                ctx.arc(this.parent.position.x, this.parent.position.y, this.outerRange, 0, 2 * Math.PI, false);
                ctx.arc(this.parent.position.x, this.parent.position.y, this.innerRange, 0, 2 * Math.PI, true);
                ctx.fillStyle = 'rgba(20, 200, 180, .3)';
                ctx.fill();
                
                ctx.beginPath();
                ctx.arc(this.parent.position.x, this.parent.position.y, this.innerRange, 0, 2 * Math.PI);
                ctx.fillStyle = 'rgba(160, 20, 20, .3)';
                ctx.fill();
            } else {
                ctx.beginPath();
                ctx.arc(this.parent.position.x, this.parent.position.y, this.outerRange, 0, 2 * Math.PI);
                ctx.fillStyle = 'rgba(20, 200, 180, .3)';
                ctx.fill();
            }
        }
    }
}
