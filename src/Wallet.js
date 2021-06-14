import { CoinTower } from './towers/CoinTower.js';
import { ElectroTower } from './towers/ElectroTower.js';
import { SlowdownArea } from './towers/SlowdownArea.js';
import { DoubleRocketTurret, AAC , HomingMissileTurret, Cannon} from './towers/Turret.js';

export class Wallet {
    static singleton = undefined;
    constructor(towersElement, coinsElement) {
        Wallet.singleton = this;

        this.coinsElement = coinsElement;
        this._towerToBuild = undefined;
        this._demolishTower = false;

        const towers = [CoinTower, SlowdownArea, AAC, DoubleRocketTurret, Cannon, HomingMissileTurret, ElectroTower];
        const towerKeys = ['1', '2', '3', '4', '5', '6', '7'];
        this.towerBtns = towers.map((TowerType, i) => {
            const div = document.createElement('div');
            div.classList.add('tower-entry');

            const btn = document.createElement('button');
            div.appendChild(btn);
            btn.classList.add('tower-button');
            btn.dataset.tower = TowerType.iconName;
            btn.dataset.cost = TowerType.cost;
            btn.title = TowerType.name;

            const img = document.createElement('img');
            img.src = `static/images/tower-defense-top-down/${TowerType.iconName}.png`;
            img.width = 50;
            btn.appendChild(img);

            towersElement.appendChild(div);

            btn.addEventListener('click', () => {
                if (TowerType.cost <= this.coins) {
                    this.towerToBuild = (this.towerToBuild === TowerType) ? undefined : TowerType;
                    this.demolishTower = false;
                }
            });

            const divDetails = document.createElement('div');
            divDetails.classList.add('tower-details');
            div.appendChild(divDetails);

            const titleElt = document.createElement('h2');
            titleElt.classList.add('white-shadow');
            titleElt.innerText = TowerType.name;
            divDetails.appendChild(titleElt);

            const costElt = document.createElement('p');
            costElt.innerText = `Cost: ${TowerType.cost}`;
            divDetails.appendChild(costElt);

            const shortcutElt = document.createElement('p');
            shortcutElt.innerHTML = `Hotkey: <kbd>${towerKeys[i]}</kbd>`;
            divDetails.appendChild(shortcutElt);

            const descriptionElt = document.createElement('p');
            descriptionElt.innerText = TowerType.description;
            divDetails.appendChild(descriptionElt);

            return btn;
        });

        window.addEventListener('keyup', event => {
            // apparently, escape does not seem to work inside keypress
            if (event.key === 'Escape') {
                this.towerToBuild = undefined;
                this.demolishTower = false;
            }
        });
        window.addEventListener('contextmenu', e => {
            this.towerToBuild = undefined;
            this.demolishTower = false;
            e.preventDefault();
        });
        window.addEventListener('keypress', e => {
            if (e.key === 's') {
                this.towerToBuild = undefined;
                this.demolishTower = !this.demolishTower;
                return;
            } else if (e.key === 'C') {
                this.coins += 100;
            }
            const towerIndex = towerKeys.findIndex(k => e.key === k);
            if (towerIndex !== -1) {
                const TowerType = towers[towerIndex];
                if (TowerType.cost <= this.coins) {
                    this.towerToBuild = (this.towerToBuild === TowerType) ? undefined : TowerType;
                    this.demolishTower = false;
                }
            }
        });

        this.demolishBtn = document.querySelector('.demolish');
        this.demolishBtn.addEventListener('click', () => {
            this.towerToBuild = undefined;
            this.demolishTower = !this.demolishTower;
        })

        this.coins = 20;
    }
    set towerToBuild(value) {
        this._towerToBuild = value;
        this.towerBtns.forEach(btn => {
            btn.classList.toggle('btnClicked', btn.dataset.tower === value?.iconName);
        });
    }
    get towerToBuild() {
        return this._towerToBuild;
    }
    set demolishTower(value) {
        this._demolishTower = value;
        this.demolishBtn.classList.toggle('btnClicked', value);
    }
    get demolishTower() {
        return this._demolishTower;
    }
    set coins(value) {
        this._coins = value;
        this.coinsElement.innerText = value;
        this.towerBtns.forEach(btn => {
            btn.classList.toggle('not-affordable', btn.dataset.cost > value);
        });
    }
    get coins() {
        return this._coins;
    }
    buySelected() {
        console.assert(this.towerToBuild, 'No tower selected that can be bought');
        this.coins -= this.towerToBuild.cost;
        this.towerToBuild = undefined;
    }
}
