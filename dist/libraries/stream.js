"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
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
