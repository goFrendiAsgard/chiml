/// <reference types="node" />
import { ReadLineOptions } from "readline";
export declare function createPrompt(config?: ReadLineOptions): any;
export declare function createPrint(config?: {
    [key: string]: any;
}): (...args: any[]) => void;
