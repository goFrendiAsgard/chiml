export type IWrappedFunction = IWrappedObject & ((...args: any[]) => any);
export type IWrappedFunctionReturningPromise = IWrappedObject & ((...args: any[]) => Promise<any>);
export type IMapFunction = IWrappedObject & ((data: any[]) => Promise<any[]>);
export type IFilterFunction = IWrappedObject & ((data: any[]) => Promise<any[]>);
export type IReduceFunction = IWrappedObject & IRealReduceFunction & ICurriedReduceFunction;
export type IAnyFunction = (...args: any[]) => any;

interface IWrappedObject {
    __isWrapped: boolean;
}

type IRealReduceFunction = (accumulator: any, data: any[]) => Promise<any>;
type IPartialReduceFunction = (data: any[]) => Promise<any>;
type ICurriedReduceFunction = (accumulator: any) => IPartialReduceFunction;
