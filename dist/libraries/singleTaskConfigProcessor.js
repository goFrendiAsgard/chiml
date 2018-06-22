"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const singleTaskProperty_1 = require("../enums/singleTaskProperty");
const stringUtil_1 = require("./stringUtil");
const jsArrowFunctionPattern = /^\(.*\)\s*=>.+/g;
const jsFunctionPattern = /^function\s*\(.*\)\s*{.+}$/g;
function strToNormalizedConfig(str) {
    return normalizeRawConfig(strToRawConfig(str));
}
exports.strToNormalizedConfig = strToNormalizedConfig;
function normalizeRawConfig(rawConfig) {
    if ("__isNormal" in rawConfig) {
        return rawConfig;
    }
    const config = preprocessRawConfigShorthand(rawConfig);
    let normalizedConfig = {
        __isNormal: true,
        accumulator: "accumulator" in config ? config.accumulator : "0",
        branchCondition: "if" in config ? config.if : "true",
        chimlPath: "",
        command: null,
        commandList: [],
        commandType: singleTaskProperty_1.CommandType.cmd,
        dst: "into" in config ? config.into : "__fx",
        functionalMode: singleTaskProperty_1.FunctionalMode.none,
        ins: getNormalIns(config.ins),
        loopCondition: "while" in config ? config.while : "false",
        mode: singleTaskProperty_1.Mode.single,
        out: "out" in config ? config.out : "__ans",
        src: null,
        vars: "vars" in config ? config.vars : {},
    };
    normalizedConfig = parseCommand(normalizedConfig, config);
    return normalizedConfig;
}
exports.normalizeRawConfig = normalizeRawConfig;
function strToRawConfig(str) {
    let config = {};
    const longArrowParts = splitByLongArrow(str);
    if (longArrowParts.length === 2) {
        config = longArrowPartsToConfig(longArrowParts);
    }
    else {
        const shortArrowParts = splitByShortArrow(str);
        config = shortArrowPartsToConfig(shortArrowParts);
    }
    return config;
}
exports.strToRawConfig = strToRawConfig;
function longArrowPartsToConfig(longArrowParts) {
    // `ins --> out`
    return {
        ins: stringUtil_1.smartSplit(stringUtil_1.removeFlank(longArrowParts[0], "(", ")"), ","),
        out: longArrowParts[1],
    };
}
function shortArrowPartsToConfig(shortArrowParts) {
    const config = {};
    if (shortArrowParts.length === 3) {
        // `(ins) -> do -> out`
        config.ins = stringUtil_1.smartSplit(stringUtil_1.removeFlank(shortArrowParts[0], "(", ")"), ",");
        config.do = shortArrowParts[1];
        config.out = shortArrowParts[2];
    }
    else if (shortArrowParts.length === 2) {
        if (stringUtil_1.isFlanked(shortArrowParts[0], "(", ")")) {
            // `(ins) -> do`
            config.ins = stringUtil_1.smartSplit(stringUtil_1.removeFlank(shortArrowParts[0], "(", ")"), ",");
            config.do = shortArrowParts[1];
        }
        else {
            // `do -> out`
            config.do = shortArrowParts[0];
            config.out = shortArrowParts[1];
        }
    }
    else {
        // `do`
        config.do = shortArrowParts[0];
    }
    return config;
}
function splitByShortArrow(str) {
    return splitBy(str, "->", "<-");
}
function splitByLongArrow(str) {
    return splitBy(str, "-->", "<--");
}
function splitBy(str, splitter, reverseSplitter) {
    let parts = stringUtil_1.smartSplit(str, splitter);
    if (parts.length === 1) {
        parts = stringUtil_1.smartSplit(str, reverseSplitter).reverse();
    }
    return parts;
}
function preprocessRawConfigShorthand(config) {
    if ("do" in config && typeof config.do === "string") {
        const tmpConfig = strToRawConfig(config.do);
        if (tmpConfig.do !== config.do) {
            if ("ins" in tmpConfig) {
                config.ins = tmpConfig.ins;
            }
            if ("out" in tmpConfig) {
                config.out = tmpConfig.out;
            }
            if ("do" in tmpConfig) {
                config.do = tmpConfig.do;
            }
            else {
                delete config.do;
            }
        }
    }
    return config;
}
function parseCommand(normalizedConfig, config) {
    normalizedConfig = parseFunctionalCommand(normalizedConfig, config);
    normalizedConfig = parseSingleCommand(normalizedConfig, config);
    normalizedConfig = parseNestedCommand(normalizedConfig, config);
    return normalizedConfig;
}
function getNormalIns(ins) {
    if (typeof ins === "string") {
        const newIns = stringUtil_1.smartSplit(ins, ",");
        if (newIns.length === 1 && newIns[0] === "") {
            return [];
        }
        return newIns;
    }
    else if (ins === null || ins === undefined) {
        return [];
    }
    return ins;
}
function parseSingleCommand(normalizedConfig, config) {
    if ("do" in config && typeof config.do === "string") {
        normalizedConfig.command = config.do ? config.do : "(x) => x";
        if (stringUtil_1.isFlanked(normalizedConfig.command, "{", "}")) {
            normalizedConfig.command = stringUtil_1.removeFlank(normalizedConfig.command, "{", "}");
            normalizedConfig.commandType = singleTaskProperty_1.CommandType.jsSyncFunction;
        }
        else if (stringUtil_1.isFlanked(normalizedConfig.command, "<", ">")) {
            normalizedConfig.command = stringUtil_1.removeFlank(normalizedConfig.command, "<", ">");
            normalizedConfig.commandType = singleTaskProperty_1.CommandType.jsPromise;
        }
        else if (stringUtil_1.isFlanked(normalizedConfig.command, "[", "]")) {
            normalizedConfig.command = stringUtil_1.removeFlank(normalizedConfig.command, "[", "]");
            normalizedConfig.commandType = singleTaskProperty_1.CommandType.jsAsyncFunction;
        }
        else {
            const command = normalizedConfig.command;
            if (command.match(jsArrowFunctionPattern) || command.match(jsFunctionPattern)) {
                normalizedConfig.commandType = singleTaskProperty_1.CommandType.jsSyncFunction;
            }
            else {
                normalizedConfig.commandType = singleTaskProperty_1.CommandType.cmd;
            }
        }
        normalizedConfig.mode = singleTaskProperty_1.Mode.single;
    }
    return normalizedConfig;
}
function parseNestedCommand(normalizedConfig, config) {
    if ("do" in config && typeof config.do !== "string") {
        normalizedConfig.commandList = config.do;
        normalizedConfig.mode = singleTaskProperty_1.Mode.series;
    }
    else if ("series" in config) {
        normalizedConfig.commandList = config.series;
        normalizedConfig.mode = singleTaskProperty_1.Mode.series;
    }
    else if ("parallel" in config) {
        normalizedConfig.commandList = config.parallel;
        normalizedConfig.mode = singleTaskProperty_1.Mode.parallel;
    }
    else if (!normalizedConfig.command) {
        normalizedConfig.command = "(x) => x";
        normalizedConfig.commandType = singleTaskProperty_1.CommandType.jsSyncFunction;
        normalizedConfig.mode = singleTaskProperty_1.Mode.single;
    }
    return normalizedConfig;
}
function parseFunctionalCommand(normalizedConfig, config) {
    if ("map" in config || "filter" in config || "reduce" in config) {
        if ("map" in config) { // map
            normalizedConfig.src = getNormalSrc(config.map);
            normalizedConfig.functionalMode = singleTaskProperty_1.FunctionalMode.map;
            if (normalizedConfig.ins.length < 1) {
                normalizedConfig.ins = ["__el"];
            }
        }
        else if ("filter" in config) { // filter
            normalizedConfig.src = getNormalSrc(config.filter);
            normalizedConfig.functionalMode = singleTaskProperty_1.FunctionalMode.filter;
            if (normalizedConfig.ins.length < 1) {
                normalizedConfig.ins = ["__el"];
            }
        }
        else { // reduce
            normalizedConfig.src = getNormalSrc(config.reduce);
            normalizedConfig.functionalMode = singleTaskProperty_1.FunctionalMode.reduce;
            if (normalizedConfig.ins.length < 2) {
                normalizedConfig.ins = ["__el", "__acc"];
            }
        }
    }
    return normalizedConfig;
}
function getNormalSrc(src) {
    if (typeof src !== "string" && Array.isArray(src)) {
        return JSON.stringify(src);
    }
    return src;
}
//# sourceMappingURL=singleTaskConfigProcessor.js.map