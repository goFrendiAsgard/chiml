"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = require("fs");
const js_yaml_1 = require("js-yaml");
const singleTaskConfigProcessor_1 = require("./singleTaskConfigProcessor");
const BLOCKED_SEQUENCE_ITEM = /^(\s*)-(\s+)(>|\|)(.+)$/gm;
const BLOCKED_MAP_ITEM = /^(\s*)([-\s\w]+:)(\s+)(>|\|)(.+)$/gm;
const BLOCKED_STRING = /^(>|\|)(.+)$/gm;
const CHIML_MAP_ITEM_LINE = /^(\s*)(-?)(\s*)([a-z0-9_]+)\s*:\s*(.*)\s*$/gi;
const CHIML_SEQUENCE_ITEM_LINE = /^(\s*)-\s*(.*)\s*$/gi;
const CHIML_FILE_NAME = /^.+\.chiml$/gmi;
function chimlToYaml(chiml) {
    const normalizedInlineBlock = normalizeInlineBlockDelimiter(chiml).trim();
    const lines = normalizedInlineBlock.split("\n");
    if (lines.length === 1) {
        const line = lines[0];
        if (!isFlanked(line, '"', '"') && !line.match(CHIML_MAP_ITEM_LINE) && !line.match(CHIML_SEQUENCE_ITEM_LINE)) {
            return doubleQuote(line);
        }
    }
    return normalizeChimlLines(lines).join("\n");
}
exports.chimlToYaml = chimlToYaml;
function chimlToConfig(chiml, firstTime = true) {
    if (firstTime && chiml.match(CHIML_FILE_NAME)) {
        return new Promise((resolve, reject) => {
            fs_1.readFile(chiml, (error, content) => {
                if (error) {
                    return chimlToConfig(chiml, false)
                        .then((result) => {
                        const config = singleTaskConfigProcessor_1.strToNormalizedConfig(chiml);
                        resolve(result);
                    })
                        .catch(reject);
                }
                return chimlToConfig(String(content), false)
                    .then((config) => {
                    resolve(config);
                })
                    .catch(reject);
            });
        });
    }
    try {
        const obj = JSON.parse(chiml);
        const config = singleTaskConfigProcessor_1.normalizeRawConfig(obj);
        return Promise.resolve(config);
    }
    catch (error) {
        try {
            const yaml = chimlToYaml(chiml);
            const obj = js_yaml_1.safeLoad(yaml);
            const config = typeof obj === "string" ? singleTaskConfigProcessor_1.strToNormalizedConfig(obj) : singleTaskConfigProcessor_1.normalizeRawConfig(obj);
            return Promise.resolve(config);
        }
        catch (error) {
            return Promise.reject(error);
        }
    }
}
exports.chimlToConfig = chimlToConfig;
function doubleQuote(str) {
    const newStr = str.replace(/"/g, "\\\"");
    return `"${newStr}"`;
}
exports.doubleQuote = doubleQuote;
function isFlanked(str, openFlank, closeFlank) {
    if (str.substr(0, openFlank.length) === openFlank &&
        str.substr(str.length - closeFlank.length, closeFlank.length) === closeFlank) {
        return true;
    }
    return false;
}
exports.isFlanked = isFlanked;
function parseStringArray(arr) {
    return arr.map((value) => {
        try {
            return JSON.parse(value);
        }
        catch (error) {
            return value;
        }
    });
}
exports.parseStringArray = parseStringArray;
function removeFlank(str, openFlank, closeFlank) {
    if (isFlanked(str, openFlank, closeFlank)) {
        return str.substr(openFlank.length, str.length - openFlank.length - closeFlank.length);
    }
    return str;
}
exports.removeFlank = removeFlank;
function smartSplit(str, delimiter) {
    if (str.indexOf(delimiter) === -1) {
        return [str];
    }
    let evenSingleQuoteCount = true;
    let evenDoubleQuoteCount = true;
    const data = [];
    let word = "";
    for (let i = 0; i < str.length; i++) {
        const chr = str[i];
        if (evenDoubleQuoteCount && evenSingleQuoteCount && str.substr(i, delimiter.length) === delimiter) {
            data.push(word.trim());
            i += delimiter.length - 1;
            word = "";
            continue;
        }
        switch (chr) {
            case "'":
                evenSingleQuoteCount = !evenSingleQuoteCount;
                break;
            case '"':
                evenDoubleQuoteCount = !evenDoubleQuoteCount;
                break;
        }
        word += chr;
    }
    data.push(word.trim());
    return data;
}
exports.smartSplit = smartSplit;
function normalizeInlineBlockDelimiter(chiml) {
    let result = chiml;
    // sequence item where it's value preceeded by '|' or '>'
    result = result.replace(BLOCKED_SEQUENCE_ITEM, (whole, spaces1, spaces2, blockDelimiter, str) => {
        return spaces1 + "-" + spaces2 + doubleQuote(str);
    });
    // map item and map in sequence item where it's value preceeded by '|' or '>'
    result = result.replace(BLOCKED_MAP_ITEM, (whole, spaces1, key, spaces2, blockDelimiter, str) => {
        return spaces1 + key + spaces2 + doubleQuote(str);
    });
    // string preceeded by '| or '>'
    result = result.replace(BLOCKED_STRING, (whole, blockDelimiter, str) => {
        return doubleQuote(str);
    });
    return result;
}
function getChimlLineState(line) {
    const result = {
        isMap: false,
        isSequence: false,
        key: "",
        spaces1: "",
        spaces2: "",
        val: "",
    };
    const mapMatches = new RegExp(CHIML_MAP_ITEM_LINE).exec(line);
    if (mapMatches) {
        result.spaces1 = mapMatches[1];
        result.isSequence = mapMatches[2] === "-";
        result.spaces2 = mapMatches[3];
        result.key = mapMatches[4];
        result.val = mapMatches[5];
        result.isMap = true;
        return result;
    }
    const sequenceMatches = new RegExp(CHIML_SEQUENCE_ITEM_LINE).exec(line);
    if (sequenceMatches) {
        result.spaces1 = sequenceMatches[1];
        result.val = sequenceMatches[2];
        result.isSequence = true;
    }
    return result;
}
function normalizeChimlLines(lines) {
    const keywords = ["if", "while", "do", "parallel"];
    const escapedVal = ["", "|", ">"];
    const newLines = [];
    const previousSpaceCount = [-1];
    const previousKeyList = ["root"];
    for (const line of lines) {
        const lineState = getChimlLineState(line);
        const { isMap, isSequence, key, spaces1, spaces2, val } = lineState;
        let newLine = line;
        if (isMap || isSequence) {
            const newSpaceCount = spaces1.length + spaces2.length + (isSequence ? 1 : 0);
            let lastSpaceCount = previousSpaceCount[previousSpaceCount.length - 1];
            let lastKey = previousKeyList[previousKeyList.length - 1];
            while (lastSpaceCount >= newSpaceCount) {
                previousSpaceCount.pop();
                previousKeyList.pop();
                lastSpaceCount = previousSpaceCount[previousSpaceCount.length - 1];
                lastKey = previousKeyList[previousKeyList.length - 1];
            }
            const insertedKey = isMap ? key : previousKeyList[previousKeyList.length - 1];
            previousKeyList.push(insertedKey);
            previousSpaceCount.push(newSpaceCount);
            lastSpaceCount = newSpaceCount;
            lastKey = insertedKey;
            if (keywords.indexOf(lastKey) > -1 && escapedVal.indexOf(val.trim()) === -1 && !isFlanked(val, '"', '"')) {
                newLine = [
                    spaces1,
                    isSequence ? "-" : "",
                    isMap ? `${spaces2}${key}: ` : " ",
                    doubleQuote(val),
                ].join("");
            }
        }
        newLines.push(newLine);
    }
    return newLines;
}
