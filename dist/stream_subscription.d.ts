import { StreamListener, StreamListenOptions, StreamMessage } from "./types";
import Stream from "./stream";
export interface StreamSubscriptionActions {
    pause: () => void;
    resume: () => void;
    cancel: () => void;
}
export default class StreamSubscription<T> implements StreamSubscriptionActions {
    private stream;
    private onData;
    private listenOptions;
    private _buffer;
    private _isPaused;
    constructor(stream: Stream<T>, onData: StreamListener<T>, listenOptions?: StreamListenOptions);
    private _emit;
    messageHandler(message: StreamMessage<T>): void;
    pause(): void;
    resume(): void;
    cancel(): void;
    get isPaused(): boolean;
}
//# sourceMappingURL=stream_subscription.d.ts.map