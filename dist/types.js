"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StreamMessageType = void 0;
/**
 * streamMessageType - the types a message can be
 */
var StreamMessageType;
(function (StreamMessageType) {
    StreamMessageType[StreamMessageType["Data"] = 0] = "Data";
    StreamMessageType[StreamMessageType["Error"] = 1] = "Error";
    StreamMessageType[StreamMessageType["Done"] = 2] = "Done";
})(StreamMessageType || (exports.StreamMessageType = StreamMessageType = {}));
