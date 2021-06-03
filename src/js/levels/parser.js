import { Vector } from '../engine/Vector.js';

const DOWN = new Vector(0, 1);
const UP = DOWN.mult(-1);
const RIGHT = new Vector(1, 0);
const LEFT = RIGHT.mult(-1);

const PROP_NAMES = {
    '*': 'treeStar',
    'o': 'treeSmall',
    'O': 'treeBig',
    '0': 'treeBigRound',
    '+': 'tree3',
    '.': 'rockSmall',
    ',': 'rockMedium',
    ':': 'rockLarge',
    'P': 'spawnMarker',
};

function getCell(terrain, position) {
    // out of bounds?
    if (position.x < 0 || position.y < 0 || position.y > terrain.length - 1 || position.x > terrain[position.y].length - 1) {
        return null;
    }
    return terrain[position.y][position.x];
}

function isGras(terrain, position) {
    const cell = getCell(terrain, position);
    return cell && cell !== 'x' && cell !== '#';
}

function readTerrain(terrainStr) {
    let lines = terrainStr.split('\n');
    // first line can be empty (looks better in multiline string)
    if (lines[0] === '') {
        lines.splice(0, 1);
    }
    const levelWidth = lines.reduce((width, line) => Math.max(width, line.length), 0);
    return lines.map(line => line + ' '.repeat(levelWidth - line.length));
}

function getTilename(terrain, position) {
    if (isGras(terrain, position)) {
        return 'gras';
    }

    if (isGras(terrain, position.add(DOWN))) {
        if (isGras(terrain, position.add(RIGHT))) {
            return 'roadTopLeftSharp';
        } else if (isGras(terrain, position.add(LEFT))) {
            return 'roadTopRightSharp';
        }
        return 'roadTop';
    } else if (isGras(terrain, position.add(UP))) {
        if (isGras(terrain, position.add(RIGHT))) {
            return 'roadBottomLeftSharp';
        } else if (isGras(terrain, position.add(LEFT))) {
            return 'roadBottomRightSharp';
        }
        return 'roadBottom';
    } else if (isGras(terrain, position.add(LEFT))) {
        return 'roadRight';
    } else if (isGras(terrain, position.add(RIGHT))) {
        return 'roadLeft';
    } else {
        if (isGras(terrain, position.add(UP).add(LEFT))) {
            return 'roadBottomRight';
        } else if (isGras(terrain, position.add(UP).add(RIGHT))) {
            return 'roadBottomLeft';
        } else if (isGras(terrain, position.add(DOWN).add(LEFT))) {
            return 'roadTopRight';
        } else if (isGras(terrain, position.add(DOWN).add(RIGHT))) {
            return 'roadTopLeft';
        }
    }
    return 'road';
}

function createRoute(terrain, goalPos) {
    const levelHeight = terrain.length;
    const levelWidth = terrain[0].length;
    let walkDir;
    if (goalPos.y === 0) {
        walkDir = new Vector(0, 1);
    } else if (goalPos.y === levelHeight - 1) {
        walkDir = new Vector(0, -1);
    } else if (goalPos.x === 0) {
        walkDir = new Vector(1, 0);
    } else if (goalPos.x === levelWidth - 1) {
        walkDir = new Vector(-1, 0);
    } else {
        throw 'Goal is not at the border';
    }

    let route = []
    let currPos = goalPos;
    route.push(currPos.sub(walkDir.flipRight().mult(.5)))
    while (true) {
        const walkRight = walkDir.flipRight();
        const walkLeft = walkRight.mult(-1);

        const cell_straight = getCell(terrain, currPos.add(walkDir));

        if ((getCell(terrain, currPos.add(walkRight)) ?? ' ') === 'x') {
            route.push(currPos.add(walkDir.mult(.5)).add(walkLeft.mult(.5)));
            walkDir = walkRight;
        } else if (cell_straight === null || cell_straight === 'x') {
            if (cell_straight === null) {
                break;
            }
        } else if ((getCell(terrain, currPos.add(walkLeft)) ?? ' ') === 'x') {
            route.push(currPos.sub(walkDir.mult(.5)).add(walkLeft.mult(.5)));
            walkDir = walkLeft;
        }

        currPos = currPos.add(walkDir);
    }

    route.push(currPos.sub(walkDir.flipRight().mult(.5)));

    route.reverse();
    return route;
}

