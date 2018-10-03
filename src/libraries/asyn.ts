import { IDecoratorOptions } from "../interfaces";

export function asyn<Fn extends (...args: any[]) => Promise<any>>(
    func: Fn, opts?: IDecoratorOptions,
): Fn {
    return ((...args: any[]) => {
        return func(...args);
    }) as Fn;
}
