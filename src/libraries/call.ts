import { IDecoratorOptions } from "../interfaces";

export function call<Result extends any[]>(
    func: (callback: (err: any, ...res: Result) => void) => void, opts?: IDecoratorOptions,
): () => Promise<Result>;
export function call<Result>(
    func: (callback: (err: any, res: Result) => void) => void, opts?: IDecoratorOptions,
): () => Promise<Result>;

export function call<A1, Result extends any[]>(
    func: (arg1: A1, callback: (err: any, ...res: Result) => void) => void, opts?: IDecoratorOptions,
): (arg1: A1) => Promise<Result>;
export function call<A1, Result>(
    func: (arg1: A1, callback: (err: any, res: Result) => void) => void, opts?: IDecoratorOptions,
): (arg1: A1) => Promise<Result>;

export function call<A1, A2, Result extends any[]>(
    func: (arg1: A1, arg2: A2, callback: (err: any, ...res: Result) => void) => void, opts?: IDecoratorOptions,
): (arg1: A1, arg2: A2) => Promise<Result>;
export function call<A1, A2, Result>(
    func: (arg1: A1, arg2: A2, callback: (err: any, res: Result) => void) => void, opts?: IDecoratorOptions,
): (arg1: A1, arg2: A2) => Promise<Result>;

export function call<A1, A2, A3, Result extends any[]>(
    // tslint:disable-next-line:max-line-length
    func: (arg1: A1, arg2: A2, arg3: A3, callback: (err: any, ...res: Result) => void) => void, opts?: IDecoratorOptions,
): (arg1: A1, arg2: A2, arg3: A3) => Promise<Result>;
export function call<A1, A2, A3, Result>(
    func: (arg1: A1, arg2: A2, arg3: A3, callback: (err: any, res: Result) => void) => void, opts?: IDecoratorOptions,
): (arg1: A1, arg2: A2, arg3: A3) => Promise<Result>;

export function call<A1, A2, A3, A4, Result extends any[]>(
    // tslint:disable-next-line:max-line-length
    func: (arg1: A1, arg2: A2, arg3: A3, arg4: A4, callback: (err: any, ...res: Result) => void) => void, opts?: IDecoratorOptions,
): (arg1: A1, arg2: A2, arg3: A3, arg4: A4) => Promise<Result>;
export function call<A1, A2, A3, A4, Result>(
    // tslint:disable-next-line:max-line-length
    func: (arg1: A1, arg2: A2, arg3: A3, arg4: A4, callback: (err: any, res: Result) => void) => void, opts?: IDecoratorOptions,
): (arg1: A1, arg2: A2, arg3: A3, arg4: A4) => Promise<Result>;

export function call<A1, A2, A3, A4, A5, Result extends any[]>(
    // tslint:disable-next-line:max-line-length
    func: (arg1: A1, arg2: A2, arg3: A3, arg4: A4, arg5: A5, callback: (err: any, ...res: Result) => void) => void, opts?: IDecoratorOptions,
): (arg1: A1, arg2: A2, arg3: A3, arg4: A4, arg5: A5) => Promise<Result>;
export function call<A1, A2, A3, A4, A5, Result>(
    // tslint:disable-next-line:max-line-length
    func: (arg1: A1, arg2: A2, arg3: A3, arg4: A4, arg5: A5, callback: (err: any, res: Result) => void) => void, opts?: IDecoratorOptions,
): (arg1: A1, arg2: A2, arg3: A3, arg4: A4, arg5: A5) => Promise<Result>;

export function call<A1, A2, A3, A4, A5, A6, Result extends any[]>(
    // tslint:disable-next-line:max-line-length
    func: (arg1: A1, arg2: A2, arg3: A3, arg4: A4, arg5: A5, arg6: A6, callback: (err: any, ...res: Result) => void) => void, opts?: IDecoratorOptions,
): (arg1: A1, arg2: A2, arg3: A3, arg4: A4, arg5: A5, arg6: A6) => Promise<Result>;
export function call<A1, A2, A3, A4, A5, A6, Result>(
    // tslint:disable-next-line:max-line-length
    func: (arg1: A1, arg2: A2, arg3: A3, arg4: A4, arg5: A5, arg6: A6, callback: (err: any, res: Result) => void) => void, opts?: IDecoratorOptions,
): (arg1: A1, arg2: A2, arg3: A3, arg4: A4, arg5: A5, arg6: A6) => Promise<Result>;

export function call<Params extends any[], Result extends any[]>(
    func: (...args: Params) => void, opts?: IDecoratorOptions,
): (...args: any[]) => Promise<Result>;
export function call<Params extends any[], Result>(
    func: (...args: Params) => void, opts?: IDecoratorOptions,
): (...args: any[]) => Promise<Result>;

export function call(func: (...args: any[]) => any, opts?: IDecoratorOptions) {
    return (...args: any[]) => {
        return new Promise((resolve, reject) => {
            function callback(err: any, ...result: any[]) {
                if (err) {
                    return reject(err);
                }
                if (result.length === 1) {
                    return resolve(result[0]);
                }
                return resolve(result);
            }
            args.push(callback);
            func(...args);
        });
    };
}