function findPlaneSpawns(terrain) {
    const levelHeight = terrain.length;
    const levelWidth = terrain[0].length;

    const spawns = [];

    for (let row = 0; row < levelHeight; row += 1) {
        for (let col = 0; col < levelWidth; col += 1) {
            const position = new Vector(col, row);
            if (getCell(terrain, position) === 'P') {
                spawns.push(position);
            }
        }
    }
    return spawns;
}

/** Creates `tiles` and `route` from `terrainStr`
## Level Format
The first line can be left empty.
Meaning of the characters:
+ empty space: gras
+ `x`: road, walkable by enemies. **IMPORTANT**: Always place two lines of `x`as the road!
+ `#`: road, also goal for the enemies to reach. Only set this once!
+ `*`: star shaped tree
+ `+`: small tree with three leaves
+ `o`: small tree
+ `O`: big tree
+ `0`: big round tree
+ `.`: small rock
+ `,`: medium rock
+ `:`: large rock
*/
export function parseTerrain(terrainStr) {
    const terrain = readTerrain(terrainStr);
    const levelHeight = terrain.length;
    const levelWidth = terrain[0].length;

    let goalPos = undefined;

    let tiles = [];
    // only 4 row cells are allowed to be at the border
    let numRoadsAtBorder = 0;

    for (let row = 0; row < levelHeight; row += 1) {
        for (let col = 0; col < levelWidth; col += 1) {
            const position = new Vector(col, row);
            if (getCell(terrain, position) === '#') {
                // only store one goalPos for routing later
                // this position must be on the left side of the road when walking towards the base
                if (goalPos === undefined
                    || (goalPos.x === 0 && position.x === 0 && goalPos.y === position.y - 1)
                    || (goalPos.y === levelHeight - 1 && position.y === levelHeight - 1 && goalPos.x === position.x - 1)) {
                    goalPos = position;
                }
            }

            if ((position.x === 0 || position.y === 0 || position.x === levelWidth - 1 || position.y === levelHeight - 1) && !isGras(terrain, position)) {
                numRoadsAtBorder += 1;
            }

            tiles.push({
                position,
                type: getTilename(terrain, position),
                prop: PROP_NAMES[terrain[row][col]],
            });
        }
    }

    if(numRoadsAtBorder !== 4) {
        throw `There must be exactly 4 roads (two "#" and two "x") at the border, found ${numRoadsAtBorder} instead`;
    }

    if (!goalPos) {
        throw 'Goal position must be set (using the # character)';
    }

    const route = createRoute(terrain, goalPos);
    const planeSpawns = findPlaneSpawns(terrain);

    return { tiles, route, planeSpawns };
}

export function createHintElements(hintStr) {
    return hintStr.split('\n')
    .filter(line => line !== '')
    .map(line => {
        if (line.startsWith('# ')) {
            const header = document.createElement('h3');
            header.classList.add('white-shadow');
            header.innerText = line.substr(2);
            return header;
        } else if (line.startsWith('! ')) {
            const img = document.createElement('img');
            const [_, src, width] = line.split(' ');
            img.src = src;
            img.style.width = width;
            return img;
        } else {
            const text = document.createElement('p');
            text.innerHTML = line.split('*').map((v, i) => {
                if (i % 2 === 1) {
                    return `<em>${v}</em>`;
                }
                return v;
            }).reduce((txt, p) => txt + p);
            return text;
        }
    });
}
