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

## Main Program (Imperative)

```typescript
// main.ts
import * as X from "chiml";
import { add, minus, multiply, rootSquare } from "lib";
export default async function main(n1: number, n2: number): Promises<number> {
    const [addResult, minusResult] = X.parallel(
        X.wrap(add)(n1, n2),
        X.wrap(minus)(n1, n2),
    )();
    const multResult = X.wrap(multiply)(addResult, minusResult);
    return X.wrap(rootSquare)(multResult);
}
```

## Main Program (Functional)

```typescript
// main.ts
import * as X from "chiml";
import { add, minus, multiply, rootSquare } from "lib";
export default const main = X.pipe(
    X.parallel(
        add,
        minus,
    ),
    X.curry(X.reduce(multiply), 2)(1),
    rootSquare,
);
```

## Execution

```
> chie main.ts 10 8
6
```

# Example 2

## Main Program (Imperative)

```typescript
// main.ts
import * as X from "chiml";
export default async function main(data: number[]): Promises<any> {
    const squared = X.map((x) => x * x)(data);
    const even = X.filter((x) => x % 2 === 0)( data);
    const sum = X.reduce((x, y) => x + y)(0, data);
    return { data, even, squared, sum };
}
```

## Main Program (Functional)

```typescript
// main.ts
import * as X from "chiml";
export default const main = X.pipe(
    X.parallel(
        (data) => data,
        X.map((x) => x * x),
        X.filter((x) => x % 2 === 0),
        X.reduce((x, y) => x + y),
    ),
    (r) => { data: r[0], even: r[1], squared: r[2], sum: r[3] }
)
```

## Execution

```
> chie main.ts "[1, 2, 3, 4, 5]"
{
    "data": [ 1, 2, 3, 4, 5 ],
    "even": [ 2, 4 ],
    "squared": [ 1, 4, 9, 16, 25 ],
    "sum": 15
}
```

# TODO

* X.declarative is better to take a function that has `ctx` parameter as it's argument.
