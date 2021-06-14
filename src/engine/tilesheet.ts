export interface TilesheetEntry {
    x: number;
    y: number;
    width: number;
    height: number;
    rotation: number;
}

const ingameTileSize = 128;
const PI_HALF = .5 * Math.PI;

const menuTileSize = 128;
const menuTilesheetOffsetX = menuTileSize / 2;
const menuTilesheetOffsetY = 13 * ingameTileSize + menuTileSize / 2;

/** Defines the locations of the images on the tilesheet */
const ingameTilesheet = {
    // road/gras
    roadTopLeft: { x: 0, y: 0 },
    roadTop: { x: 1, y: 0 },
    roadTopRight: { x: 2, y: 0 },
    roadLeft: { x: 0, y: 1 },
    gras: { x: 1, y: 1 },
    roadRight: { x: 2, y: 1 },
    roadBottomLeft: { x: 0, y: 2 },
    roadBottom: { x: 1, y: 2 },
    roadBottomRight: { x: 2, y: 2 },
    road: { x: 4, y: 2 },
    roadBottomRightSharp: { x: 3, y: 0 },
    roadBottomLeftSharp: { x: 4, y: 0 },
    roadTopRightSharp: { x: 3, y: 1 },
    roadTopLeftSharp: { x: 4, y: 1 },

    // trees
    treeBig: { x: 15, y: 5 },
    treeSmall: { x: 16, y: 5 },
    tree3: { x: 17, y: 5 },
    treeBigRound: { x: 18, y: 5 },
    treeStar: { x: 19, y: 5 },
    // rocks
    rockSmall: { x: 20, y: 5 },
    rockLarge: { x: 21, y: 5 },
    rockMedium: { x: 22, y: 5 },

    // sockets
    socket1: { x: 19, y: 7 },
    socket2: { x: 20, y: 7 },
    socket3: { x: 21, y: 7 },
    socketSmall: { x: 22, y: 7 },

    // turrets
    turretDoubleRocket2Loaded: { x: 20, y: 8, rotation: PI_HALF },
    turretDoubleRocketLoaded: { x: 21, y: 8, rotation: PI_HALF },
    turretSingleRocketLoaded: { x: 22, y: 8, rotation: PI_HALF },
    turretDoubleRocket2: { x: 20, y: 9, rotation: PI_HALF },
    turretDoubleRocket: { x: 21, y: 9, rotation: PI_HALF },
    turretSingleRocket: { x: 22, y: 9, rotation: PI_HALF },
    turretSingleBarrel: { x: 19, y: 10, rotation: PI_HALF },
    turretDoubleBarrel: { x: 20, y: 10, rotation: PI_HALF },
    turret2: { x: 19, y: 8, rotation: PI_HALF },
    turret3: { x: 19, y: 9, rotation: PI_HALF },

    // projectiles
    rocketSmall: { x: 21, y: 10, rotation: PI_HALF, width: 28, height: 70 },
    rocketLarge: { x: 22, y: 10, rotation: PI_HALF, width: 41, height: 82 },
    projectileGold: { x: 19, y: 11, width: 36, height: 36 },
    projectileGoldCore: { x: 20, y: 11, width: 36, height: 36 },
    projectileBronze: { x: 21, y: 11, width: 36, height: 36 },
    projectileSilver: { x: 22, y: 11, width: 36, height: 36 },

    // muzzle flash
    flashMedium: {x: 19, y: 12, rotation: PI_HALF, height: 62, width: 36 },
    flashLarge: {x: 20, y: 12, rotation: PI_HALF },
    flashSmall: {x: 21, y: 12, rotation: PI_HALF },
    flashBurst: {x: 22, y: 12, rotation: PI_HALF },

    // soldiers
    soldier: { x: 15, y: 10, width: 64, height: 64 },
    robot: { x: 16, y: 10, width: 64, height: 64 },
    scout: { x: 17, y: 10, width: 64, height: 64 },
    cyborg: { x: 18, y: 10, width: 64, height: 64 },

    // tank
    tankBodyGreen: { x: 15, y: 11, width: 120, height: 120 },
    tankTurretGreen: { x: 15, y: 12 },
    tankBodySand: { x: 16, y: 11, width: 120, height: 120 },
    tankTurretSand: { x: 16, y: 12 },
    // planes
    planeGreen: { x: 17, y: 11 },
    planeGreenShadow: { x: 17, y: 12 },
    planeBomber: { x: 18, y: 11 },
    planeBomberShadow: { x: 18, y: 12 },

    // buildable preview
    notBuildable: { x: 17, y: 0 },
    buildable: { x: 16, y: 0 },
    spawnMarker: { x: 18, y: 0 },

    // base aesthetics
    baseMiddle: { x: 24, y: 0, rotation: -PI_HALF },
    baseRight: { x: 24, y: 1, rotation: -PI_HALF },
    baseLeft: { x: 24, y: 2 , rotation: -PI_HALF},
};

