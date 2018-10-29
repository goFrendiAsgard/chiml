import { IFilterFunction, IMapFunction, IReduceFunction, ISingleIfThen, IWrappedFunction } from "./interfaces";
/*********************************************************
 * placeHolder
 *********************************************************/
export declare const _: {
    __isPlaceHolder: boolean;
};
/*********************************************************
 * wrap
 *********************************************************/
export declare function wrap(cmdOrFunc: any): IWrappedFunction;
/*********************************************************
 * curryLeft & curry
 *********************************************************/
export declare function curryLeft(fn: any, arity: any): IWrappedFunction;
export declare const curry: typeof curryLeft;
/*********************************************************
 * curryRight
 *********************************************************/
export declare function curryRight(fn: any, arity: any): IWrappedFunction;
/*********************************************************
 * map
 *********************************************************/
export declare function map(funcOrCmd: any): IMapFunction;
/*********************************************************
 * filter
 *********************************************************/
export declare function filter(funcOrCmd: any): IFilterFunction;
/*********************************************************
 * reduce
 *********************************************************/
export declare function reduce(funcOrCmd: any): IReduceFunction;
/*********************************************************
 * pipe
 *********************************************************/
export declare function pipe(...actions: any[]): IWrappedFunction;
/*********************************************************
 * compose
 *********************************************************/
export declare function compose(...actions: any[]): IWrappedFunction;
/*********************************************************
 * parallel
 *********************************************************/
export declare function parallel(...funcOrCmds: any[]): IWrappedFunction;
/*********************************************************
 * cond
 *********************************************************/
export declare function condition(ifThens: ISingleIfThen[], arity: number): IWrappedFunction;
/*********************************************************
 * add, subtract, multiply, divide, modulo, negate
 *********************************************************/
export declare const add: IWrappedFunction;
export declare const subtract: IWrappedFunction;
export declare const multiply: IWrappedFunction;
export declare const divide: IWrappedFunction;
export declare const modulo: IWrappedFunction;
export declare const negate: IWrappedFunction;
/*********************************************************
 * and, or, not
 *********************************************************/
export declare const and: IWrappedFunction;
export declare const or: IWrappedFunction;
export declare const not: IWrappedFunction;
/*********************************************************
 * eq, gt, gte, lt, lte, neq
 *********************************************************/
export declare const eq: IWrappedFunction;
export declare const gt: IWrappedFunction;
export declare const gte: IWrappedFunction;
export declare const lt: IWrappedFunction;
export declare const lte: IWrappedFunction;
export declare const neq: IWrappedFunction;
/*********************************************************
 * T, F
 *********************************************************/
export declare const F: IWrappedFunction;
export declare const T: IWrappedFunction;
