export type IChimlResult = Promise<any>;
export type IAnyFunction = (...args: any) => any;

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
    vars?: {[key: string]: string};
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

export type IProgram = IParallel | ISeries | ISingle | IMap | IFilter | IReduce;
