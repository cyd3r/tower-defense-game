import { implementsTowerStatic } from '.';
import { Enemy } from '../Enemy';
import { BufferLoader, GameEngine, GameObject, Vector} from '../engine';
import { TileName } from '../engine/tilesheet';
import { PRESETS, createProjectile, Preset as ProjectilePreset, Projectile, HomingMissile } from '../Projectile';
import { RangeRenderer } from './RangeRenderer';

interface Preset {
    innerRange?: number;
    cost: number;
    iconNameSocket: TileName;
    iconNameTurret: TileName;
    name: string;
    iconName: string;
    fireDelay: number;
    loadingTime: number;
    projectileType: ProjectilePreset;
    launchDistance: number;
    aimRange: number;
}
type TowerName = 'doubleRocket' | 'HomingMissileTower' | 'AAC' | 'Cannon';
export const TOWERPRESETS: {[key in TowerName]: Preset} = {
    doubleRocket:{
        cost: 40,
        iconNameSocket: 'socket3',
        iconNameTurret: 'turretDoubleRocket',
        name: 'Double Rockets',
        iconName: 'doubleRocketTower',
        fireDelay: 1,
        loadingTime: 12,
        projectileType: PRESETS.rocketSmall,
        launchDistance: 50,
        aimRange: 300,
    },
    HomingMissileTower:{
        cost: 100,
        iconNameSocket: 'socket2',
        iconNameTurret: 'turretSingleRocket',
        name: 'Missile Silo',
        iconName: 'HomingMissileTower',
        fireDelay: 1.5,
        loadingTime: 16,
        projectileType: PRESETS.homingMissile,
        launchDistance: 50,
        aimRange: 500,
        innerRange: 200,
    },
    AAC: {
        cost:30,
        iconNameSocket:'socket3',
        iconNameTurret:'turretDoubleBarrel',
        name:'AAC',
        iconName: 'AAC',
        fireDelay: 0,
        loadingTime: 0.2,
        projectileType: PRESETS.aacBullet,
        launchDistance: 0,
        aimRange: 200,
    },
    Cannon:{
        cost: 60,
        iconNameSocket: 'socket1',
        iconNameTurret:'turretSingleBarrel',
        name: 'Cannon',
        iconName:'cannon',
        fireDelay: 0,
        loadingTime: 4,
        projectileType: PRESETS.cannonBall,
        launchDistance: 0,
        aimRange: 200,
    }
}

export class Turret<P extends Projectile> {
    preset: Preset;
    iconNameTurret: TileName;
    iconNameSocket: TileName;
    name: string;
    fireDelay: number;
    loadingTime: number;
    projectileType: any;
    launchDistance: any;
    turretWidth: number;
    turretHeight: number;
    socketWidth: number;
    socketHeight: number;
    aimRange: number;
    x: number;
    y: number;
    socket: GameObject;
    tower: GameObject;
    origin: Vector;
    protected _loaded: P | null;
    launchOffset: Vector;
    reloadStartTime: any;
    fireDelayStartTime: number;
    focusedEnemy: Enemy | null;
    rangeRenderer: RangeRenderer;

    static cost: number;
    constructor (position: Vector, preset: Preset){
        this.preset = preset;

        this.iconNameTurret = this.preset.iconNameTurret;
        this.iconNameSocket = this.preset.iconNameSocket;

        this.name = this.preset.name;
        this.fireDelay = this.preset.fireDelay;
        this.loadingTime = this.preset.loadingTime;
        this.projectileType = this.preset.projectileType;
        /** The distance the launched rocket must travel before the turret can turn again. */
        this.launchDistance = this.preset.launchDistance; 
        this.turretWidth = 64;
        this.turretHeight = 64;
        this.socketWidth = 64;
        this.socketHeight = 64;
        this.aimRange = this.preset.aimRange;
        this.x = position.x;
        this.y = position.y;
        this.socket = new GameObject(this.x,this.y, this.socketWidth, this.socketHeight , this.iconNameSocket, 'tower');
        this.tower = new GameObject(this.x,this.y, this.turretWidth, this.turretHeight , this.iconNameTurret, 'tower', 2 * Math.PI * Math.random());

        this.origin = new Vector(this.x, this.y);
        this._loaded = null;
        this.launchOffset = new Vector(0, 0);

        this.reloadStartTime = GameEngine.timeSinceStartup;
        this.fireDelayStartTime = 0;
        BufferLoader.play('towerBoot');

        /** @type {Enemy} */
        this.focusedEnemy = null;
        this.rangeRenderer = new RangeRenderer(this.socket, this.aimRange);
    }

