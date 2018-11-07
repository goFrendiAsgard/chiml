import * as R from "ramda";
export declare const X: R.Static & {
    command: typeof command;
    nodeback: typeof nodeback;
    parallel: typeof parallel;
    promise: typeof promise;
    then: R.CurriedFunction2<(...args: any[]) => any, {}, (arg: Promise<any>) => Promise<any>>;
};
declare function promise(arg: any): Promise<any>;
declare function parallel(arity: number, functions: Array<(...args: any[]) => any>): (...args: any[]) => any;
declare function command(arity: number, stringCommand: string): (...args: any[]) => any;
declare function nodeback(arity: number, fn: (...args: any[]) => any): (...args: any[]) => any;
export {};
