"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.poll = exports.pollDoesNotHappen = exports.assertWithPoll = void 0;
function defaultAssertion(value) {
    if (value === undefined) {
        throw "Default assertion of poll: Excepted value not to be undefined.";
    }
    if (Array.isArray(value) && value.length === 0) {
        throw "Default assertion of poll: Value was array but it got length of '0'.";
    }
}
function assertWithPoll(getValue, duration, step, assertForValue = defaultAssertion) {
    return __awaiter(this, void 0, void 0, function* () {
        let assertResult = undefined;
        while (duration > 0) {
            let value = yield getValue();
            try {
                assertResult = undefined;
                assertForValue(value);
            }
            catch (error) {
                assertResult = error;
            }
            if (assertResult === undefined) {
                return;
            }
            yield sleep(step);
            duration -= step;
        }
        throw assertResult;
    });
}
exports.assertWithPoll = assertWithPoll;
function defaultPollExpression(value) {
    return value !== undefined && ((Array.isArray(value) && value.length > 0) || (!Array.isArray(value) && !!value));
}
function pollDoesNotHappen(getValue, duration, step, expression = defaultPollExpression) {
    return __awaiter(this, void 0, void 0, function* () {
        while (duration > 0) {
            let value = yield getValue();
            if (expression(value)) {
                throw new Error("Polling succeeded within the alotted duration, but should not have.");
            }
            yield sleep(step);
            duration -= step;
        }
        // Successfully never happened
    });
}
exports.pollDoesNotHappen = pollDoesNotHappen;
function poll(getValue, duration, step, expression = defaultPollExpression) {
    return __awaiter(this, void 0, void 0, function* () {
        while (duration > 0) {
            let value = yield getValue();
            if (expression(value)) {
                return value;
            }
            yield sleep(step);
            duration -= step;
        }
        throw new Error("Polling did not succeed within the alotted duration.");
    });
}
exports.poll = poll;
function sleep(ms = 0) {
    return __awaiter(this, void 0, void 0, function* () {
        return new Promise(r => setTimeout(r, ms));
    });
}
//# sourceMappingURL=poll.js.map