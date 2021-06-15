import { implementsTowerStatic, Tower } from '.';
import { BufferLoader, GameEngine, ChildGameObject, GameObject, Vector } from '../engine';
import { Wallet } from '../Wallet.js';

@implementsTowerStatic()
export class CoinTower extends GameObject implements Tower {
    private coinCollectedTime?: number;
    private productionTime: number;
    private coin?: ChildGameObject;

    static cost = 10;
    static iconName = 'coinTower';
    static displayName = 'Factory';
    static description = 'Produces coins';

    static build(position: Vector) { return new CoinTower(position); }

    constructor(position: Vector) {
        super(position.x, position.y, 80, 80, 'socketSmall', 'tower');
        this.coin = undefined;
        this.coinCollectedTime = undefined;
        this.productionTime = 9; //in seconds
        BufferLoader.play('towerBoot');
    }
    update() {
        const now = GameEngine.timeSinceStartup;
        if (this.coinCollectedTime === undefined) {
            this.coinCollectedTime = now;
        } else if (!this.coin && now - this.coinCollectedTime >= this.productionTime) {
            this.coin = new ChildGameObject(this, 0, 0, this.width / 3, this.height / 3, 'projectileGold', 'tower');
        }

        // coin animation
        if (this.coin) {
            const coinSize = Math.cos(now * 2) * .1 * this.width / 3 + this.width / 3;
            this.coin.width = coinSize;
            this.coin.height = coinSize;
        }
    }
    destroy() {
        super.destroy();
        this.coin?.destroy();
    }
    click() {
        if (this.coin) {
            this.coin.destroy();
            this.coin = undefined;
            // +- 2 second offset
            const rndOffset = (Math.random() - .5) * 4;
            this.coinCollectedTime = GameEngine.timeSinceStartup + rndOffset;
            this.productionTime = 20;
            Wallet.singleton!.coins += 5;
            BufferLoader.play('coin');
        }
    }
    get cost() {
        return CoinTower.cost;
    }
}
