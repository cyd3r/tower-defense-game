import { Enemy } from './Enemy.js';
import { BufferLoader } from './engine/BufferLoader.js';
import { GameEngine } from './engine/GameEngine.js';
import { ChildGameObject, GameObject } from './engine/GameObject.js';
import { TileName } from './engine/tilesheet.js';
import { interpolateColor } from './engine/util.js';
import { Vector } from './engine/Vector.js';
import { ParticleEmitter } from './Particles.js';

export interface Preset {
    tileName: TileName;
    velocity: number;
    damage: number;
    width: number;
    height: number;
    isAAC?: boolean;
    isCannonBall?: boolean;
    isHomingMissile?: boolean;
    damageRange?: number;
    outerDamageRatio?: number;
    isMissile?: boolean;
}
type PresetName = 'rocketSmall' | 'homingMissile' | 'aacBullet' | 'cannonBall';

export const PRESETS: {[key in PresetName]: Preset} = {
    rocketSmall: {
        tileName: 'rocketSmall',
        velocity: 100,
        damage: 70,
        width: 14,
        height: 35,
        damageRange: 30,
        outerDamageRatio: .2,
        isMissile: true,
    },
    homingMissile: {
        tileName: 'rocketLarge',
        width: 24,
        height: 48,
        damage: 200,
        outerDamageRatio: .2,
        damageRange: 100,
        velocity: 80,
        isMissile: true,
        isHomingMissile: true,
    },
    aacBullet: {
        tileName: 'projectileSilver',
        width: 12,
        height: 12,
        damage: 0.2,
        velocity: 360,
        isAAC: true,
    },
    cannonBall: {
        tileName: 'projectileGoldCore',
        width: 20,
        height: 20,
        damage: 20,
        velocity: 360,
        outerDamageRatio: .2,
        isCannonBall: true,
    },
};

export function createProjectile(preset: Preset, parent: GameObject, position: Vector, direction: Vector) {
    if (preset.isHomingMissile) {
        return new HomingMissile(preset, parent, position, direction);
    }
    if (preset.isCannonBall) {
        return new CannonBall(preset, parent, position, direction);
    }
    return new Projectile(preset, parent, position, direction);
}

export class Projectile extends ChildGameObject {
    static all: Projectile[] = [];
    protected velocity: number;
    protected damage: number;
    private damageRange?: number;
    private outerDamageRatio: number;
    private isMissile?: boolean;
    private isAAC?: boolean;
    private tail?: MissileTail;

    static updateAll(enemies: Enemy[]) {
        Projectile.all = Projectile.all.filter(projectile => {
            if (projectile.isDestroyed) {
                return false;
            }
            // out of bounds?
            const size = Math.max(projectile.height, projectile.width);
            if (projectile.x < -size || projectile.y < -size || projectile.x > GameEngine.width + size || projectile.y > GameEngine.height + size) {
                projectile.destroy();
                return false;
            }
            projectile.update(enemies);
            return true;
        });
    }
    constructor(preset: Preset, parent: GameObject, position: Vector, direction: Vector) {
        super(parent, position.x, position.y, preset.width, preset.height, preset.tileName, 'projectile');
        this.velocity = preset.velocity;
        this.damage = preset.damage;
        this.forward = direction;
        this.damageRange = preset.damageRange;
        this.outerDamageRatio = preset.outerDamageRatio ?? 0;

        this.isMissile = preset.isMissile;
        this.isAAC = preset.isAAC;

        Projectile.all.push(this);
    }
    detach() {
        super.detach();
        if (this.isMissile && !this.tail) {
            BufferLoader.play('missileLaunch');
            this.tail = new MissileTail(this);
        }
    }
    destroy() {
        super.destroy();
        this.tail?.destroy();
    }
    update(enemies: Enemy[]) {
        if (this.isDestroyed || this.parent) {
            return;
        }

        this.move(this.velocity * GameEngine.deltaTime, 0);

        // collision?
        const target = enemies.find(enemy => this.collidesWith(enemy));
        if (target) {
            this.doCollision(target, enemies);
        }
    }

