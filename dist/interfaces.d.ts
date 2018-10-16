export declare type IValue = Promise<any>;
export declare type IWrappedFunction = (...args: any[]) => IValue;
export declare type IMapFunction = (data: any[]) => Promise<any[]>;
export declare type IFilterFunction = (data: any[]) => Promise<any[]>;
export declare type IReduceFunction = (data: any[], accumulator: any) => Promise<any>;
export declare type IAnyFunction = (...args: any[]) => any;
interface IBranched {
    if?: string;
}
interface IParallel extends IBranched {
    parallel: IProgram[];
}
interface ISeries extends IBranched {
    do: IProgram[];
}
interface ISingleSkeleton {
    ins: string[];
    out: string;
    vars?: {
        [key: string]: string;
    };
}
interface ISingle extends ISingleSkeleton {
    do: string;
}
interface IMap extends ISingleSkeleton {
    map: string;
}
interface IFilter extends ISingleSkeleton {
    filter: string;
}
interface IReduce extends ISingleSkeleton {
    reduce: string;
    accumulator: string;
}
export declare type IProgram = IParallel | ISeries | ISingle | IMap | IFilter | IReduce;
export {};
