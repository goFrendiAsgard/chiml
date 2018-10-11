# CHIML

CHIML is stands for Chimera-Lib. It is a collection of useful libraries that keep you sane while doing some typescript.

# Example 1

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

    // parallel
    const [ addResult, minusResult ] = await $(
        $(add, n1, n2),
        $(minus, n1, n2),
    );
    // compose
    return await $([rootSquare, multiply], addResult, minusResult);

}
```

## Execution

```
chie main.ts 10 8
6
```

# Example 2

## Main

```typescript
// main.ts
import { chiml as $, map, filter, reduce } from "chiml";
export default async function main(): Promises<any> {
    const data: number[] = [1, 2, 3, 4, 5];
    const squared = $(map((x) => x * x), data);
    const even = $(filter((x) => x % 2 === 0), data);
    const sum = $(reduce((x, y = 0) => x + y), data);
    return { data, even, squared, sum };
}
```

## Execution

```
chie main.ts
{
    "data": [ 1, 2, 3, 4, 5 ],
    "even": [ 2, 4 ],
    "squared": [ 1, 4, 9, 16, 25 ],
    "sum": 15 
}
```

# Spec

* If all arguments are `promise`s, it will do `Promise.all` and return the result
* If the first argument is `array`, it will be composed in reverse order. I.e: `$([a, b], c, d) ---> $(b, c, d).then((result) => $(a, result))`
* If the first argument is `string`, it wil be treated as shell command and will be executed with the rest of the arguments as shell command's arguments. The result should be a `promise`
* If the first argument is `async function`, it will be executed with the rest of arguments as function's argument. The return value should be a promise
* If the first argument is `function with callback`, it will be executed with the rest of arguments as function's argument. The return value should be a promise
* If the first argument is `synchronous function`, it will be executed with the rest of arguments as function's argument. The return value should be a promise

## Todo

* Make 100% Coverage.
* Implement `map`, `filter`, and `reduce`.
* Implement a declarative mode of this.