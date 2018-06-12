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
function removeParantheses(str) {
    if (str[0] === "(" && str[str.length - 1] === ")") {
        return str.trim().substr(1, str.length - 2);
    }
    return str;
}
exports.removeParantheses = removeParantheses;
//# sourceMappingURL=stringUtil.js.map