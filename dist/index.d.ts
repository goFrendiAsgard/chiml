import { IAnyFunction, IFilterFunction, IMapFunction, IReduceFunction, IValue, IWrappedFunction } from "./interfaces";
/*********************************************************
 * wrap
 *********************************************************/
export declare function wrap<TResult1>(p1: Promise<TResult1>): () => Promise<[TResult1]>;
export declare function wrap<TResult>(fn: (cb: (error: any, result: TResult) => any) => any): () => Promise<TResult>;
export declare function wrap<TResult extends any[]>(fn: (cb: (error: any, ...result: TResult) => any) => any): () => Promise<TResult>;
export declare function wrap<TA1, TResult>(fn: (a1: TA1, cb: (error: any, result: TResult) => any) => any): (a1: TA1) => Promise<TResult>;
export declare function wrap<TA1, TA2, TResult extends any[]>(fn: (a1: TA1, cb: (error: any, ...result: TResult) => any) => any): (a1: TA1) => Promise<TResult>;
export declare function wrap<TA1, TA2, TResult>(fn: (a1: TA1, a2: TA2, cb: (error: any, result: TResult) => any) => any): (a1: TA1, a2: TA2) => Promise<TResult>;
export declare function wrap<TA1, TA2, TResult extends any[]>(fn: (a1: TA1, a2: TA2, cb: (error: any, ...result: TResult) => any) => any): (a1: TA1, a2: TA2) => Promise<TResult>;
export declare function wrap<TA1, TA2, TA3, TResult>(fn: (a1: TA1, a2: TA2, a3: TA3, cb: (error: any, result: TResult) => any) => any): (a1: TA1, a2: TA2, a3: TA3) => Promise<TResult>;
export declare function wrap<TA1, TA2, TA3, TResult extends any[]>(fn: (a1: TA1, a2: TA2, a3: TA3, cb: (error: any, ...result: TResult) => any) => any): (a1: TA1, a2: TA2, a3: TA3) => Promise<TResult>;
export declare function wrap<TA1, TA2, TA3, TA4, TResult>(fn: (a1: TA1, a2: TA2, a3: TA3, a4: TA4, cb: (error: any, result: TResult) => any) => any): (a1: TA1, a2: TA2, a3: TA3, a4: TA4) => Promise<TResult>;
export declare function wrap<TA1, TA2, TA3, TA4, TResult extends any[]>(fn: (a1: TA1, a2: TA2, a3: TA3, a4: TA4, cb: (error: any, ...result: TResult) => any) => any): (a1: TA1, a2: TA2, a3: TA3, a4: TA4) => Promise<TResult>;
export declare function wrap<TA1, TA2, TA3, TA4, TA5, TResult>(fn: (a1: TA1, a2: TA2, a3: TA3, a4: TA4, a5: TA5, cb: (error: any, result: TResult) => any) => any): (a1: TA1, a2: TA2, a3: TA3, a4: TA4, a5: TA5) => Promise<TResult>;
export declare function wrap<TA1, TA2, TA3, TA4, TA5, TResult extends any[]>(fn: (a1: TA1, a2: TA2, a3: TA3, a4: TA4, a5: TA5, cb: (error: any, ...result: TResult) => any) => any): (a1: TA1, a2: TA2, a3: TA3, a4: TA4, a5: TA5) => Promise<TResult>;
export declare function wrap<TArgs extends any[], TResult extends IValue>(fn: (...args: TArgs) => TResult): (...args: TArgs) => TResult;
export declare function wrap<TArgs extends any[], TResult>(fn: (...args: TArgs) => TResult): (...args: TArgs) => Promise<TResult>;
export declare function wrap(arg: any): IWrappedFunction;
/*********************************************************
 * curry
 *********************************************************/
export declare function curryLeft(action: any, paramCount: number, injectArgs: any[]): IAnyFunction;
export declare const curry: typeof curryLeft;
/*********************************************************
 * curryR
 *********************************************************/
export declare function curryRight(action: any, paramCount: number, injectArgs: any[]): IAnyFunction;
/*********************************************************
 * map
 *********************************************************/
export declare function map<TArg, TResult>(func: (arg: TArg) => Promise<TResult> | TResult): (args: TArg[]) => Promise<TResult>;
export declare function map<TArg, TResult, TCallback extends (error: any, result: TResult) => any>(func: (arg: TArg, cb: TCallback) => any): (args: TArg[]) => Promise<TResult>;
export declare function map(funcOrCmd: any): IMapFunction;
/*********************************************************
 * filter
 *********************************************************/
export declare function filter<TArg, TResult extends TArg[]>(func: (arg: TArg) => Promise<TResult> | TResult): (args: TArg[]) => Promise<TResult>;
export declare function filter<TArg, TResult, TCallback extends (error: any, result: boolean) => any>(func: (arg: TArg, cb: TCallback) => any): (args: TArg[]) => Promise<TResult>;
export declare function filter(funcOrCmd: any): IFilterFunction;
/*********************************************************
 * reduce
 *********************************************************/
export declare function reduce<TArg, TResult>(func: (arg: TArg, accumulator: TResult) => Promise<TResult> | TResult): (accumulator: TResult, args: TArg[]) => Promise<TResult>;
export declare function reduce<TArg, TResult, TCallback extends (error: any, result: TResult) => any>(func: (accumulator: TResult, args: TArg[]) => any): (args: TArg[], accumulator: TResult) => Promise<TResult>;
export declare function reduce<TArg, TResult extends any>(cmd: string): (accumulator: TResult, args: TArg[]) => Promise<TResult>;
export declare function reduce(funcOrCmd: any): IReduceFunction;
/*********************************************************
 * pipe
 *********************************************************/
export declare function pipe(...actions: any[]): IWrappedFunction;
/*********************************************************
 * parallel
 *********************************************************/
export declare function parallel(...actions: IValue[]): IWrappedFunction;
