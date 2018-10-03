import { IDecoratorOptions } from "../interfaces";

export function sync<Result>(
    func: () => Result, opts?: IDecoratorOptions,
): () => Promise<Result>;

export function sync<A1, Result>(
    func: (arg1: A1) => Result, opts?: IDecoratorOptions,
): (arg1: A1) => Promise<Result>;

export function sync<A1, A2, Result>(
    func: (arg1: A1, arg2: A2) => Result, opts?: IDecoratorOptions,
): (arg1: A1, arg2: A2) => Promise<Result>;

export function sync<A1, A2, A3, Result>(
    func: (arg1: A1, arg2: A2, arg3: A3) => Result, opts?: IDecoratorOptions,
): (arg1: A1, arg2: A2, arg3: A3) => Promise<Result>;

export function sync<A1, A2, A3, A4, Result>(
    func: (arg1: A1, arg2: A2, arg3: A3, arg4: A4) => Result, opts?: IDecoratorOptions,
): (arg1: A1, arg2: A2, arg3: A3, arg4: A4) => Promise<Result>;

export function sync<A1, A2, A3, A4, A5, Result>(
    func: (arg1: A1, arg2: A2, arg3: A3, arg4: A4, arg5: A5) => Result, opts?: IDecoratorOptions,
): (arg1: A1, arg2: A2, arg3: A3, arg4: A4, arg5: A5) => Promise<Result>;

export function sync<A1, A2, A3, A4, A5, A6, Result>(
    func: (arg1: A1, arg2: A2, arg3: A3, arg4: A4, arg5: A5, arg6: A6) => Result, opts?: IDecoratorOptions,
): (arg1: A1, arg2: A2, arg3: A3, arg4: A4, arg5: A5, arg6: A6) => Promise<Result>;

export function sync<Params extends any[], Result>(
    func: (...args: Params) => Result, opts?: IDecoratorOptions,
): (...args: Params) => Promise<Result>;

export function sync(
    func: (...args: any[]) => any, opts?: IDecoratorOptions,
): (...args: any[]) => Promise<any> {
    return ((...args: any[]) => {
        try {
            const result = func(...args);
            return Promise.resolve(result);
        } catch (error) {
            return Promise.reject(error);
        }
    }) as (...args: any[]) => Promise<any>;
}
