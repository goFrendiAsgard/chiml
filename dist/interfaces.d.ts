export declare type IWrappedFunction = IWrappedObject & ((...args: any[]) => any);
export declare type IWrappedFunctionReturningPromise = IWrappedObject & ((...args: any[]) => Promise<any>);
export declare type IMapFunction = IWrappedObject & ((data: any[]) => Promise<any[]>);
export declare type IFilterFunction = IWrappedObject & ((data: any[]) => Promise<any[]>);
export declare type IReduceFunction = IWrappedObject & IRealReduceFunction & ICurriedReduceFunction;
export declare type IAnyFunction = (...args: any[]) => any;
interface IWrappedObject {
    __isWrapped: boolean;
}
declare type IRealReduceFunction = (accumulator: any, data: any[]) => Promise<any>;
declare type IPartialReduceFunction = (data: any[]) => Promise<any>;
declare type ICurriedReduceFunction = (accumulator: any) => IPartialReduceFunction;
export {};
