"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = require("fs");
const js_yaml_1 = require("js-yaml");
const SEQUENCE_ITEM_PATTERN = /^(\s*)-(\s+)(>|\|)(.+)$/gm;
const MAP_ITEM_PATTERN = /^(\s*)([-\s\w]+:)(\s+)(>|\|)(.+)$/gm;
const STRING_PATTERN = /^(>|\|)(.+)$/gm;
const CHIML_FILE_NAME = /^.+\.chiml$/gmi;
function chimlToYaml(chiml) {
    let result = chiml;
    // sequence item where it's value preceeded by '|' or '>'
    result = result.replace(SEQUENCE_ITEM_PATTERN, (whole, spaces1, spaces2, blockDelimiter, str) => {
        return spaces1 + "-" + spaces2 + doubleQuote(str);
    });
    // map item and map in sequence item where it's value preceeded by '|' or '>'
    result = result.replace(MAP_ITEM_PATTERN, (whole, spaces1, key, spaces2, blockDelimiter, str) => {
        return spaces1 + key + spaces2 + doubleQuote(str);
    });
    // string preceeded by '| or '>'
    result = result.replace(STRING_PATTERN, (whole, blockDelimiter, str) => {
        return doubleQuote(str);
    });
    return result;
}
exports.chimlToYaml = chimlToYaml;
function chimlToConfig(chiml, firstTime = true) {
    if (firstTime && chiml.match(CHIML_FILE_NAME)) {
        return new Promise((resolve, reject) => {
            fs_1.readFile(chiml, (error, content) => {
                if (error) {
                    return chimlToConfig(chiml, false).then((result) => {
                        resolve(result);
                    }).catch(reject);
                }
                return chimlToConfig(String(content), false).then((result) => {
                    resolve(result);
                }).catch(reject);
            });
        });
    }
    try {
        const obj = JSON.parse(chiml);
        return Promise.resolve(obj);
    }
    catch (error) {
        try {
            const yaml = chimlToYaml(chiml);
            const obj = js_yaml_1.safeLoad(yaml);
            return Promise.resolve(obj);
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
        }
        else {
            if (chr === "'") {
                evenSingleQuoteCount = !evenSingleQuoteCount;
            }
            else if (chr === '"') {
                evenDoubleQuoteCount = !evenDoubleQuoteCount;
            }
            word += chr;
        }
    }
    data.push(word.trim());
    return data;
}
exports.smartSplit = smartSplit;
//# sourceMappingURL=stringUtil.js.map