    update(enemies: Enemy[]) {
        const now = GameEngine.timeSinceStartup;
        // is launching when the loaded rocket is already detached from the tower but has not left the tower yet
        // if the rocket is launching, the tower should not turn
        const isLaunching = (
            // do we even care?
            this.launchDistance > 0 &&
            // if there's no projectile, nothing is launching
            this.loaded &&
            // if the projectile has not detached, we are not launching
            this.loaded.parent !== this.tower &&
            // the missile must leave the turret before the turret can turn again
            this.loaded.position.distanceTo(this.tower.position) < this.launchDistance
        );
        if (!isLaunching) {
            if (this.canLoad && now - this.reloadStartTime >= this.loadingTime) {
                this.load();
            }

            // look for enemies
            if (this.focusedEnemy) {
                // out of range or destroyed?
                if (this.focusedEnemy.isDestroyed || this.tower.position.distanceTo(this.focusedEnemy.position) > this.aimRange) {
                    this.focusedEnemy = null;
                }
            }
            if (!this.focusedEnemy) {
                // find the closest enemy
                let closest = null;
                let closestDistance = 9999999999;
                for (let enemy of enemies) {
                    // has the enemy entered the canvas?
                    if (enemy.x > 0 && enemy.y > 0 && enemy.x < GameEngine.width && enemy.y < GameEngine.height) {
                        const dist = this.tower.position.distanceTo(enemy.position);
                        const choice = this.chooseEnemy(closest, closestDistance, enemy, dist);
                        closest = choice.enemy;
                        closestDistance = choice.distance;
                    }
                }
                this.focusedEnemy = closest;
            }
            if (this.focusedEnemy) {
                this.tower.lookAt(this.focusedEnemy.position, 6 * GameEngine.deltaTime);

                // do not use setTimeout for firing because we may want to cancel it if the enemy is destroyed earlier
                if (this.loaded && now - this.fireDelayStartTime >= this.fireDelay) {
                    const impactPosition = this.tower.position.add(this.tower.forward.mult(this.focusedEnemy.position.sub(this.tower.position).magnitude));
                    if (impactPosition.distanceTo(this.focusedEnemy.position) < 20) {
                        this.fire();
                    }
                }
            }
        }

        this.rangeRenderer.show = this.socket.unrotatedBoxContains(GameEngine.singleton.cursorPosition);
    }
    chooseEnemy(enemyA: Enemy | null, distA: number, enemyB: Enemy, distB: number) {
        // no need to check distA, because distA is either in range or enemyA is null
        // B is in range?
        if (distB > this.aimRange) {
            return { enemy: enemyA, distance: distA };
        }
        // always focus the closer enemy
        if (distB < distA) {
            return { enemy: enemyB, distance: distB }
        } else {
            return { enemy: enemyA, distance: distA };
        }
    }
    get loaded() {
        return this._loaded;
    }
    set loaded(value) {
        this._loaded = value;
        if (value) {
            this.fireDelayStartTime = GameEngine.timeSinceStartup;
        }
    }
    get canLoad() {
        return !this.loaded;
    }
    load() {
        this.loaded = createProjectile(this.projectileType, this.tower, this.launchOffset, this.tower.forward) as P;
    }
    fire() {
        if (this.loaded) {
            this.loaded.detach();
            this.loaded = null;
            this.reloadStartTime = GameEngine.timeSinceStartup;
        }
    }
    destroy() {
        this.tower.destroy();
        this.socket.destroy();
        this.rangeRenderer.destroy();
        this.loaded?.destroy();
    }
    get cost() {
        return Turret.cost;
    }
}

@implementsTowerStatic()
export class DoubleRocketTurret extends Turret<Projectile> {
    static cost = TOWERPRESETS.doubleRocket.cost;
    static iconName = 'doubleRocketTower';
    static displayName = TOWERPRESETS.doubleRocket.name;
    static range = TOWERPRESETS.doubleRocket.aimRange;
    static description = `Fires rockets that can deal high damage - if they hit.
Effective against slow enemies with many hitpoints.`;
    loadedSecond: Projectile | null;
    static build(position: Vector) { return new DoubleRocketTurret(position); }
    constructor(position: Vector){
        super(position, TOWERPRESETS.doubleRocket);
        this.loadedSecond = null;
        this.launchOffset = new Vector(this.tower.height / 7, 5);
    }
    get canLoad() {
        return !this.loaded || !this.loadedSecond;
    }
    load() {
        const proj = createProjectile(this.projectileType, this.tower, this.launchOffset, this.tower.forward);
        if (!this.loaded) {
            this.loaded = proj;
            this.reloadStartTime = GameEngine.timeSinceStartup;
        } else {
            this.loadedSecond = proj;
        }
        this.launchOffset.x *= -1;
    }
    fire() {
        super.fire();
        this.loaded = this.loadedSecond;
        this.loadedSecond = null;
    }
    get cost() {
        return DoubleRocketTurret.cost;
    }
}