const menuTilesheet = {
    //levels
    level: { x: 4, y: 4 },
    //gras
    menuGras1: { x: 0, y: 0 },
    menuGras2: { x: 1, y: 0 },
    //trees
    broadleaf1: { x: 0, y: 3 },
    broadleaf2: { x: 1, y: 3 },
    broadleaf3: { x: 2, y: 3 },
    broadleaf4: { x: 3, y: 3 },
    conifer1: { x: 0, y: 4 },
    conifer2: { x: 1, y: 4 },
    conifer3: { x: 2, y: 4 },
    conifer4: { x: 3, y: 4 },
    //stones
    stone1: { x: 4, y: 4 },
    stone2: { x: 5, y: 4 },
    stone3: { x: 6, y: 4 },
    stone4: { x: 7, y: 4 },
    stone5: { x: 8, y: 4 },
    stone6: { x: 9, y: 4 },
    //paths
    pathNS: { x: 4, y: 0 },
    pathWE: { x: 5, y: 0 },
    pathSE: { x: 4, y: 1 },
    pathWS: { x: 5, y: 1 },
    pathNE: { x: 4, y: 2 },
    pathWN: { x: 5, y: 2 },
    pathWSE: { x: 7, y: 0 },
    pathWNE: { x: 8, y: 0 },
    pathNWS: { x: 7, y: 1 },
    pathNES: { x: 8, y: 1 },
    pathEndN: { x: 8, y: 2 },
    pathEndE: { x: 6, y: 1 },
    pathEndS: { x: 7, y: 2 },
    pathEndW: { x: 6, y: 2 },
    //buildings
    house1: { x: 5, y: 6 },
    house2: { x: 6, y: 6 },
    house3: { x: 8, y: 6 },
    house4: { x: 9, y: 6 },
    castleTop: { x: 16, y: 0 },
    castleBottom: { x: 16, y: 1 },
    towerTop: { x: 15, y: 0 },
    towerBottom: { x: 15, y: 1 },
    churchRoof: { x: 14, y: 0 },
    churchFloor: { x: 14, y: 1 },
    windmillTop: { x: 16, y: 2 },
    windmillBottom: { x: 17, y: 2 },
    windmillSail: { x: 17, y: 3 },
    field1: { x: 2, y: 6 },
    field2: { x: 3, y: 6 },
};
type IngameTileName = keyof typeof ingameTilesheet;
type MenuTileName = keyof typeof menuTilesheet;
export type TileName = (IngameTileName | MenuTileName);
interface TileSrcItem {
    x: number,
    y: number,
    width?: number,
    height?: number,
    rotation?: number,
}

/** Defines the locations of the images on the tilesheet */
function getTilesheet(): {[key in TileName]: TilesheetEntry} {
    let tilesheet: {[key: string]: TilesheetEntry} = {};
    Object.keys(ingameTilesheet).forEach(tileName => {
        const { x, y, width, height, rotation } = ingameTilesheet[tileName as IngameTileName] as TileSrcItem;
        const offX = width ? (ingameTileSize - width) / 2 : 0;
        const offY = height ? (ingameTileSize - height) / 2 : 0;
        tilesheet[tileName] = {
            x: x * ingameTileSize + offX,
            y: y * ingameTileSize + offY,
            width: width || ingameTileSize,
            height: height || ingameTileSize,
            // set rotation if the original image does not look to the right
            rotation: rotation || 0,
        }
    });

    Object.keys(menuTilesheet).forEach(tileName => {
        const { x, y } = menuTilesheet[tileName as MenuTileName];
        tilesheet[tileName] = {
            x: x * 1.5 * menuTileSize + menuTilesheetOffsetX,
            y: y * 1.5 * menuTileSize + menuTilesheetOffsetY,
            width: menuTileSize,
            height: menuTileSize,
            rotation: 0,
        };
    });
    return tilesheet as {[key in TileName]: TilesheetEntry};
}
export const tilesheet = getTilesheet();
