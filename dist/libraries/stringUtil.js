"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
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
function isFlanked(str, openFlank, closeFlank) {
    if (str.substr(0, openFlank.length) === openFlank &&
        str.substr(str.length - closeFlank.length, closeFlank.length) === closeFlank) {
        return true;
    }
    return false;
}
exports.isFlanked = isFlanked;
function removeFlank(str, openFlank, closeFlank) {
    if (isFlanked(str, openFlank, closeFlank)) {
        return str.substr(openFlank.length, str.length - openFlank.length - closeFlank.length);
    }
    return str;
}
exports.removeFlank = removeFlank;
function doubleQuote(str) {
    const newStr = str.replace(/"/g, "\\\"");
    return `"${newStr}"`;
}
exports.doubleQuote = doubleQuote;
