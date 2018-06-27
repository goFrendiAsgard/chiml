import * as cacheRequirePaths from "cache-require-paths";
import {readFile} from "fs";
import {safeLoad} from "js-yaml";
import {normalizeRawConfig, strToNormalizedConfig} from "./singleTaskConfigProcessor";

const BLOCKED_SEQUENCE_ITEM = /^(\s*)-(\s+)(>|\|)(.+)$/gm;
const BLOCKED_MAP_ITEM = /^(\s*)([-\s\w]+:)(\s+)(>|\|)(.+)$/gm;
const BLOCKED_STRING = /^(>|\|)(.+)$/gm;
const CHIML_MAP_ITEM_LINE = /^(\s*)(-?)(\s*)([a-z0-9_]+)\s*:\s*(.*)\s*$/gi;
const CHIML_SEQUENCE_ITEM_LINE = /^(\s*)-\s*(.*)\s*$/gi;
const CHIML_FILE_NAME = /^.+\.chiml$/gmi;

interface ILineState {
  spaces1: string;
  spaces2: string;
  isMap: boolean;
  isSequence: boolean;
  key: string;
  val: string;
}

export function chimlToYaml(chiml: string): string {
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

export function chimlToConfig(chiml: string, firstTime: boolean = true): Promise<any> {
  if (firstTime && chiml.match(CHIML_FILE_NAME)) {
    return new Promise((resolve, reject) => {
      readFile(chiml, (error, content) => {
        if (error) {
          return chimlToConfig(chiml, false).then((result) => {
            const config = strToNormalizedConfig(chiml);
            resolve(result);
          }).catch(reject);
        }
        return chimlToConfig(String(content), false).then((config) => {
          resolve(config);
        }).catch(reject);
      });
    });
  }
  try {
    const obj = JSON.parse(chiml);
    const config = normalizeRawConfig(obj);
    return Promise.resolve(config);
  } catch (error) {
    try {
      const yaml = chimlToYaml(chiml);
      const obj = safeLoad(yaml);
      const config = typeof obj === "string" ? strToNormalizedConfig(obj) : normalizeRawConfig(obj);
      return Promise.resolve(config);
    } catch (error) {
      return Promise.reject(error);
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

function normalizeInlineBlockDelimiter(chiml: string) {
  let result: string = chiml;
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

function getChimlLineState(line: string): ILineState {
  const mapMatches = new RegExp(CHIML_MAP_ITEM_LINE).exec(line);
  let spaces1: string = "";
  let spaces2: string = "";
  let isMap: boolean = false;
  let isSequence: boolean = false;
  let key: string = "";
  let val: string = "";
  if (mapMatches) {
    spaces1 = mapMatches[1];
    isSequence = mapMatches[2] === "-";
    spaces2 = mapMatches[3];
    key = mapMatches[4];
    val = mapMatches[5];
    isMap = true;
  } else {
    const sequenceMatches = new RegExp(CHIML_SEQUENCE_ITEM_LINE).exec(line);
    if (sequenceMatches) {
      spaces1 = sequenceMatches[1];
      val = sequenceMatches[2];
      isSequence = true;
    }
  }
  return {spaces1, spaces2, isMap, isSequence, key, val};
}

function normalizeChimlLines(lines: string[]): string[] {
  const keywords: string[] = ["if", "while", "do", "parallel"];
  const escapedVal: string[] = ["", "|", ">"];
  const newLines: string[] = [];
  const previousSpaceCount: number[] = [-1];
  const previousKeyList: string[] = ["root"];
  for (const line of lines) {
    const lineState = getChimlLineState(line);
    const {spaces1, spaces2, isMap, isSequence, key, val} = lineState;
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
        newLines.push([
          spaces1,
          isSequence ? "-" : "",
          isMap ? `${spaces2}${key}: ` : " ",
          doubleQuote(val),
        ].join(""));
      } else {
        newLines.push(line);
      }
    } else {
      newLines.push(line);
    }
  }
  return newLines;
}
