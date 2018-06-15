import {CommandType, FunctionalMode, Mode} from "../enums/singleTaskProperty";
import {isFlanked, removeFlank, smartSplit} from "./stringUtil";

const jsArrowFunctionPattern = /^\(.*\)\s*=>.+/g;
const jsFunctionPattern = /^function\s*\(.*\)\s*{.+}$/g;

export function strToNormalizedConfig(str: string): {[key: string]: any} {
  return normalizeRawConfig(strToRawConfig(str));
}

export function normalizeRawConfig(rawConfig: {[key: string]: any}): {[key: string]: any} {
  const config = preprocessRawConfigShorthand(rawConfig);
  let normalizedConfig: {[key: string]: any} = {
    accumulator: "accumulator" in config ? config.accumulator : "0",
    branchCondition: "if" in config ? config.if : "true",
    command: null,
    commandList: [],
    commandType: CommandType.cmd,
    dst: null,
    functionalMode: FunctionalMode.none,
    ins: getNormalIns(config.ins),
    loopCondition: "while" in config ? config.while : "false",
    mode: Mode.single,
    out: "out" in config ? config.out : "__ans",
    src: null,
    vars: "vars" in config ? config.vars : {},
  };
  normalizedConfig = parseCommand(normalizedConfig, config);
  return normalizedConfig;
}

export function strToRawConfig(str: string): {[key: string]: any} {
  let config: {[key: string]: any} = {};
  const longArrowParts = splitByLongArrow(str);
  if (longArrowParts.length === 2) {
    config = longArrowPartsToConfig(longArrowParts);
  } else {
    const shortArrowParts = splitByShortArrow(str);
    config = shortArrowPartsToConfig(shortArrowParts);
  }
  return config;
}

function longArrowPartsToConfig(longArrowParts: string[]): {[key: string]: any} {
  // `ins --> out`
  return {
    ins: smartSplit(removeFlank(longArrowParts[0], "(", ")"), ","),
    out: longArrowParts[1],
  };
}

function shortArrowPartsToConfig(shortArrowParts: string[]): {[key: string]: any} {
  const config: {[key: string]: any} = {};
  if (shortArrowParts.length === 3) {
    // `(ins) -> do -> out`
    config.ins = smartSplit(removeFlank(shortArrowParts[0], "(", ")"), ",");
    config.do = shortArrowParts[1];
    config.out = shortArrowParts[2];
  } else if (shortArrowParts.length === 2) {
    if (isFlanked(shortArrowParts[0], "(", ")")) {
      // `(ins) -> do`
      config.ins = smartSplit(removeFlank(shortArrowParts[0], "(", ")"), ",");
      config.do = shortArrowParts[1];
    } else {
      // `do -> out`
      config.do = shortArrowParts[0];
      config.out = shortArrowParts[1];
    }
  } else {
    // `do`
    config.do = shortArrowParts[0];
  }
  return config;
}

function splitByShortArrow(str: string): string[] {
  return splitBy(str, "->", "<-");
}

function splitByLongArrow(str: string): string[] {
  return splitBy(str, "-->", "<--");
}

function splitBy(str: string, splitter: string, reverseSplitter: string): string[] {
  let parts = smartSplit(str, splitter);
  if (parts.length === 1) {
    parts = smartSplit(str, reverseSplitter).reverse();
  }
  return parts;
}

function preprocessRawConfigShorthand(config: {[key: string]: any}): {[key: string]: any} {
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
      } else {
        delete config.do;
      }
    }
  }
  return config;
}

function parseCommand(normalizedConfig: {[key: string]: any}, config: {[key: string]: any}): {[key: string]: any} {
  normalizedConfig = parseFunctionalCommand(normalizedConfig, config);
  normalizedConfig = parseSingleCommand(normalizedConfig, config);
  normalizedConfig = parseNestedCommand(normalizedConfig, config);
  return normalizedConfig;
}

function getNormalIns(ins: any): string[] {
  if (typeof ins === "string") {
    const newIns = smartSplit(ins, ",");
    if (newIns.length === 1 && newIns[0] === "") {
      return [];
    }
    return newIns;
  } else if (ins === null || ins === undefined) {
    return [];
  }
  return ins;
}

function parseSingleCommand(normalizedConfig: {[key: string]: any},
                            config: {[key: string]: any}): {[key: string]: any} {
  if ("do" in config && typeof config.do === "string") {
    normalizedConfig.command = config.do ? config.do : "(x) => x";
    if (isFlanked(normalizedConfig.command, "{", "}")) {
      normalizedConfig.command = removeFlank(normalizedConfig.command, "{", "}");
      normalizedConfig.commandType = CommandType.jsSyncFunction;
    } else if (isFlanked(normalizedConfig.command, "<", ">")) {
      normalizedConfig.command = removeFlank(normalizedConfig.command, "<", ">");
      normalizedConfig.commandType = CommandType.jsPromise;
    } else if (isFlanked(normalizedConfig.command, "[", "]")) {
      normalizedConfig.command = removeFlank(normalizedConfig.command, "[", "]");
      normalizedConfig.commandType = CommandType.jsAsyncFunction;
    } else {
      const command: string = normalizedConfig.command;
      if (command.match(jsArrowFunctionPattern) || command.match(jsFunctionPattern)) {
        normalizedConfig.commandType = CommandType.jsSyncFunction;
      } else {
        normalizedConfig.commandType = CommandType.cmd;
      }
    }
    normalizedConfig.mode = Mode.single;
  }
  return normalizedConfig;
}

function parseNestedCommand(normalizedConfig: {[key: string]: any},
                            config: {[key: string]: any}): {[key: string]: any} {
  if ("do" in config && typeof config.do !== "string") {
    normalizedConfig.commandList = config.do;
    normalizedConfig.mode = Mode.series;
  } else if ("series" in config) {
    normalizedConfig.commandList = config.series;
    normalizedConfig.mode = Mode.series;
  } else if ("parallel" in config) {
    normalizedConfig.commandList = config.parallel;
    normalizedConfig.mode = Mode.parallel;
  } else if (!normalizedConfig.command) {
    normalizedConfig.command = "(x) => x";
    normalizedConfig.commandType = CommandType.jsSyncFunction;
    normalizedConfig.mode = Mode.single;
  }
  return normalizedConfig;
}

function parseFunctionalCommand(normalizedConfig: {[key: string]: any},
                                config: {[key: string]: any}): {[key: string]: any} {
  if ("map" in config || "filter" in config || "reduce" in config) {
    normalizedConfig.dst = config.into;
    if ("map" in config) { // map
      normalizedConfig.src = config.map;
      normalizedConfig.functionalMode = FunctionalMode.map;
    } else if ("filter" in config) { // filter
      normalizedConfig.src = config.filter;
      normalizedConfig.functionalMode = FunctionalMode.filter;
    } else { // reduce
      normalizedConfig.src = config.reduce;
      normalizedConfig.functionalMode = FunctionalMode.reduce;
    }
  }
  return normalizedConfig;
}
