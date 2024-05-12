"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const stream_1 = __importDefault(require("./stream"));
// to mirror the dart stream interface, we want to get rid of the extra
// methods created to add and listen to events on the stream directly.
/** @ignore */
const _validProp = (prop) => {
    const blacklist = new Set([
        "addEventListener",
        "removeEventListener",
        "add",
        "addError",
        "pause",
        "resume",
        "cancel",
        "close",
        "isPaused",
        "isClosed",
    ]);
    return !blacklist.has(prop) && prop[0] !== "_";
};
/** @ignore */
const createStreamProxy = (stream) => {
    const target = {};
    Object.getOwnPropertyNames(stream_1.default.prototype).forEach((prop) => {
        if (!_validProp(prop))
            return;
        if (typeof stream[prop] === "function") {
            target[prop] = stream[prop].bind(stream);
        }
        else {
            Object.defineProperty(target, prop, {
                get: () => stream[prop],
                configurable: false,
                enumerable: true,
            });
        }
    });
    return target;
};
class StreamController {
    /**
     * StreamController Constructor
     *
     * Controller that allows sending data, error and done events on its stream.
     * This class is used to control and expose a stream that other code can listen to.
     *
     * @param params listeners: onListen, onPause, onResume, onCancel
     * @template T the type of data to be passed on the stream
     */
    constructor(params = { broadcast: false }) {
        this._done = Promise.resolve();
        this._onListen = () => {
            if (this.onListen) {
                this.onListen();
            }
        };
        this._onPause = () => {
            if (this.onPause) {
                this.onPause();
            }
        };
        this._onResume = () => {
            if (this.onResume) {
                this.onResume();
            }
        };
        this._onCancel = () => {
            if (this.onCancel) {
                this.onCancel();
            }
        };
        this._srcStream = new stream_1.default();
        this._sink = new _streamSink(this);
        if (params.broadcast) {
            this._dstStream = this._srcStream.asBroadcastStream();
        }
        else {
            this._dstStream = this._srcStream;
        }
        this._streamProxy = createStreamProxy(this._dstStream);
        this.onListen = params.onListen;
        this.onPause = params.onPause;
        this.onResume = params.onResume;
        this.onCancel = params.onCancel;
        this._dstStream.addEventListener("onListen", this._onListen);
        this._dstStream.addEventListener("onPause", this._onPause);
        this._dstStream.addEventListener("onResume", this._onResume);
        this._dstStream.addEventListener("onCancel", this._onCancel);
    }
    add(data) {
        this._srcStream.add(data);
    }
    addError(error) {
        this._srcStream.addError(error);
    }
    addStream(stream, options = { cancelOnError: false }) {
        const p = new Promise((resolve) => {
            stream.listen(this.add.bind(this), {
                onDone: resolve,
                onError: (e) => {
                    this.addError(e);
                    if (options.cancelOnError)
                        resolve();
                },
                cancelOnError: options.cancelOnError,
            });
        });
        this._done = p;
        return p;
    }
    close() {
        this._srcStream.close();
    }
    get stream() {
        return this._streamProxy;
    }
    get sink() {
        return this._sink;
    }
    get isPaused() {
        return this._srcStream.isPaused;
    }
    get isClosed() {
        return this._srcStream.isClosed;
    }
    get done() {
        return this._done;
    }
    static broadcast() {
        return new StreamController({ broadcast: true });
    }
}
exports.default = StreamController;
/**
 * Object that only contains add, addError and close methods
 * for a given stream.
 */
/** @ignore */
class _streamSink {
    constructor(_streamController) {
        this._streamController = _streamController;
    }
    add(data) {
        this._streamController.add(data);
    }
    addError(error) {
        this._streamController.addError(error);
    }
    addStream(stream, options = { cancelOnError: false }) {
        return this._streamController.addStream(stream, options);
    }
    close() {
        this._streamController.close();
    }
    get done() {
        return this._streamController.done;
    }
}
