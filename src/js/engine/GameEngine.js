import { Vector } from './Vector.js';

// if the frames are more apart than SAFE_DELTATIME, the canvas is not drawn ATM
// therefore, relying on deltaTime will result in very weird consequences (e.g. enemies overshooting the path)
// skip the frame to prevent this
const SAFE_DELTATIME = .2;

export class GameEngine {
    /** @type {GameEngine} */
    static singleton = undefined;
    /** Creates a new engine
     * @param screen The canvas element
     * @param tilesheet The tilesheet element
     * @param onUpdate Is called every frame
     * @param onClick Triggered when the player clicks on the canvas.
     * Parameter: relative position to the canvas as `Vector`
     * @param {string[]} layers Sets the draw order for the layers. The first layers are drawn first.
     */
    constructor(screen, tilesheet, onUpdate, onClick, layers) {
        this.hasError = false;
        this.screen = screen;
        this.tilesheet = tilesheet;
        this.renderContext = this.screen.getContext('2d');

        this.lastUpdateTime = performance.now();
        this.onUpdate = onUpdate;
        this.onClick = onClick;

        this.layers = layers;
        this.drawables = {};
        this.layers.forEach(layer => this.drawables[layer] = []);

        this.cursorPosition = new Vector(0, 0);

        this.screen.addEventListener('click', event => {
            this.cursorPosition = this.getMousePos(event);
            this.onClick(this.cursorPosition);
        });
        this.screen.addEventListener('mousemove', event => {
            this.cursorPosition = this.getMousePos(event);
        });

        this.deltaTime = 0;
        this.timeSinceStartup = 0;

        GameEngine.singleton = this;
    }

    /** Time since last frame in seconds */
    static get deltaTime() {
        return GameEngine.singleton.deltaTime;
    }
    /** Active time since the GameEngine was constructed in seconds.
     * Note that active time does not include skipped frames.
     * If replaced with `performance.now()`, keep in mind to multiply by 1000.
     */
    static get timeSinceStartup() {
        return GameEngine.singleton.timeSinceStartup;
    }

    static get width() {
        return GameEngine.singleton.screen.width;
    }
    static get height() {
        return GameEngine.singleton.screen.height;
    }

    getMousePos(event) {
        // https://stackoverflow.com/a/17130415
        const rect = this.screen.getBoundingClientRect();
        const scaleX = this.screen.width / rect.width;
        const scaleY = this.screen.height / rect.height;
    
        return new Vector(
            (event.clientX - rect.left) * scaleX,
            (event.clientY - rect.top) * scaleY,
        );
    }

    reset() {
        this.renderContext.clearRect(0, 0, this.screen.width, this.screen.height);
    }

    registerDrawable(drawable, layer) {
        if (this.drawables[layer] === undefined) {
            console.error(layer, 'is not a valid layer');
        } else if (typeof(drawable.isDestroyed) !== 'boolean') {
            console.error('Drawable has no isDestroyed set to a boolean value and will not be rendered', drawable)
        } else {
            this.drawables[layer].push(drawable);
        }
    }

    gameLoop() {
        // if there is an error, stop the game loop
        // we don't want to spam the console with error messages
        if (this.hasError) {
            return;
        }
        this.hasError = true;

        requestAnimationFrame(this.gameLoop.bind(this));
        const now = performance.now();
        // if the frames are more apart than the safe deltatime, the canvas is not drawn ATM
        // therefore, relying on deltaTime will result in very weird consequences
        // skip the frame to prevent this
        // https://stackoverflow.com/a/13133464
        this.deltaTime = (now - this.lastUpdateTime) / 1000;
        if (this.deltaTime < SAFE_DELTATIME) {
            this.timeSinceStartup += this.deltaTime;
            this.reset();

            this.onUpdate();

            // draw registered game objects
            for (let layer of this.layers) {
                this.drawables[layer] = this.drawables[layer].filter(go => {
                    if (!go.isDestroyed) {
                        go.draw(this.renderContext, this.tilesheet);
                    }
                    return !go.isDestroyed;
                });
            }
        }

        this.lastUpdateTime = now;

        // if there is an error inside a game loop step this line won't be reached
        this.hasError = false;
    }
}
