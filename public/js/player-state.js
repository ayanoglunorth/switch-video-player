

const PlayerState = {

    pairId: null,
    pair: null,

    activeAngle: 1,

    isPlaying: false,
    playbackRate: 1.0,
    volume: 1.0,
    isMuted: false,
    currentTime: 0,

    buffer1Pct: 0,
    buffer2Pct: 0,
    bothBuffered: false,

    BUFFER_THRESHOLD: 3,

    isFullscreen: false,
    uiVisible: true,
    uiHideTimer: null,
    UI_HIDE_DELAY: 3000,

    isConnected: true,
    reconnectTimer: null,

    isSwitching: false,

    settings: null,

    video1: null,
    video2: null,
    controls: null,



    get activeVideo() {
        return this.activeAngle === 1 ? this.video1 : this.video2;
    },

    get bgVideo() {
        return this.activeAngle === 1 ? this.video2 : this.video1;
    },

    bgTimeFromActive(activeTime) {
        if (!this.pair) return activeTime;
        const offset = this.pair.syncOffset || 0;

        if (this.activeAngle === 1) {
            return activeTime - offset;
        } else {
            return activeTime + offset;
        }
    },

    activeTimeFromBg(bgTime) {
        if (!this.pair) return bgTime;
        const offset = this.pair.syncOffset || 0;
        if (this.activeAngle === 1) {
            return bgTime + offset;
        } else {
            return bgTime - offset;
        }
    },

    SPEED_STEPS: [0.25, 0.5, 0.75, 1.0, 1.25, 1.5, 1.75, 2.0],

    reset() {
        this.isPlaying = false;
        this.playbackRate = 1.0;
        this.isMuted = false;
        this.currentTime = 0;
        this.buffer1Pct = 0;
        this.buffer2Pct = 0;
        this.bothBuffered = false;
        this.isFullscreen = false;
        this.uiVisible = true;
        this.isConnected = true;
        this.isSwitching = false;
        this.activeAngle = 1;
        clearTimeout(this.uiHideTimer);
        clearTimeout(this.reconnectTimer);
    },
};
