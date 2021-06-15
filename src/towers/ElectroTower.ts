import { implementsTowerStatic, Tower } from '.';
import { Enemy, Environment } from '../Enemy';
import { GameEngine, ChildGameObject, GameObject, Vector } from '../engine';
import { RangeRenderer } from './RangeRenderer';

const MAX_DISTANCE = 64 * 4;
const DAMAGE = 10;

@implementsTowerStatic()
export class ElectroTower extends GameObject implements Tower {
    static cost = 50;
    static iconName = 'electroTower';
    static displayName = 'Tesla Tower';
    static description = `Generates electric barriers between other Tesla Towers.
Planes are not affected.`;
    static range = MAX_DISTANCE;

    static all: ElectroTower[] = [];
    static barriers: ElectricBarrier[] = [];
    rangeRenderer: RangeRenderer;
    pole: ChildGameObject;

    static rebuildBarriers() {
        ElectroTower.barriers.forEach(b => b.destroy());
        ElectroTower.barriers = [];
        // all this trouble below is because we don't want to have overlapping electric connectors
        for (let i0 = 0; i0 < ElectroTower.all.length; i0 += 1) {
            const origin = ElectroTower.all[i0];
            for (let i1 = i0 + 1; i1 < ElectroTower.all.length; i1 += 1) {
                const other = ElectroTower.all[i1];
                const connector = other.position.sub(origin.position);
                if (connector.magnitude > MAX_DISTANCE) {
                    continue;
                }
                // is there a shorter alternative in that direction
                let betterConnectionExists = false;
                for (let i2 = 0; i2 < ElectroTower.all.length; i2 += 1) {
                    if (i2 !== i1 && i2 !== i0) {
                        const otherAlt = ElectroTower.all[i2];
                        const connAlt = otherAlt.position.sub(origin.position);
                        if (connector.norm().isEqual(connAlt.norm()) && connAlt.magnitude < connector.magnitude) {
                            betterConnectionExists = true;
                            break;
                        }
                    }
                }
                if (!betterConnectionExists) {
                    ElectroTower.barriers.push(new ElectricBarrier(origin.position, other.position, 30, DAMAGE));
                }
            }
        }
    }

    static build(position: Vector) { return new ElectroTower(position); }

    constructor(position: Vector) {
        super(position.x, position.y, 64, 64, 'socket2', 'tower');

        ElectroTower.all.push(this);
        ElectroTower.rebuildBarriers();

        this.pole = new ChildGameObject(this, 0, 0, this.width / 3, this.height / 3, 'projectileBronze', 'tower');
        this.rangeRenderer = new RangeRenderer(this, MAX_DISTANCE);
    }
    update() {
        this.rangeRenderer.show = this.unrotatedBoxContains(GameEngine.singleton.cursorPosition);
    }
    destroy() {
        super.destroy();
        this.pole.destroy();
        ElectroTower.all = ElectroTower.all.filter(t => t !== this);
        ElectroTower.rebuildBarriers();
        this.rangeRenderer.destroy();
    }
    get cost() {
        return ElectroTower.cost;
    }
}

class ElectricBarrier implements Environment {
    from: Vector;
    to: Vector;
    breadth: number;
    segments: Vector[];
    normal: Vector;
    collBox: Vector[];
    damage: number;
    isDestroyed: boolean;

    constructor(from: Vector, to: Vector, breadth: number, damage: number) {
        this.from = from;
        this.to = to;
        this.breadth = breadth;

        // split section into smaller sections
        this.segments = [];
        const points = Math.round(from.distanceTo(to) / breadth);
        for (let i = 1; i < points; i += 1) {
            const point = from.add(to.sub(from).mult(i / points));
            this.segments.push(point);
        }

        this.normal = this.to.sub(this.from).flipRight().norm();
        this.collBox = [
            this.from.add(this.normal.mult(.25 * this.breadth)),
            this.from.add(this.normal.mult(-.25 * this.breadth)),
            this.to.add(this.normal.mult(-.25 * this.breadth)),
            this.to.add(this.normal.mult(.25 * this.breadth)),
        ];

        this.damage = damage;
        this.isDestroyed = false;
        GameEngine.singleton.registerDrawable(this, 'aura');
    }
    getCollisionBox() {
        return this.collBox;
    }
    apply(enemy: Enemy) {
        if (!enemy.ignoreElectro && enemy.collidesWith(this)) {
            return { isElectrocuted: true };
        }
        return undefined;
    }
    destroy() {
        this.isDestroyed = true;
    }
    draw(ctx: CanvasRenderingContext2D) {
        ctx.beginPath();
        ctx.moveTo(this.from.x, this.from.y);

        this.segments.forEach(point => {
            point = point.add(this.normal.mult(Math.random() * this.breadth - this.breadth / 2))
            ctx.lineTo(point.x, point.y);
        });
        ctx.lineTo(this.to.x, this.to.y);

        const origLineWidth = ctx.lineWidth;
        const origStrokeStyle = ctx.strokeStyle;
        const origShadowBlur = ctx.shadowBlur;
        const origShadowColor = ctx.shadowColor;
        ctx.lineWidth = 3;
        // ctx.strokeStyle = `rgba(255, 255, 255, ${1})`;
        ctx.strokeStyle = 'hsl(180, 80%, 80%)';
        ctx.shadowBlur = 30;
        ctx.shadowColor = "#bd9df2";
        ctx.stroke();
        ctx.closePath();

        ctx.lineWidth = origLineWidth;
        ctx.strokeStyle = origStrokeStyle;
        ctx.shadowBlur = origShadowBlur;
        ctx.shadowColor = origShadowColor;
    }
}