@implementsTowerStatic()
export class AAC extends Turret<Projectile> {
    static cost = TOWERPRESETS.AAC.cost;
    static displayName = TOWERPRESETS.AAC.name;
    static iconName = 'AAC';
    static range = TOWERPRESETS.AAC.aimRange;
    static description = `Fires fast bullets with a high rate of fire. That makes the AAC particularly accurate.
Unfortunately, it can't deal much damage and is not suitable against heavily armoured enemies.`
    airborneAimRange: number;
    static build(position: Vector) { return new AAC(position); }
    constructor(position: Vector){
        super(position, TOWERPRESETS.AAC);
        this.launchOffset = new Vector(this.tower.height / 10, .5 * this.tower.width);
        // this.airborneRangeRenderer = new RangeRenderer(this, this.aimRange * 1.5);
        this.airborneAimRange = this.aimRange * 1.5;
    }
    load() {
        this.loaded = createProjectile(this.projectileType, this.tower, this.launchOffset, this.tower.forward);
    }
    chooseEnemy(enemyA: Enemy | null, distA: number, enemyB: Enemy, distB: number) {
        // no need to check range of A, see super class for details
        // B out of range?
        if ((enemyB.flies && distB > this.airborneAimRange) || (!enemyB.flies && distB > this.aimRange)) {
            return { enemy: enemyA, distance: distA };
        }
        if (!enemyA) {
            return { enemy: enemyB, distance: distB };
        }
        // no need to check B; B is never null
        // airborne enemies are preferred  
        if (enemyA.flies && !enemyB.flies) {
            return { enemy: enemyA, distance: distA };
        }
        if (!enemyA.flies && enemyB.flies) {
            return { enemy: enemyB, distance: distB };
        }

        if (distA < distB) {
            return { enemy: enemyA, distance: distA };
        }
        return { enemy: enemyB, distance: distB };
    }
    fire() {
        this.loaded = createProjectile(this.projectileType, this.tower, this.launchOffset, this.tower.forward);
        super.fire();
        this.launchOffset.x *= -1;
    }
    destroy() {
        // loaded is always a boolean except inside fire()
        // therefore, loaded doesn't need to be destroyed
        this.loaded = null;
        super.destroy();
    }
    get cost() {
        return AAC.cost;
    }
}

@implementsTowerStatic()
export class Cannon extends Turret<Projectile> {
    static cost = TOWERPRESETS.Cannon.cost;
    static displayName = TOWERPRESETS.Cannon.name;
    static iconName = 'cannon';
    static description = `Fires heavy cannonballs that can fly through enemies.
The cannon alway fires in the same direction which can be rotated when you click on it.
Effective against groups of enemies. Tanks prevent cannonballs from flying through.`;
    lookTarget: Vector;
    static build(position: Vector) { return new Cannon(position); }
    constructor(position: Vector){
        super(position, TOWERPRESETS.Cannon);
        this.lookTarget = new Vector(1, 0);
        this.launchOffset = new Vector(0, .5 * this.tower.width);
    }
    update() {
        const now = GameEngine.timeSinceStartup;
        if (this.canLoad && now - this.reloadStartTime >= this.loadingTime) {
            this.load();
        }
        this.tower.lookAt(this.tower.position.add(this.lookTarget), 6 * GameEngine.deltaTime);
        if (this.loaded) {
            this.fire();
        }
    }
    load() {
        this.loaded = createProjectile(this.projectileType, this.tower, this.launchOffset, this.tower.forward);
    }
    fire() {
        this.loaded = createProjectile(this.projectileType, this.tower, this.launchOffset, this.tower.forward);
        super.fire();
        BufferLoader.play('cannonFire');
    }
    click() {
        this.lookTarget = this.lookTarget.flipRight();
    }
    get cost() {
        return Cannon.cost;
    }
}

@implementsTowerStatic()
export class HomingMissileTurret extends Turret<HomingMissile> {
    static cost =  TOWERPRESETS.HomingMissileTower.cost;
    static displayName = TOWERPRESETS.HomingMissileTower.name;
    static iconName = TOWERPRESETS.HomingMissileTower.iconName;
    static range = TOWERPRESETS.HomingMissileTower.aimRange;
    static innerRange = TOWERPRESETS.HomingMissileTower.innerRange;
    static description = `Launches homing missiles that deal extremely high damage. The missiles follow a fixed target.
The Missile Silo can't target enemies that are nearby.`;
    _loaded: HomingMissile | null;
    static build(position: Vector) { return new HomingMissileTurret(position); }
    constructor(position: Vector) {
        super(position, TOWERPRESETS.HomingMissileTower);
        this._loaded = null;
        this.rangeRenderer.innerRange = TOWERPRESETS.HomingMissileTower.innerRange;
    }
    chooseEnemy(enemyA: Enemy | null, distA: number, enemyB: Enemy, distB: number) {
        if (distB < TOWERPRESETS.HomingMissileTower.innerRange!) {
            return { enemy: enemyA, distance: distA };
        }
        return super.chooseEnemy(enemyA, distA, enemyB, distB);
    }
    update(enemies: Enemy[]) {
        // loose focus on enemies that are too close
        if (this.focusedEnemy && this.tower.position.distanceTo(this.focusedEnemy) < TOWERPRESETS.HomingMissileTower.innerRange!) {
            this.focusedEnemy = null;
        }
        super.update(enemies);
    }
    fire() {
        if (this.loaded) {
            this.loaded.target = this.focusedEnemy ?? undefined;
            super.fire();
        }
    }
    get cost() {
        return HomingMissileTurret.cost;
    }
}
