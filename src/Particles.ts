import { Drawable, GameEngine, GameObject, Vector } from './engine';
import { Wave } from './Wave.js';

type RadiusGetter = (t: number) => number;
type ColorGetter = (t: number) => number[];
type DestinationGetter = () => Vector;
type RotationGetter = () => number;

interface ParticleConfig {
    maxAge?: number;
    numParticles?: number;
    color: ColorGetter;
    radius: RadiusGetter;
    destination: DestinationGetter;
    rotationVelocity: RotationGetter;
    emitFreq: number;
    particleAge: number;
}

class Pentagon {
    private orig: Vector;
    private center: Vector;
    private destination: Vector;
    private rotationVelocity: number;
    private rotation: number;
    private getRadius: RadiusGetter;
    private getColor: ColorGetter;
    maxAge: number;
    createdAt: number;
    private color: number[];
    private radius: number;
    constructor(center: Vector, getRadius: RadiusGetter, getColor: ColorGetter, destination: Vector, rotationVelocity: number, maxAge: number) {
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
    draw(ctx: CanvasRenderingContext2D) {
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

export class ParticleEmitter implements Drawable {
    static all: ParticleEmitter[] = [];
    private pentagons: Pentagon[];
    private lastEmitTime: number;
    private createdAt: number;
    center: Vector;
    private counter: number;
    forward: Vector;
    private maxAge?: number;
    private numParticles?: number;
    private getColor: ColorGetter;
    private getRadius: RadiusGetter;
    private getDestination: DestinationGetter;
    private getRotationVelocity: RotationGetter;
    private emitFreq: number;
    private particleAge: number;
    isDestroyed: boolean;
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
    static create(center: Vector, forward: Vector, config: ParticleConfig) {
        const emitter = new ParticleEmitter(center, forward, config);
        this.all.push(emitter);
        return emitter;
    }

    constructor(center: Vector, forward: Vector, config: ParticleConfig) {
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
    draw(ctx: CanvasRenderingContext2D) {
        this.pentagons.forEach(p => p.draw(ctx));
    }
}

export class HealingArea {
    private parent: GameObject;
    private radius: number;
    private hitpointsPerSecond: number;
    isDestroyed: boolean;
    constructor(parent: GameObject, radius: number, hitpointsPerSecond: number) {
        this.parent = parent;
        this.radius = radius;
        this.hitpointsPerSecond = hitpointsPerSecond;
        this.isDestroyed = false;
        GameEngine.singleton.registerDrawable(this, 'aura');
    }
    update(deltaTime: number) {
        Wave.singleton?.enemies.forEach(enemy => {
            if (enemy !== this.parent && this.parent.position.distanceTo(enemy.position) <= this.radius) {
                enemy.hitpoints += this.hitpointsPerSecond * deltaTime;
            }
        });
    }
    destroy() {
        this.isDestroyed = true;
    }
    draw(ctx: CanvasRenderingContext2D) {
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
