"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const require_cache_1 = require("@speedy/require-cache");
new require_cache_1.RequireCache({ cacheKiller: __dirname + "../package.json" }).start();
function readFromStream(stream) {
    return new Promise((resolve, reject) => {
        const chunks = [];
        stream.on("error", reject);
        stream.on("data", (chunk) => chunks.push(chunk));
        stream.on("end", () => {
            const data = Buffer.concat(chunks).toString();
            resolve(data);
        });
    });
}
exports.readFromStream = readFromStream;
//# sourceMappingURL=stream.js.map