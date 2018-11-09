import * as R from "ramda";
export declare const X: R.Static & {
    convergeInput: typeof convergeInput;
    parallel: R.CurriedFunction2<number, ((...args: any[]) => Promise<any>)[], (...a: any[]) => any>;
    wrapCommand: R.CurriedFunction2<number, string, (...args: any[]) => any>;
    wrapNodeback: R.CurriedFunction2<number, (...args: any[]) => any, (...args: any[]) => any>;
    wrapSync: R.CurriedFunction2<number, (...args: any[]) => any, (...a: any[]) => any>;
};
declare function convergeInput(fn: (...args: any[]) => Promise<any>): (arr: any[]) => Promise<any>;
export {};
