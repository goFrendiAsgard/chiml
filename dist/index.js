"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const require_cache_1 = require("@speedy/require-cache");
new require_cache_1.RequireCache({ cacheKiller: __dirname + "/package.json" }).start();
const Logger_1 = require("./classes/Logger");
exports.Logger = Logger_1.Logger;
const tools_1 = require("./libraries/tools");
exports.compile = tools_1.compile;
exports.copyMultiDirs = tools_1.copyMultiDirs;
exports.execute = tools_1.execute;
exports.getCompiledScript = tools_1.getCompiledScript;
exports.getFiles = tools_1.getFiles;
const utilities_1 = require("./libraries/utilities");
exports.__cmd = utilities_1.__cmd;
exports.__parseIns = utilities_1.__parseIns;
exports.sys = utilities_1.sys;
//# sourceMappingURL=index.js.map