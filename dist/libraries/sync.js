"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function sync(func, opts) {
    return ((...args) => {
        try {
            const result = func(...args);
            return Promise.resolve(result);
        }
        catch (error) {
            return Promise.reject(error);
        }
    });
}
exports.sync = sync;
//# sourceMappingURL=sync.js.map