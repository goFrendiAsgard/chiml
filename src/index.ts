import { IChimlResult } from "./interfaces";

export function chiml(...args: any[]): IChimlResult {
    const arg = args[0];
    const restArgs = args.slice(1);
    if (isAllPromise(args)) {
        if (args.length === 1) {
            // args only contain a single promise, return it
            return arg;
        }
         // Every element in `args` is Promise, do Promise.all
        return Promise.all(args);
    }
    if (Array.isArray(arg)) {
        return compose(arg, ...restArgs);
    }
    // create resolver and execute the resolver
    try {
        const result = resolveCmdOrFunction(arg, ...restArgs);
        if (isPromise(result)) {
            return result;
        }
        return Promise.resolve(result);
    } catch (error) {
        return Promise.reject(error);
    }
}

function compose(rawActions: any[], ...args: any[]): Promise<any> {
    const actions = rawActions.reverse();
    let result: Promise<any> = Promise.resolve(null);
    for (let i = 0; i < args.length; i++) {
        const action = actions[i];
        if (i === 0) {
            result = chiml(action, ...args);
            continue;
        }
        result = result.then((arg) => chiml(action, arg));
    }
    return result;
}

function resolveCmdOrFunction(func: any, ...args: any[]): any|Promise<any> {
    if (typeof func === "string") {
        // TODO: sementara gini dulu, ini cmd maksudnya
        return func;
    }
    if (typeof func === "function") {
        return resolveFunction(func, ...args);
    }
}

function resolveFunction(func: (...args: any[]) => any, ...args: any[]): Promise<any> {
    return new Promise((resolve, reject) => {
        function callback(error, ...result) {
            if (error) {
                return reject(error);
            }
            if (result.length === 1) {
                return resolve(result[0]);
            }
            return resolve(result);
        }
        args.push(callback);
        try {
            const functionResult = func(...args);
            if (isPromise(functionResult)) {
                functionResult.then(resolve).catch(reject);
            } else if (typeof functionResult !== "undefined") {
                resolve(functionResult);
            }
        } catch (error) {
            reject(error);
        }
    });
}

function isAllPromise(args: any[]): boolean {
    for (const arg of args) {
        if (!isPromise(arg)) {
            return false;
        }
    }
    return true;
}

/**
 * @param arg
 * @description return boolean value representing whether the `arg` is a `Promise` or not
 */
function isPromise(arg: any): boolean {
    return arg && arg.then ? true : false;
}
