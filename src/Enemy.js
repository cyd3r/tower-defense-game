import { BufferLoader } from './engine/BufferLoader.js';
import { GameEngine } from './engine/GameEngine.js';
import { GameObject, ChildGameObject } from './engine/GameObject.js';
import { Vector } from './engine/Vector.js';
import { Healthbar } from './Healthbar.js';
import { HealingArea } from './Particles.js';
import { Terrain } from './Terrain.js';

export const PRESETS = {
    soldier: {
        isSoldier: true,
        tileName: 'soldier',
        slowVelocity: 9,
        velocity: 18,
        width: 32,
        height: 32,
        hitpoints: 10,
        healthbarOffset: 20,
        destroySound: 'ouch',
    },
    robot: {
        isSoldier: true,
        tileName: 'robot',
        slowVelocity: 20,
        velocity: 14,
        width: 32,
        height: 32,
        hitpoints: 60,
        healthbarOffset: 20,
        destroySound: 'ouch',
        isMetal: true,
    },
    scout: {
        isSoldier: true,
        tileName: 'scout',
        slowVelocity: 12,
        velocity: 34,
        width: 32,
        height: 32,
        hitpoints: 30,
        healthbarOffset: 20,
        destroySound: 'ouch',
    },
    cyborg: {
        isSoldier: true,
        tileName: 'cyborg',
        slowVelocity: 9,
        velocity: 18,
        width: 32,
        height: 32,
        hitpoints: 30,
        healthbarOffset: 20,
        destroySound: 'ouch',
        heal: {
            radius: 100,
            hitpoints: 2.5,
        },
    },
    tankGreen: {
        tileName: 'tankBodyGreen',
        tileNameTurret: 'tankTurretGreen',
        velocity: 18,
        width: 60,
        height: 60,
        hitpoints: 350,
        healthbarOffset: 25,
        destroySound: 'tankExplosion',
        isMetal: true,
    },
    tankSand: {
        tileName: 'tankBodySand',
        tileNameTurret: 'tankTurretSand',
        velocity: 28,
        width: 60,
        height: 60,
        hitpoints: 600,
        healthbarOffset: 25,
        destroySound: 'tankExplosion',
        isMetal: true,
        heal: {
            radius: 200,
            hitpoints: 5,
        },
    },
    planeGreen: {
        tileName: 'planeGreen',
        shadow: 'planeGreenShadow',
        velocity: 28,
        width: 60,
        height: 60,
        hitpoints: 130,
        healthbarOffset: 25,
        destroySound: 'planeDestroy',
    },
    planeBomber: {
        tileName: 'planeBomber',
        shadow: 'planeBomberShadow',
        velocity: 18,
        width: 60,
        height: 60,
        hitpoints: 160,
        healthbarOffset: 25,
        destroySound: 'planeDestroy',
        isMetal: true,
    }
};

/** @param {Terrain} terrain */
export function createEnemy(enemyType, terrain) {
    if (enemyType === 'tankGreen' || enemyType === 'tankSand') {
        return new EnemyTank(PRESETS[enemyType], terrain.getOffsetRoute());
    } else if (enemyType === 'planeGreen' || enemyType === 'planeBomber') {
        return new EnemyPlane(PRESETS[enemyType], terrain.getPlaneRoute());
    }
    return new Enemy(PRESETS[enemyType], terrain.getOffsetRoute());
}

export class Enemy extends GameObject {
    constructor(preset, route, drawLayer) {
        super(route[0].x, route[0].y, preset.width, preset.height, preset.tileName, drawLayer ?? 'enemy', 0)

        this.route = route;
        this.routeTarget = 1;
        this.forward = this.route[this.routeTarget].sub(this.position);

        this.velocity = preset.velocity;
        this.slowVelocity = preset.slowVelocity ?? preset.velocity;
        this.maxHitpoints = preset.hitpoints;
        this._hitpoints = this.maxHitpoints;

        this.healthbar = new Healthbar(this, preset.healthbarOffset);
        this.reachedBase = false;

        this.destroySound = preset.destroySound;
        this.isMetal = !!preset.isMetal;
        if (preset.heal) {
            this.healingArea = new HealingArea(this, preset.heal.radius, preset.heal.hitpoints);
        }

        this.drawAsElectrocuted = false;
        // add a small random offset so that the enemies are not blinking in sync
        this.electroBlinkOffset = Math.random() * 100;
        this.electroDrawPosition = new Vector(0, 0);
        this.electroAnchor = this.position;

        this.wiggleAngle = .2;
        // the enemies should not wiggle in sync
        this.randomWiggleOffset = Math.random();

        this.ragdollOnDestroy = preset.isSoldier && preset;

        this.aacArmor = 0;
        this.ignoreElectro = false;
        this.blocksCannonBall = false;
        this.flies = false;
    }
    set hitpoints(value) {
        this._hitpoints = Math.min(this.maxHitpoints, value);
    }
    get hitpoints() {
        return this._hitpoints;
    }

    update(environments) {
        if (this.isDestroyed) {
            return;
        }
        if (this.hitpoints <= 0) {
            BufferLoader.play(this.destroySound);
            this.destroy();
            return;
        }

        if (this.route[this.routeTarget].distanceTo(this) < 10) {
            if (this.routeTarget === this.route.length - 1) {
                this.reachedBase = true;
                BufferLoader.play('baseReached');
                this.destroy();
            } else {
                this.routeTarget += 1;
            }
        }
        this.lookAt(this.route[this.routeTarget], .1);

        const effects = environments.reduce((effects, env) => ({
            ...effects,
            ...env.apply(this),
        }), {});
        const electroFactor = effects.isElectrocuted ? .5 : 1;
        const velocity = effects.isSlowedDown ? this.slowVelocity : this.velocity;
        this.move(GameEngine.deltaTime * electroFactor * velocity, 0);

        if (effects.isElectrocuted) {
            this.hitpoints -= 5 * GameEngine.deltaTime;
        }
        this.drawAsElectrocuted = effects.isElectrocuted;

        this.healingArea?.update(GameEngine.deltaTime);
    }

