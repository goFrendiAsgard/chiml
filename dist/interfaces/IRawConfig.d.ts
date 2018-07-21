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
