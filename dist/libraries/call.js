"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function call(func, opts) {
    return (...args) => {
        return new Promise((resolve, reject) => {
            function callback(err, ...result) {
                if (err) {
                    return reject(err);
                }
                if (result.length === 1) {
                    return resolve(result[0]);
                }
                return resolve(result);
            }
            args.push(callback);
            func(...args);
        });
    };
}
exports.call = call;
//# sourceMappingURL=call.js.map