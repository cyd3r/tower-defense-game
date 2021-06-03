import { GameEngine } from '../engine/GameEngine.js';
import { ChildGameObject, GameObject } from '../engine/GameObject.js';
import { interpolate, interpolateColor } from '../engine/util.js';
import { Vector } from '../engine/Vector.js';
import { ParticleEmitter } from '../Particles.js';

export class SlowdownArea extends GameObject {
    static cost = 10;
    static iconName = 'slowdownArea';
    static name = 'Poison Field';
    static description = `Spray a toxic gas that slows down nearby enemies.
Effective in combination with towers with slow projectiles.
Robots walk faster in a Poison Field.`;
    static range = 2.2 * 64;

    static all = [];

    constructor(position) {
        super(position.x, position.y, 64, 64, 'socket2', 'tower');
        this.radius = SlowdownArea.range;

        SlowdownArea.all.push(this);

        this.areaRenderer = new AreaRenderer(this, this.radius);
        this.turret = new ChildGameObject(this, 0, 0, this.width, this.height, 'turret3', 'tower');
        this.emitter = new ParticleEmitter(this.turret.position, this.turret.forward, {
            color: t => interpolateColor([4, 198, 7, 1], [121, 224, 98, 0], t),
            destination: () => {
                const angle = (Math.random() - .5) * Math.PI / 4;
                return new Vector(this.radius * Math.sin(angle), this.radius * Math.cos(angle));
            },
            radius: t => interpolate(10, 5, t),
            rotationVelocity: () => 3,
            emitFreq: .05,
            particleAge: 1,
        });
    }
    apply(enemy) {
        if (enemy.position.distanceTo(this.position) <= this.radius) {
            return { isSlowedDown: true };
        }
        return undefined;
    }
    update() {
        this.turret.forward = this.turret.forward.rotate(6 * GameEngine.deltaTime);
        this.emitter.center = this.turret.position.add(this.turret.forward.mult(this.turret.height * .5));
        this.emitter.forward = this.turret.forward;
        this.emitter.update();
    }
    destroy() {
        super.destroy();
        SlowdownArea.all = SlowdownArea.all.filter(s => s !== this);
        this.turret.destroy();
        this.areaRenderer.destroy();
        this.emitter.destroy();
    }
    get cost() {
        return SlowdownArea.cost;
    }
}

class AreaRenderer {
    constructor(parent, radius) {
        this.parent = parent;
        
        this.segments = 6;
        this.step = .35 * Math.PI / this.segments;

        this.radius = radius;
        this.radiusJitter = 5;
        this.isDestroyed = false;
        GameEngine.singleton.registerDrawable(this, 'aura');

        this.bootStartTime = GameEngine.timeSinceStartup;
        this.bootTime = .5;
    }
    destroy() {
        this.isDestroyed = true;
    }
    draw(ctx) {
        const end = [145, 206, 123];
        const start = [50, 132, 21];
        const now = GameEngine.timeSinceStartup;

        let baseRadius;
        if (now - this.bootStartTime > this.bootTime) {
            baseRadius = this.radius + Math.sin(now) * this.radiusJitter - .5 * this.radiusJitter;
        } else {
            baseRadius = (now - this.bootStartTime) / this.bootTime * this.radius;
        }

        for (let i = 0; i < this.segments; i += 1) {
            const radius = Math.cos(i * this.step) * baseRadius;
            ctx.beginPath();
            ctx.arc(this.parent.position.x, this.parent.position.y, radius, 0, 2 * Math.PI);
            const t = 1 - (i / (this.segments - 1));
            const color = interpolateColor(start, end, t);
            ctx.fillStyle = `rgba(${color[0]}, ${color[1]}, ${color[2]}, .1)`;
            ctx.fill();
        }
    }
}