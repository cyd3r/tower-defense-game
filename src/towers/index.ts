import { Enemy } from "../Enemy";
import { Vector } from "../engine";
import { CoinTower } from "./CoinTower";
import { ElectroTower } from "./ElectroTower";
import { SlowdownArea } from "./SlowdownArea";
import { AAC, Cannon } from "./Turret";

export type TowerType = typeof CoinTower | typeof SlowdownArea | typeof AAC | typeof Cannon | typeof ElectroTower;

export interface Tower {
    update: (enemies: Enemy[]) => void;
    destroy: () => void;
    click?: () => void;
    cost: number;
}

export interface TowerStatic {
    displayName: string;
    cost: number;
    iconName: string;
    range?: number;
    description: string;
    innerRange?: number;
    build: (position: Vector) => Tower;
}

// https://stackoverflow.com/a/43674389
export function implementsTowerStatic() {
    return <U extends TowerStatic>(constructor: U) => {constructor};
}
