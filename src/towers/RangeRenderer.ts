import { Drawable, GameEngine, GameObject } from '../engine';

export class RangeRenderer implements Drawable {
    parent: GameObject;
    outerRange?: number;
    innerRange?: number;
    isDestroyed: boolean;
    show: boolean;

    constructor(parent: GameObject, outerRange: number, innerRange?: number) {
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
    draw(ctx: CanvasRenderingContext2D) {
        if (this.show && this.outerRange && this.outerRange > 0) {
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
