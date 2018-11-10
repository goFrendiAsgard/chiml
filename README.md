# CHIML

CHIML is stands for Chimera-Lib. It is a collection of useful libraries that keep you sane while doing some typescript.

# Goals

* Creating a declarative composition tool to let developers build software based on pre-existing components (either written in Javascript or any other language).
* Promoting strong composition structure.
* Minimizing runtime-error by checking everything at first.
* Eliminating the use of vm module.
* Eliminating magics while reducing verbosity.

# Example

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
    const asyncRootSquare = X.wrapCommand(commandRootSquare);
    const asyncMultiply = X.wrapNodeback(nodebackMultiply);
    const asyncAdd = X.wrapSync(syncAdd);
    const asyncAddAndMinus = X.parallel(asyncAdd, asyncMinus);
    const convergedAsyncMultiply = X.foldInput(asyncMultiply);
    const main: (a: number, b: number) => Promise<number> = X.pipeP(
        asyncAddAndMinus,
        convergedAsyncMultiply,
        asyncRootSquare,
    );
    // action
    return main(a, b);
}
```

## Main Program (Declarative)

```typescript
// main.ts
import { X } from "chiml";
import { asyncMinus, commandRootSquare, nodebackMultiply, syncAdd } from "./lib";

export default const main = X.declarative({
    // vals can contains any values/JavaScript object
    vals: { asyncMinus, commandRootSquare, nodebackMultiply, syncAdd, ...X },
    // comp should only contains valid JSON object
    comp: {
        asyncRootSquare: {
            vals: ["<commandRootSquare>"],
            pipe: "wrapCommand",
        },
        asyncMultiply: {
            vals: ["<nodebackMultiply>"],
            pipe: "wrapNodeback",
        },
        asyncAdd: {
            vals: ["<syncAdd>"],
            pipe: "wrapSync",
        },
        asyncAddAndMinus: {
            vals: ["<asyncAdd>", "<asyncMinus>"],
            pipe: "parallel",
        },
        convergedAsyncMultiply: {
            vals: ["<asyncMultiply>"],
            pipe: "foldInput",
        },
        main: {
            vals: [
                "<asyncAddAndMinus>",
                "<convergedAsyncMultiply>",
                "<asyncRootSquare>",
            ],
            pipe: "pipeP",
        },
    },
    main: "main",
});
```


## Execution

```
> chie main.ts 10 8
6
```

