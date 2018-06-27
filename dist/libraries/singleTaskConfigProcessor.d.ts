import { CommandType, FunctionalMode, Mode } from "../enums/singleTaskProperty";
export interface IRawConfig {
    accumulator: string;
    branchCondition: string;
    command: string;
    commandList: any[];
    commandType: CommandType;
    dst: string;
    functionalMode: FunctionalMode;
    ins: string[];
    loopCondition: string;
    mode: Mode;
    out: string;
    src: string;
    vars: {
        [key: string]: any;
    };
    chimlPath: string;
    __isNormal: boolean;
}
export declare function strToNormalizedConfig(str: string): IRawConfig;
export declare function normalizeRawConfig(rawConfig: {
    [key: string]: any;
}): IRawConfig;
export declare function strToRawConfig(str: string): {
    [key: string]: any;
};
