"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = require("fs");
const path_1 = require("path");
const fileName = path_1.join(__dirname, "../event.json");
function append(line) {
    return __awaiter(this, void 0, void 0, function* () {
        return new Promise((resolve, reject) => {
            read()
                .then((eventList) => {
                eventList.push(line);
                try {
                    const content = JSON.stringify(eventList, null, 2);
                    fs_1.writeFile(fileName, content, (error) => {
                        if (error) {
                            return reject(error);
                        }
                        resolve(content);
                    });
                }
                catch (parseError) {
                    reject(parseError);
                }
            })
                .catch((readError) => {
                reject(readError);
            });
        });
    });
}
exports.append = append;
function read() {
    return __awaiter(this, void 0, void 0, function* () {
        return new Promise((resolve, reject) => {
            fs_1.readFile(fileName, (readError, content) => {
                if (readError) {
                    return reject(readError);
                }
                try {
                    return resolve(JSON.parse(String(content)));
                }
                catch (parseError) {
                    return reject(parseError);
                }
            });
        });
    });
}
exports.read = read;
