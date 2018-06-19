import {readFile} from "fs";
import {safeLoad} from "js-yaml";

const SEQUENCE_ITEM_PATTERN = /^(\s*)-(\s+)(>|\|)(.+)$/gm;
const MAP_ITEM_PATTERN = /^(\s*)([-\s\w]+:)(\s+)(>|\|)(.+)$/gm;
const STRING_PATTERN = /^(>|\|)(.+)$/gm;
const IS_CHIML_FILE = /^.+\.chiml$/gmi;

export function chimlToYaml(chiml) {
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

export function chimlToConfig(chiml: string, firstTime: boolean = true): Promise<any> {
  if (firstTime && IS_CHIML_FILE.test(chiml)) {
    return new Promise((resolve, reject) => {
      readFile(chiml, (error, content) => {
        if (error) {
          return chimlToConfig(chiml, false).then(resolve).catch(reject);
        }
        return chimlToConfig(String(content), false).then(resolve).catch(reject);
      });
    });
  }
  try {
    const obj = JSON.parse(chiml);
    return Promise.resolve(obj);
  } catch (error) {
    try {
      const yaml = chimlToYaml(chiml);
      const obj = safeLoad(yaml);
      return Promise.resolve(obj);
    } catch (error) {
      return Promise.resolve(error);
    }
  }
}

export function doubleQuote(str: string): string {
  const newStr = str.replace(/"/g, "\\\"");
  return `"${newStr}"`;
}

export function isFlanked(str: string, openFlank: string, closeFlank: string): boolean {
  if (str.substr(0, openFlank.length) === openFlank &&
    str.substr(str.length - closeFlank.length, closeFlank.length) === closeFlank) {
    return true;
  }
  return false;
}

export function parseStringArray(arr: string[]): any[] {
  return arr.map((value) => {
    try {
      return JSON.parse(value);
    } catch (error) {
      return value;
    }
  });
}

export function removeFlank(str: string, openFlank, closeFlank): string {
  if (isFlanked(str, openFlank, closeFlank)) {
    return str.substr(openFlank.length, str.length - openFlank.length - closeFlank.length);
  }
  return str;
}

export function smartSplit(str: string, delimiter: string): string[] {
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
    } else {
      if (chr === "'") {
        evenSingleQuoteCount = !evenSingleQuoteCount;
      } else if (chr === '"') {
        evenDoubleQuoteCount = !evenDoubleQuoteCount;
      }
      word += chr;
    }
  }
  data.push(word.trim());
  return data;
}
