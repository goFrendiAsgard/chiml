import * as R from "ramda";
import { AnyAsyncFunction, AnyFunction, IDeclarativeConfig } from "./interfaces/descriptor";
export declare const X: R.Static & {
    declarative: typeof declarative;
    foldInput: typeof foldInput;
    spreadInput: typeof spreadInput;
    parallel: typeof parallel;
    wrapCommand: typeof wrapCommand;
    wrapNodeback: typeof wrapNodeback;
    wrapSync: typeof wrapSync;
};
/**
 * @param declarativeConfig IDeclarativeConfig
 */
declare function declarative(partialDeclarativeConfig: Partial<IDeclarativeConfig>): AnyFunction;
/**
 * @param fn AnyFunction
 */
declare function spreadInput<TArg, TResult>(fn: (arr: TArg[]) => TResult): (...args: TArg[]) => TResult;
/**
 * @param fn AnyFunction
 */
declare function foldInput<TArg, TResult>(fn: (...args: TArg[]) => TResult): (arr: TArg[]) => TResult;
/**
 * @param fnList AnyAsynchronousFunction
 */
declare function parallel(...fnList: AnyAsyncFunction[]): AnyAsyncFunction;
/**
 * @param fn AnyFunction
 */
declare function wrapSync<TArg, TResult>(fn: (...args: TArg[]) => TResult): (...args: TArg[]) => Promise<TResult>;
/**
 * @param fn AnyFunction
 */
declare function wrapNodeback(fn: AnyFunction): AnyAsyncFunction;
/**
 * @param stringCommand string
 */
declare function wrapCommand(stringCommand: string): AnyAsyncFunction;
export {};
