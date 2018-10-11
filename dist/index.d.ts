import { IChimlResult } from "./interfaces";
/*********************************************************
 * chiml
 *********************************************************/
export declare function chiml<TResult1>(p1: Promise<TResult1>): Promise<[TResult1]>;
export declare function chiml<TResult1, TResult2>(p1: Promise<TResult1>, p2: Promise<TResult1>): Promise<[TResult1, TResult2]>;
export declare function chiml<TResult1, TResult2, TResult3>(p1: Promise<TResult1>, p2: Promise<TResult1>, p3: Promise<TResult3>): Promise<[TResult1, TResult2, TResult3]>;
export declare function chiml<TResult1, TResult2, TResult3, TResult4>(p1: Promise<TResult1>, p2: Promise<TResult1>, p3: Promise<TResult3>, p4: Promise<TResult4>): Promise<[TResult1, TResult2, TResult3, TResult4]>;
export declare function chiml<TResult1, TResult2, TResult3, TResult4, TResult5>(p1: Promise<TResult1>, p2: Promise<TResult1>, p3: Promise<TResult3>, p4: Promise<TResult4>, p5: Promise<TResult5>): Promise<[TResult1, TResult2, TResult3, TResult4, TResult5]>;
export declare function chiml(...args: IChimlResult[]): IChimlResult;
export declare function chiml<TArgs extends any[], TResult extends IChimlResult>(fn: (...args: TArgs) => TResult, ...args: TArgs): TResult;
export declare function chiml<TArgs extends any[], TResult extends any>(fn: (...args: TArgs) => TResult, ...args: TArgs): Promise<TResult>;
export declare function chiml<TA1 extends any, TResult extends any>(fn: (a1: TA1, cb: (error: any, result: TResult) => any) => any, a1: TA1): Promise<TResult>;
export declare function chiml<TA1 extends any, TResult extends any[]>(fn: (a1: TA1, cb: (error: any, ...result: TResult) => any) => any, a1: TA1): Promise<TResult>;
export declare function chiml<TA1 extends any, TA2 extends any, TResult extends any>(fn: (a1: TA1, a2: TA2, cb: (error: any, result: TResult) => any) => any, a1: TA1, a2: TA2): Promise<TResult>;
export declare function chiml<TA1 extends any, TA2 extends any, TResult extends any[]>(fn: (a1: TA1, a2: TA2, cb: (error: any, ...result: TResult) => any) => any, a1: TA1, a2: TA2): Promise<TResult>;
export declare function chiml<TA1 extends any, TA2 extends any, TA3 extends any, TResult extends any>(fn: (a1: TA1, a2: TA2, a3: TA3, cb: (error: any, result: TResult) => any) => any, a1: TA1, a2: TA2, a3: TA3): Promise<TResult>;
export declare function chiml<TA1 extends any, TA2 extends any, TA3 extends any, TResult extends any[]>(fn: (a1: TA1, a2: TA2, a3: TA3, cb: (error: any, ...result: TResult) => any) => any, a1: TA1, a2: TA2, a3: TA3): Promise<TResult>;
export declare function chiml<TA1 extends any, TA2 extends any, TA3 extends any, TA4 extends any, TResult extends any>(fn: (a1: TA1, a2: TA2, a3: TA3, a4: TA4, cb: (error: any, result: TResult) => any) => any, a1: TA1, a2: TA2, a3: TA3, a4: TA4): Promise<TResult>;
export declare function chiml<TA1 extends any, TA2 extends any, TA3 extends any, TA4 extends any, TResult extends any[]>(fn: (a1: TA1, a2: TA2, a3: TA3, a4: TA4, cb: (error: any, ...result: TResult) => any) => any, a1: TA1, a2: TA2, a3: TA3, a4: TA4): Promise<TResult>;
export declare function chiml<TA1 extends any, TA2 extends any, TA3 extends any, TA4 extends any, TA5 extends any, TResult extends any>(fn: (a1: TA1, a2: TA2, a3: TA3, a4: TA4, a5: TA5, cb: (error: any, result: TResult) => any) => any, a1: TA1, a2: TA2, a3: TA3, a4: TA4, a5: TA5): Promise<TResult>;
export declare function chiml<TA1 extends any, TA2 extends any, TA3 extends any, TA4 extends any, TA5 extends any, TResult extends any[]>(fn: (a1: TA1, a2: TA2, a3: TA3, a4: TA4, a5: TA5, cb: (error: any, ...result: TResult) => any) => any, a1: TA1, a2: TA2, a3: TA3, a4: TA4, a5: TA5): Promise<TResult>;
export declare function chiml(cmd: string | any[], ...args: any[]): IChimlResult;
export declare function chiml(...args: any[]): IChimlResult;
/*********************************************************
 * map
 *********************************************************/
export declare function map<TArg, TResult>(func: (arg: TArg) => Promise<TResult> | TResult): (arg: TArg[]) => Promise<TResult>;
export declare function map<TArg, TResult, TCallback extends (error: any, result: TResult) => any>(func: (arg: TArg, cb: TCallback) => any): (arg: TArg[]) => Promise<TResult>;
export declare function map<TArg, TResult extends any[]>(cmd: string): (arg: TArg[]) => Promise<TResult>;
/*********************************************************
 * filter
 *********************************************************/
export declare function filter<TArg, TResult extends TArg[]>(func: (arg: TArg) => Promise<boolean> | boolean): (arg: TArg[]) => Promise<TResult>;
export declare function filter<TArg, TResult, TCallback extends (error: any, result: boolean) => any>(func: (arg: TArg, cb: TCallback) => any): (arg: TArg[]) => Promise<TResult>;
export declare function filter<TArg, TResult extends any[]>(cmd: string): (arg: TArg[]) => Promise<TResult>;
