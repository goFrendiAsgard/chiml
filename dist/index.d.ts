import { IFilterFunction, IMapFunction, IReduceFunction, IWrappedFunction } from "./interfaces";
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
