# CHIML

CHIML is stands for Chimera-Lib. It is a collection of useful libraries that keep you sane while doing some typescript.

# Concept

**NOTE :** This concept is not fully implemented and is subject to change

## User's Library

```typescript
// lib.ts
export function add(a: number, b: number): number {
    return a + b;
}

export function minus(a: number, b: number): Promise<number> {
    return Promise.resolve(a - b);
}

export function multiply(a: number, b: number, callback: (error: Error, result: number) => void) {
    callback(null, a * b);
}

export const rootSquare = "python3 rootSquare.py";
```

## Main Program

```typescript
// main.ts
import { chiml as $ } from "chiml";
import { add, minus, multiply, rootSquare } from "lib";

export default async function main(n1: number, n2: number): Promises<any> {

    const [ addResult, minusResult ] = await $(
        $(add, n1, n2),
        $(minus, n1, n2),
    );
    return await $([rootSquare, multiply], addResult, minusResult);

}
```

## Execution

```
chie main.ts 10 8
6
```

## Spec

* If all parameter are promise, it will do `Promise.all` and return the result
* If the first parameter is array, it will compose the array into one single async function
    - if there is no other parameter, the async function will be returned
    - If there are other parameters, the async function should be executed with the rest of the parameters as inputs.
* If this first parameter is string, it will run the cmd
* If the first parameter is sync function, it will be turned into async function, and executed with rest of the parameters as inputs
* If the first parameter is callback function, it will be turned into async function, and executed with rest of the parameters as inputs
* If the first parameter is async function, it will be executed with rest of the parameters as inputs
* If the first parameter is a promise, nothing should be done