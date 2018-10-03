"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function asyn(func, opts) {
    return ((...args) => {
        return func(...args);
    });
}
exports.asyn = asyn;
//# sourceMappingURL=asyn.js.map