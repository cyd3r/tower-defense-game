/**
 * https://artandlogic.com/2019/07/unlocking-the-web-audio-api/
 */
export class BufferLoader {
    constructor() {
        this._af_buffers = new Map();
        this._audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        this._isUnlocked = false;
        this._unlockAudio();
        BufferLoader.singleton = this;
    }
    
    /**
     * A shim to handle browsers which still expect the old callback-based decodeAudioData,
     * notably iOS Safari - as usual.
     * @param arraybuffer
     * @returns {Promise<any>}
     * @private
     */
    _decodeShim(arraybuffer) {
        return new Promise((resolve, reject) => {
            this._audioCtx.decodeAudioData(arraybuffer, (buffer) => {
                return resolve(buffer);
            }, (err) => {
                return reject(err);
            });
        });
    }
    
    /**
     * Some browsers/devices will only allow audio to be played after a user interaction.
     * Attempt to automatically unlock audio on the first user interaction.
     * Concept from: http://paulbakaus.com/tutorials/html5/web-audio-on-ios/
     * Borrows in part from: https://github.com/goldfire/howler.js/blob/master/src/howler.core.js
     */
    _unlockAudio() {
        if (this._isUnlocked) return;

        // Scratch buffer to prevent memory leaks on iOS.
        // See: https://stackoverflow.com/questions/24119684/web-audio-api-memory-leaks-on-mobile-platforms
        const _scratchBuffer = this._audioCtx.createBuffer(1, 1, 22050);

        // We call this when user interaction will allow us to unlock
        // the audio API.
        let unlock = () => {
            let source = this._audioCtx.createBufferSource();
            source.buffer = _scratchBuffer;
            source.connect(this._audioCtx.destination);

            // Play the empty buffer.
            source.start(0);

            // Calling resume() on a stack initiated by user gesture is
            // what actually unlocks the audio on Chrome >= 55.
            if (typeof this._audioCtx.resume === 'function') {
                this._audioCtx.resume();
            }

            // Once the source has fired the onended event, indicating it did indeed play,
            // we can know that the audio API is now unlocked.
            source.onended = function () {
                source.disconnect(0);

                // Don't bother trying to unlock the API more than once!
                this._isUnlocked = true;
                BufferLoader.startAtmo();

                // Remove the click/touch listeners.
                document.removeEventListener('touchstart', unlock, true);
                document.removeEventListener('touchend', unlock, true);
                document.removeEventListener('click', unlock, true);
            };
        };

        // Setup click/touch listeners to capture the first interaction
        // within this context.
        document.addEventListener('touchstart', unlock, true);
        document.addEventListener('touchend', unlock, true);
        document.addEventListener('click', unlock, true);
    }
    
    /**
     * Allow the requester to load a new sfx, specifying a file to load.
     * We store the decoded audio data for future (re-)use.
     * @param {string} sfxFile
     * @returns {Promise<AudioBuffer>}
     */
    async load (sfxFile) {
        if (this._af_buffers.has(sfxFile)) {
            return this._af_buffers.get(sfxFile);
        }
        const _sfxFile = await fetch(sfxFile);
        const arraybuffer = await _sfxFile.arrayBuffer();
        let audiobuffer;

        try {
            audiobuffer = await this._audioCtx.decodeAudioData(arraybuffer);
        } catch (e) {
            // Browser wants older callback based usage of decodeAudioData
            audiobuffer = await this._decodeShim(arraybuffer);
        }

        this._af_buffers.set(sfxFile, audiobuffer);

        return audiobuffer;
    };
    
    /**
     * Play the specified file, loading it first - either retrieving it from the saved buffers, or fetching
     * it from the network.
     * @param sfxFile
     * @returns {Promise<AudioBufferSourceNode>}
     */
    playFile(sfxFile, volume) {
        return this.load(sfxFile).then((audioBuffer) => {
            const sourceNode = this._audioCtx.createBufferSource(),
                gainNode = this._audioCtx.createGain();
            sourceNode.buffer = audioBuffer;
            sourceNode.connect(gainNode);
            gainNode.connect(this._audioCtx.destination);
            gainNode.gain.value = volume || 1;
            sourceNode.start();

            return sourceNode;
        });
    };

    async loadAll() {
        const promises = Object.keys(SOUNDS).flatMap(key => SOUNDS[key].files.map(file => this.load(file)));
        await Promise.all(promises);
    }
    static play(sfxName) {
        const sound = SOUNDS[sfxName];
        if (sound) {
            const filename = sound.files[Math.floor(Math.random() * sound.files.length)];
            return BufferLoader.singleton.playFile(filename, sound.volume);
        } else {
            console.warn(sfxName, 'is not a registered name for a sound group');
        }
    }
    static startAtmo() {
        document.querySelector('audio.atmo').play();
    }
    static stopAtmo() {
        document.querySelector('audio.atmo').pause();
    }
}