    doCollision(target: Enemy, enemies: Enemy[]) {
        const impactPosition = this.position.add(target.position).mult(.5);
        if (this.damageRange && this.damageRange > 0) {
            for (let enemy of enemies) {
                const distance = ((enemy === target) ? 0 : impactPosition.distanceTo(enemy.position));
                if (distance <= this.damageRange){
                    const impactDirection = enemy.position.sub(this.position).norm();
                    // there is no special handling for AAC here because we don't have AAC projectiles with splash damage
                    enemy.hitpoints -= this.damage - ((1 - this.outerDamageRatio) * this.damage) / this.damageRange * distance;
                    if (this.isMissile) {
                        if (enemy.hitpoints <= 0) {
                            enemy.rocketImpact(impactDirection);
                        }
                    }
                }
            }
        } else {
            if (this.isAAC) {
                target.hitpoints -= this.damage * (1 - target.aacArmor);
            } else {
                target.hitpoints -= this.damage;
            }
            if (this.isAAC) {
                if (target.isMetal) {
                    BufferLoader.play('aacImpactMetal');
                } else {
                    BufferLoader.play('aacImpactFlesh');
                }
            }
            this.destroy();
        }
        if (this.isMissile) {
            ParticleEmitter.create(impactPosition, target.position.sub(this.position).norm(), {
                color: (t: number) => interpolateColor([160, 160, 160, 130], [221, 136, 44, 30], t),
                radius: () => 10,
                destination: ()  => Vector.randomFromEllipse(80, 50),
                rotationVelocity: () => Math.random() * 3,
                numParticles: 20,
                maxAge: 2,
                emitFreq: .01,
                particleAge: .5,
            });
            BufferLoader.play('missileImpact');
        }
        this.destroy();
    }
}

export class HomingMissile extends Projectile {
    target?: Enemy;
    private showShadow: boolean;
    private altitude: number;
    constructor(preset: Preset, parent: GameObject, position: Vector, direction: Vector){
        super(preset, parent, position, direction)
        this.target = undefined;
        this.showShadow = false;
        this.altitude = 1;
    }
    detach() {
        super.detach();
        this.showShadow = true;
    }

    update(enemies: Enemy[]) {
        if (this.isDestroyed || this.parent) {
            return;
        }
        if(this.target) {
            if(!this.target.isDestroyed) {
                this.lookAt(this.target.position, 6 * GameEngine.deltaTime)
                if (!this.target.flies) {
                    this.altitude = Math.min(1, this.target.position.distanceTo(this.position) / 200);
                }
            }
        }
        this.move(this.velocity * GameEngine.deltaTime, 0);
        if (this.target && this.collidesWith(this.target)) {
            this.doCollision(this.target, enemies);
        }
    }
    draw(ctx: CanvasRenderingContext2D, tilesheet: CanvasImageSource) {
        if (this.showShadow) {
            ctx.shadowColor = 'rgba(0, 0, 0, 0.2)';
            ctx.shadowOffsetX = 20 * this.altitude;
            ctx.shadowOffsetY = 11 * this.altitude;
            super.draw(ctx, tilesheet);
            ctx.shadowColor = 'rgba(0, 0, 0, 0)';
        } else {
            super.draw(ctx, tilesheet);
        }
    }
}

class CannonBall extends Projectile {
    private hitList: Enemy[];
    constructor(preset: Preset, parent: GameObject, position: Vector, direction: Vector) {
        super(preset, parent, position, direction);
        this.hitList = [];
    }
    update(enemies: Enemy[]) {
        if (this.isDestroyed || this.parent) {
            return;
        }
        this.move(this.velocity * GameEngine.deltaTime, 0);
        for (let enemy of enemies) {
            if (this.hitList.every(h => h !== enemy)) {
                if (this.collidesWith(enemy)) {
                    this.hitList.push(enemy);
                    if (!enemy.flies) {
                        enemy.hitpoints -= this.damage;
                        if (enemy.blocksCannonBall) {
                            this.destroy();
                            return;
                        }
                    }
                }
            }
        }
    }
}

class MissileTail extends ChildGameObject {
    constructor(parent: GameObject) {
        super(parent, 0, 0, 18, 31, 'flashMedium', 'projectile');
        this.localForward = new Vector(0, -1);
        this.localPosition = new Vector(0, -.5 * parent.height - .5 * this.height);
    }
    draw(ctx: CanvasRenderingContext2D, tilesheet: CanvasImageSource) {
        if (!this.parent) {
            return;
        }
        const now = GameEngine.timeSinceStartup;
        const t = Math.sin(now * 12.5);
        const origWidth = this.width;
        const origHeight = this.height;
        this.width = origWidth + t * 0.1 * origWidth;
        this.height = origHeight + t * 0.07 * origHeight;
        this.localPosition.y = -.5 * (this.parent as GameObject).height - .5 * this.height;
        ctx.filter = `brightness(${100 + t * 5}%)`;
        super.draw(ctx, tilesheet);
        this.width = origWidth;
        this.height = origHeight;
        ctx.filter = 'none';
    }
}
