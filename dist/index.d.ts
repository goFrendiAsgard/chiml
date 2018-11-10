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
declare function declarative(declarativeConfig: IDeclarativeConfig): AnyFunction;
declare function spreadInput<TArg, TResult>(fn: (arr: TArg[]) => TResult): (...args: TArg[]) => TResult;
declare function foldInput<TArg, TResult>(fn: (...args: TArg[]) => TResult): (arr: TArg[]) => TResult;
declare function parallel(...fnList: AnyAsyncFunction[]): AnyAsyncFunction;
declare function wrapSync<TArg, TResult>(fn: (...args: TArg[]) => TResult): (...args: TArg[]) => Promise<TResult>;
declare function wrapCommand(stringCommand: string): AnyAsyncFunction;
declare function wrapNodeback(fn: AnyFunction): AnyAsyncFunction;
export {};