const SOUNDS = {
    tankExplosion: {
        files: ['./src/audio/zapsplat/Blastwave_FX_CarExplosionDebris_HV.132.mp3'],
        volume: 0.5,
    },
    planeDestroy: {
        files: [
            'src/audio/zapsplat/zapsplat_vehicles_plane_light_prop_crash_explode_ext_001_31740.mp3',
            'src/audio/zapsplat/zapsplat_vehicles_plane_light_prop_crash_explode_ext_002_31741.mp3',
            'src/audio/zapsplat/zapsplat_vehicles_plane_light_prop_crash_explode_ext_003_31742.mp3',
        ],
        volume: 0.25,
    },
    missileLaunch: {
        files: [
            './src/audio/zapsplat/zapsplat_warfare_missile_rocket_small_launch_fizz_whoosh_001_62721.mp3',
            './src/audio/zapsplat/zapsplat_warfare_missile_rocket_small_launch_fizz_whoosh_002_62722.mp3',
            './src/audio/zapsplat/zapsplat_warfare_missile_rocket_small_launch_fizz_whoosh_003_62723.mp3',
            './src/audio/zapsplat/zapsplat_warfare_missile_rocket_small_launch_fizz_whoosh_004_62724.mp3',
            './src/audio/zapsplat/zapsplat_warfare_missile_rocket_small_launch_fizz_whoosh_005_62725.mp3',
            './src/audio/zapsplat/zapsplat_warfare_missile_rocket_small_launch_fizz_whoosh_006_62726.mp3',
            './src/audio/zapsplat/zapsplat_warfare_missile_rocket_small_launch_fizz_whoosh_007_62727.mp3',
        ],
        volume: 0.3,
    },
    cannonFire: {
        files: [
            './src/audio/zapsplat/zapsplat_warfare_mortar_projectile_launch_001_25231.mp3',
            './src/audio/zapsplat/zapsplat_warfare_mortar_projectile_launch_002_25232.mp3',
            './src/audio/zapsplat/zapsplat_warfare_mortar_projectile_launch_003_25233.mp3',
            './src/audio/zapsplat/zapsplat_warfare_mortar_projectile_launch_004_25234.mp3',
        ],
        volume: 0.5,
    },
    towerBoot: {
        files: [
            './src/audio/zapsplat/PM_FSSF2_WEAPONS_J4_FOLEY_RELOAD_PICKUP_HANDLING_326.mp3',
        ],
        volume: 0.5,
    },
    coin: {
        files: [
            './src/audio/kenney_rpgaudio/handleCoins.ogg',
            './src/audio/kenney_rpgaudio/handleCoins2.ogg',
        ],
        volume: 0.5,
    },
    missileImpact: {
        files: [
            './src/audio/zapsplat/zapsplat_science_fictyion_explosion_puff_smoke_medium_001_45027.mp3',
            './src/audio/zapsplat/zapsplat_science_fictyion_explosion_puff_smoke_medium_002_45028.mp3'
        ],
        volume: 0.5,
    },
    waveStarted: {
        files: ['./src/audio/kenney_voiceoverfighter/begin.ogg'],
        volume: 0.5,
    },
    gameOverVictory: {
        files: ['./src/audio/kenney_voiceoverfighter/you_win.ogg'],
        volume: 0.5,
    },
    gameOverLost: {
        files: ['./src/audio/kenney_voiceoverfighter/you_lose.ogg'],
        volume: 0.5,
    },
    ouch: {
        files: [
            'src/audio/zapsplat/zapsplat_human_male_grunt_ouch_pain_001_15714.mp3',
            'src/audio/zapsplat/zapsplat_human_male_grunt_ouch_pain_002_15715.mp3',
        ],
        volume: 0.5,
    },
    baseReached: {
        files: [
            './src/audio/zapsplat/ftus_musical_instrument_gong_small_gamelan_hit_soft_001_524.mp3',
            './src/audio/zapsplat/ftus_musical_instrument_gong_small_gamelan_hit_soft_002_525.mp3',
            './src/audio/zapsplat/ftus_musical_instrument_gong_small_gamelan_hit_soft_003_526.mp3',
        ],
        volume: 0.5,
    },
    aacImpactFlesh: {
        files: [
            'src/audio/zapsplat/zapsplat_foley_clothing_thick_jacket_punch_sweetener_001_61704.mp3',
            'src/audio/zapsplat/zapsplat_foley_clothing_thick_jacket_punch_sweetener_002_61705.mp3',
            'src/audio/zapsplat/zapsplat_foley_clothing_thick_jacket_punch_sweetener_003_61706.mp3',
            'src/audio/zapsplat/zapsplat_foley_clothing_thick_jacket_punch_sweetener_004_61707.mp3',
            'src/audio/zapsplat/zapsplat_foley_clothing_thick_jacket_punch_sweetener_005_61708.mp3',
            'src/audio/zapsplat/zapsplat_foley_clothing_thick_jacket_punch_sweetener_006_61709.mp3',
            'src/audio/zapsplat/zapsplat_foley_clothing_thick_jacket_punch_sweetener_007_61710.mp3',
        ],
        volume: 0.02,
    },
    aacImpactMetal: {
        files: [
            'src/audio/zapsplat/zapsplat_warfare_bullet_hit_metal_001_43600_edit.mp3',
            'src/audio/zapsplat/zapsplat_warfare_bullet_hit_metal_002_43601_edit.mp3',
            'src/audio/zapsplat/zapsplat_warfare_bullet_hit_metal_003_43602_edit.mp3',
            'src/audio/zapsplat/zapsplat_warfare_bullet_hit_metal_004_43603_edit.mp3',
        ],
        volume: 0.01,
    }
};
