"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function addToObj(obj, keyParts, value) {
    if (keyParts.length < 1 || !(keyParts[0] in obj)) {
        return obj;
    }
    const key = keyParts[0];
    obj[key] = keyParts.length === 1 ? value : addToObj(obj[key], keyParts.slice(1), value);
    return obj;
}
function cascade(obj, env = process.env) {
    for (const key in env) {
        if (key in env) {
            const keyParts = key.split("_");
            let value;
            try {
                value = JSON.parse(env[key]);
            }
            catch (error) {
                value = env[key];
            }
            obj = addToObj(obj, keyParts, value);
        }
    }
    return obj;
}
exports.cascade = cascade;
