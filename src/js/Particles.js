import { GameEngine } from './engine/GameEngine.js';
import { GameObject } from './engine/GameObject.js';
import { Vector } from './engine/Vector.js';
import { Wave } from './Wave.js';

class Pentagon {
    constructor(center, getRadius, getColor, destination, rotationVelocity, maxAge) {
        this.orig = center;
        this.center = center;
        this.destination = destination;
        this.rotationVelocity = rotationVelocity;
        this.rotation = Math.random() * Math.PI;
        this.getRadius = getRadius;
        this.getColor = getColor;
        this.maxAge = maxAge;
        this.createdAt = GameEngine.timeSinceStartup;

        this.color = this.getColor(0);
        this.radius = this.getRadius(0);
    }
    update() {
        const t = (GameEngine.timeSinceStartup - this.createdAt) / this.maxAge;
        this.center = this.orig.add(this.destination.mult(t));
        this.rotation += this.rotationVelocity * GameEngine.deltaTime;

        this.radius = this.getRadius(t);
        this.color = this.getColor(t);
    }
    draw(ctx) {
        const color = `rgba(${this.color.join(',')})`;
        const delta = 2 * Math.PI / 5;
    
        ctx.beginPath();
        const startCorner = this.center.add(new Vector(Math.cos(this.rotation), Math.sin(this.rotation)).mult(this.radius));
        ctx.moveTo(startCorner.x, startCorner.y);
    
        for (let i = 0; i < 5; i++) {
            const cornerAngle = i * delta + this.rotation;
            const corner = this.center.add(new Vector(Math.cos(cornerAngle), Math.sin(cornerAngle)).mult(this.radius));
            ctx.lineTo(corner.x, corner.y);
        }
    
        ctx.fillStyle = color;
        ctx.fill();
    }
}

export class ParticleEmitter {
    static all = [];
    static updateAll() {
        const now = GameEngine.timeSinceStartup;
        ParticleEmitter.all = ParticleEmitter.all.filter(emitter => {
            if (emitter.maxAge && now - emitter.createdAt > emitter.maxAge) {
                return false;
            }
            emitter.update();
            return true;
        });
    }
    /** Creates a new `ParticleEmitter` and registers it so that `update` can be called automatically.
     * This is useful if the caller will be destroyed soon and cannot call update in the future (e.g. for exploding stuff).
    */
    static create(center, forward, config) {
        const emitter = new ParticleEmitter(center, forward, config);
        this.all.push(emitter);
        return emitter;
    }

    /** @param {GameObject} parent */
    constructor(center, forward, config) {
        this.pentagons = [];
        this.lastEmitTime = 0;
        this.createdAt = GameEngine.timeSinceStartup;
        this.center = center;
        this.counter = 0;
        this.forward = forward;
        
        this.maxAge = config.maxAge;
        this.numParticles = config.numParticles;

        this.getColor = config.color;
        this.getRadius = config.radius;
        this.getDestination = config.destination;
        this.getRotationVelocity = config.rotationVelocity;

        this.emitFreq = config.emitFreq;
        this.particleAge = config.particleAge;
        
        this.isDestroyed = false;
        GameEngine.singleton.registerDrawable(this, 'particles');
    }
    destroy() {
        this.isDestroyed = true;
        ParticleEmitter.all = ParticleEmitter.all.filter(emitter => emitter !== this);
    }
    update() {
        if (this.isDestroyed) {
            return;
        }
        const now = GameEngine.timeSinceStartup;
        if (this.maxAge && now - this.createdAt > this.maxAge) {
            this.destroy();
            return;
        }

        const moreParticles = !this.numParticles || this.counter < this.numParticles;
        if (moreParticles && now - this.lastEmitTime > this.emitFreq) {
            this.counter += 1;
            this.lastEmitTime = now;
            const destination = this.getDestination().relativeTo(this.forward);
            this.pentagons.push(new Pentagon(this.center, this.getRadius, this.getColor, destination, this.getRotationVelocity(), this.particleAge));
        }
        this.pentagons = this.pentagons.filter(p => {
            if (now - p.createdAt > p.maxAge) {
                return false;
            }
            p.update();
            return true;
        });
    }
    draw(ctx) {
        this.pentagons.forEach(p => p.draw(ctx));
    }
}

export class HealingArea {
    /** @param {GameObject} parent */
    constructor(parent, radius, hitpointsPerSecond) {
        this.parent = parent;
        this.radius = radius;
        this.hitpointsPerSecond = hitpointsPerSecond;
        this.isDestroyed = false;
        GameEngine.singleton.registerDrawable(this, 'aura');
    }
    update(deltaTime) {
        Wave.singleton.enemies.forEach(enemy => {
            if (enemy !== this.parent && this.parent.position.distanceTo(enemy.position) <= this.radius) {
                enemy.hitpoints += this.hitpointsPerSecond * deltaTime;
            }
        });
    }
    destroy() {
        this.isDestroyed = true;
    }
    /** @param {CanvasRenderingContext2D} ctx */
    draw(ctx) {
        const now = GameEngine.timeSinceStartup * 1000;
        const drawRadius = (now % 1000) / 1000 * this.radius;
        const alpha = .8*(1- (now % 1000) / 1000);
        // const drawRadius = (.5 + .5 * Math.cos(now / 1000)) * this.radius;
        ctx.beginPath();
        ctx.arc(this.parent.position.x, this.parent.position.y, drawRadius, 0, 2 * Math.PI);
        // ctx.fillStyle = `rgba(255, 0, 0, ${alpha})`;
        ctx.fillStyle = `rgba(185, 67, 239, ${alpha})`;
        ctx.fill();
    }
}
