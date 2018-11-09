# CHIML

CHIML is stands for Chimera-Lib. It is a collection of useful libraries that keep you sane while doing some typescript.

# Example 1

## User's Library

```typescript
// lib.ts
export function syncAdd(a: number, b: number): number {
    return a + b;
}
export function asyncMinus(a: number, b: number): Promise<number> {
    return Promise.resolve(a - b);
}
export function nodebackMultiply(a: number, b: number, callback: (error: Error, result: number) => void) {
    callback(null, a * b);
}
export const commandRootSquare = "python3 rootSquare.py";
```

## Main Program (Functional)

```typescript
// main.ts
import { X } from "chiml";
import { asyncMinus, commandRootSquare, nodebackMultiply, syncAdd } from "./lib";

export default function main(a: number, b: number): Promise<void> {
    const asyncRootSquare = X.wrapCommand(1, commandRootSquare);
    const asyncMultiply = X.wrapNodeback(2, nodebackMultiply);
    const asyncAdd = X.wrapSync(2, syncAdd);
    const asyncAddAndMinus = X.parallel(2, [asyncAdd, asyncMinus]);
    const convergedAsyncMultiply = X.convergeInput(asyncMultiply);
    const main: (a: number, b: number) => Promise<number> = X.pipeP(
        asyncAddAndMinus,
        convergedAsyncMultiply,
        asyncRootSquare,
    );
    // action
    return await main(a, b);
}
```

## Main Program (Declarative)

```typescript
// main.ts
import { X } from "chiml";
import { asyncMinus, commandRootSquare, nodebackMultiply, syncAdd } from "./lib";

export default const main = X.declarative({
    // define can contains any valid javascript object
    define: { asyncMinus, commandRootSquare, nodebackMultiply, syncAdd, X },
    // declare and main should only contains valid JSON object
    declare: {
        asyncRootSquare: {
            X.wrapCommand: [1, "<commandRootSquare>"],
        },
        asyncMultiply: {
            X.wrapNodeback: [2, "<nodebackMultiply>"],
        },
        asyncAdd: {
            X.wrapSync: [2, "<syncAdd>"],
        },
        asyncAddAndMinus: {
            X.parallel: [2, ["<asyncAdd>", "<asyncMinus>"]],
        },
        convergedAsyncMultiply: {
            X.convergeInput: "<asyncMultiply>",
        ],
        main: {
            X.pipeP: [
                "<asyncAddAndMinus>",
                "<convergedAsyncMultiply>",
                "<asyncRootSquare>",
            ],
        },
    },
    do: "<main>",
});
```


## Execution

```
> chie main.ts 10 8
6
```

