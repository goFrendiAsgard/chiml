import { IDecoratorOptions } from "../interfaces";
export declare function asyn<Fn extends (...args: any[]) => Promise<any>>(func: Fn, opts?: IDecoratorOptions): Fn;
