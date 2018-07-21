import { IRawConfig } from "../interfaces/IRawConfig";
export declare function strToNormalizedConfig(str: string): IRawConfig;
export declare function normalizeRawConfig(rawConfig: {
    [key: string]: any;
}): IRawConfig;
export declare function strToRawConfig(str: string): {
    [key: string]: any;
};
