import * as R from "ramda";
import { IDeclarativeConfig } from "./interfaces/descriptor";
export declare const X: R.Static & {
    convergeInput: typeof convergeInput;
    declarative: typeof declarative;
    parallel: (t2: ((...args: any[]) => Promise<any>)[]) => (...a: any[]) => any;
    parallelN: R.CurriedFunction2<number, ((...args: any[]) => Promise<any>)[], (...a: any[]) => any>;
    wrapCommand: (t2: string) => (...args: any[]) => any;
    wrapCommandN: R.CurriedFunction2<number, string, (...args: any[]) => any>;
    wrapNodeback: (t2: (...args: any[]) => any) => (...args: any[]) => any;
    wrapNodebackN: R.CurriedFunction2<number, (...args: any[]) => any, (...args: any[]) => any>;
    wrapSync: (t2: (...args: any[]) => any) => (...a: any[]) => any;
    wrapSyncN: R.CurriedFunction2<number, (...args: any[]) => any, (...a: any[]) => any>;
};
declare function declarative(declarativeConfig: IDeclarativeConfig): (...args: any[]) => any;
declare function convergeInput(fn: (...args: any[]) => Promise<any>): (arr: any[]) => Promise<any>;
export {};