    destroy() {
        super.destroy();
        this.healthbar.destroy();
        this.healingArea?.destroy();
    }

    rocketImpact(direction) {
        // spawn a ragdoll
        if (this.ragdollOnDestroy) {
            SoldierRagdoll.create(this.ragdollOnDestroy, this.position, this.forward, direction);
        }
    }

    draw (ctx, tilesheet) {
        const actualForward = this.forward;

        const now = GameEngine.timeSinceStartup;

        const w = 5 / this.velocity;
        // produces a zig-zag curve
        const x = (now + this.randomWiggleOffset);
        const up = Math.floor(x / w) % 2;
        const st = x / w - Math.floor(x / w);
        const wiggleOffset = this.wiggleAngle * (up - 2 * st * up + st) - .5 * this.wiggleAngle;

        this.forward = this.forward.rotate(wiggleOffset);

        const origPosition = this.position;
        if (this.drawAsElectrocuted && (Math.round(GameEngine.timeSinceStartup * 10 + this.electroBlinkOffset) % 2 === 0)) {
            ctx.filter = 'brightness(200%)';
        }
        const jitterWidth = 5;
        if (this.drawAsElectrocuted) {
            if (this.position.distanceTo(this.electroAnchor) > jitterWidth) {
                this.electroAnchor = this.position;
                const jitterDirection = this.forward.flipRight().norm();
                this.electroDrawPosition = this.position.add(jitterDirection.mult((-.5 * Math.random()) * jitterWidth * 2))
            }
            this.position = this.electroDrawPosition;
        }
        super.draw(ctx, tilesheet);
        if (this.drawAsElectrocuted) {
            this.position = origPosition;
        }
        ctx.filter = 'none';
        this.forward = actualForward;
    }

    // draw(ctx, tilesheet) {
    //     if (super.draw(ctx, tilesheet)) {
    //         // for debugging: draw path
    //         ctx.beginPath();
    //         ctx.moveTo(this.route[0].x, this.route[1].y);
    //         this.route.forEach(pos => ctx.lineTo(pos.x, pos.y))
    //         ctx.stroke();
    //         return true;
    //     }
    //     return false;
    // }
}

export class EnemyTank extends Enemy {
    constructor(preset, route) {
        super(preset, route);
        this.turret = new ChildGameObject(this, 0, 0, 64, 64, preset.tileNameTurret, 'enemy');
        this.wiggleAngle = 0;
        this.aacArmor = .9;
        this.blocksCannonBall = true;
    }
    update(environments) {
        super.update(environments);
        this.turret.lookAt(GameEngine.singleton.cursorPosition, .02);
        // disable jittering when electrocuted (it's a tank!)
        this.electroAnchor = this.position;
        this.electroDrawPosition = this.position;
    }
    destroy() {
        super.destroy();
        this.turret.destroy();
    }
}

export class EnemyPlane extends Enemy {
    constructor(preset, route) {
        super(preset, route, 'plane');
        this.wiggleAngle = 0;
        // aac makes considerably more damage to planes
        this.aacArmor = -3;
        this.ignoreElectro = true;
        this.flies = true;
    }
    draw(ctx, tilesheet) {
        ctx.shadowColor = 'rgba(0, 0, 0, 0.2)';
        ctx.shadowOffsetX = 20;
        ctx.shadowOffsetY = 11;
        super.draw(ctx, tilesheet);
        ctx.shadowColor = 'rgba(0, 0, 0, 0)';
    }
}

const MAX_RAGDOLL_DISTANCE = 128;
export class SoldierRagdoll extends GameObject {
    static ragdolls = [];
    static updateAll() {
        SoldierRagdoll.ragdolls.forEach(ragdoll => ragdoll.update());
    }

    static create(preset, position, forward, force) {
        const ragdoll = new SoldierRagdoll(preset, position, forward, force);
        SoldierRagdoll.ragdolls.push(ragdoll);
    }

    constructor(preset, position, forward, impactDirection) {
        super(position.x, position.y, preset.width, preset.height, preset.tileName, 'enemy', forward.toRotation());
        this.impactDirection = impactDirection;
        this.impactPoint = position;
        this.velocity = 300;
        this.rotationSpeed = Math.random() * 4 * 2 * Math.PI;
    }
    update() {
        this.position = this.position.add(this.impactDirection.mult(GameEngine.deltaTime * this.velocity));
        if (this.position.distanceTo(this.impactPoint) > MAX_RAGDOLL_DISTANCE) {
            SoldierRagdoll.ragdolls = SoldierRagdoll.ragdolls.filter(r => r !== this);
            this.destroy();
        }

        this.forward = this.forward.rotate(this.rotationSpeed * GameEngine.deltaTime);
    }
    draw(ctx, tilesheet) {
        ctx.filter = `opacity(${(1 - this.position.distanceTo(this.impactPoint) / MAX_RAGDOLL_DISTANCE) * 100}%)`;
        const out = super.draw(ctx, tilesheet);
        ctx.filter = 'none';
        return out;
    }
}
