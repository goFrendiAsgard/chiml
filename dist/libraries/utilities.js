"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const WebApp_1 = require("../classes/WebApp");
const cmd_1 = require("./cmd");
exports.__cmd = cmd_1.cmdComposedCommand;
const stringUtil_1 = require("./stringUtil");
exports.__parseIns = stringUtil_1.parseStringArray;
const sys = {
    WebApp: WebApp_1.WebApp,
};
exports.sys = sys;
//# sourceMappingURL=utilities.js.map