"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
exports.RequestQueueCollection = void 0;
const prioritization = require("./prioritization");
const loggingEvents_1 = require("./loggingEvents");
/**
 * This data structure manages a queue of requests that have been made and requests that have been
 * sent to the OmniSharp server and are waiting on a response.
 */
class RequestQueue {
    constructor(_name, _maxSize, eventStream, _makeRequest) {
        this._name = _name;
        this._maxSize = _maxSize;
        this.eventStream = eventStream;
        this._makeRequest = _makeRequest;
        this._pending = [];
        this._waiting = new Map();
    }
    /**
     * Enqueue a new request.
     */
    enqueue(request) {
        this.eventStream.post(new loggingEvents_1.OmnisharpServerEnqueueRequest(this._name, request.command));
        this._pending.push(request);
    }
    /**
     * Dequeue a request that has completed.
     */
    dequeue(id) {
        const request = this._waiting.get(id);
        if (request) {
            this._waiting.delete(id);
            this.eventStream.post(new loggingEvents_1.OmnisharpServerDequeueRequest(this._name, "waiting", request.command, id));
        }
        return request;
    }
    cancelRequest(request) {
        let index = this._pending.indexOf(request);
        if (index !== -1) {
            this._pending.splice(index, 1);
            this.eventStream.post(new loggingEvents_1.OmnisharpServerDequeueRequest(this._name, "pending", request.command));
        }
        if (request.id) {
            this.dequeue(request.id);
        }
    }
    /**
     * Returns true if there are any requests pending to be sent to the OmniSharp server.
     */
    hasPending() {
        return this._pending.length > 0;
    }
    /**
     * Returns true if the maximum number of requests waiting on the OmniSharp server has been reached.
     */
    isFull() {
        return this._waiting.size >= this._maxSize;
    }
    /**
     * Process any pending requests and send them to the OmniSharp server.
     */
    processPending() {
        if (this._pending.length === 0) {
            return;
        }
        const availableRequestSlots = this._maxSize - this._waiting.size;
        this.eventStream.post(new loggingEvents_1.OmnisharpServerProcessRequestStart(this._name, availableRequestSlots));
        for (let i = 0; i < availableRequestSlots && this._pending.length > 0; i++) {
            const item = this._pending.shift();
            item.startTime = Date.now();
            const id = this._makeRequest(item);
            this._waiting.set(id, item);
            if (this.isFull()) {
                break;
            }
        }
        this.eventStream.post(new loggingEvents_1.OmnisharpServerProcessRequestComplete());
    }
}
class RequestQueueCollection {
    constructor(eventStream, concurrency, makeRequest) {
        this._priorityQueue = new RequestQueue('Priority', 1, eventStream, makeRequest);
        this._normalQueue = new RequestQueue('Normal', concurrency, eventStream, makeRequest);
        this._deferredQueue = new RequestQueue('Deferred', Math.max(Math.floor(concurrency / 4), 2), eventStream, makeRequest);
    }
    getQueue(command) {
        if (prioritization.isPriorityCommand(command)) {
            return this._priorityQueue;
        }
        else if (prioritization.isNormalCommand(command)) {
            return this._normalQueue;
        }
        else {
            return this._deferredQueue;
        }
    }
    isEmpty() {
        return !this._deferredQueue.hasPending()
            && !this._normalQueue.hasPending()
            && !this._priorityQueue.hasPending();
    }
    enqueue(request) {
        const queue = this.getQueue(request.command);
        queue.enqueue(request);
        this.drain();
    }
    dequeue(command, seq) {
        const queue = this.getQueue(command);
        return queue.dequeue(seq);
    }
    cancelRequest(request) {
        const queue = this.getQueue(request.command);
        queue.cancelRequest(request);
    }
    drain() {
        if (this._isProcessing) {
            return false;
        }
        if (this._priorityQueue.isFull()) {
            return false;
        }
        if (this._normalQueue.isFull() && this._deferredQueue.isFull()) {
            return false;
        }
        this._isProcessing = true;
        if (this._priorityQueue.hasPending()) {
            this._priorityQueue.processPending();
            this._isProcessing = false;
            return;
        }
        if (this._normalQueue.hasPending()) {
            this._normalQueue.processPending();
        }
        if (this._deferredQueue.hasPending()) {
            this._deferredQueue.processPending();
        }
        this._isProcessing = false;
    }
}
exports.RequestQueueCollection = RequestQueueCollection;
//# sourceMappingURL=requestQueue.js.map