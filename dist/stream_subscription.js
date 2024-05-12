"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const types_1 = require("./types");
class StreamSubscription {
    constructor(stream, onData, listenOptions = {}) {
        this.stream = stream;
        this.onData = onData;
        this.listenOptions = listenOptions;
        this._buffer = [];
        this._isPaused = false;
    }
    _emit() {
        if (this._isPaused)
            return;
        this._buffer.forEach((m) => {
            switch (m.type) {
                case types_1.StreamMessageType.Data:
                    this.onData(m.data);
                    break;
                case types_1.StreamMessageType.Error:
                    if (this.listenOptions.onError) {
                        this.listenOptions.onError(m.data);
                    }
                    if (this.listenOptions.cancelOnError) {
                        this.cancel();
                    }
                    break;
                case types_1.StreamMessageType.Done:
                    if (this.listenOptions.onDone) {
                        this.listenOptions.onDone();
                    }
                    break;
            }
        });
        this._buffer = [];
    }
    messageHandler(message) {
        this._buffer.push(message);
        this._emit();
    }
    pause() {
        if (!this._isPaused) {
            this._isPaused = true;
            if (this.listenOptions.onPause) {
                this.listenOptions.onPause();
            }
            this.stream.pause();
        }
    }
    resume() {
        if (this._isPaused) {
            this._isPaused = false;
            if (this.listenOptions.onResume) {
                this.listenOptions.onResume();
            }
            this.stream.resume();
            this._emit();
        }
    }
    cancel() {
        this.stream.cancel(this);
    }
    get isPaused() {
        return this._isPaused;
    }
}
exports.default = StreamSubscription;
