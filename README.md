# CHIML

CHIML (Chimera Markup Language) is a component-oriented orchestration language based on YAML. CHIML allows you to build software by composing your pre-existing components (API, command-line utility, or JavasScript functions). 

CHIML also provide several components based on `Ramda.js`.

# Philosophy

* Naming is important. It should be clear and easy to understand.
* Everything is components. Small components are better than monolith functions
* Dependency injection should be easy

# Goals

* Creating a declarative composition tool to let developers build software based on pre-existing components (either written in Javascript or any other language).
* Promoting strong composition structure.
* Promoting `DRY` principle.
* Promoting `inversion-of-control` principle.
* Minimizing future `runtime-error` by checking everything at first.
* Eliminating the use of `vm` module.
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

export function main(a: number, b: number): Promise<void> {
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
export const main = X.declarative({
    ins: ["a", "b"],
    out: "f",
    bootstrap: "main",
    // parts can contains any values/JavaScript object
    injection: { asyncMinus, commandRootSquare, nodebackMultiply, syncAdd, ...X },
    // comp should only contains valid JSON object
    component: {
        main: {
            pipe: "pipeP",
            parts: [
                "<aPlusBAndAMinB>",
                "<cByD>",
                "<rootSquareE>",
            ],
        },
        aPlusBAndAMinB: {
            pipe: "parallel",
            parts: ["<aPlusB>", "<aMinB>"],
        },
        aPlusB: {
            ins: ["a", "b"],
            out: "c",
            pipe: "syncAdd",
        },
        aMinB: {
            ins: ["a", "b"],
            out: "d",
            pipe: "asyncMinus",
        },
        cByD: {
            ins: ["c", "d"],
            out: "e",
            pipe: "wrapNodeback",
            parts: "<nodebackMultiply>",
        },
        rootSquareE: {
            ins: "e",
            out: "f",
            pipe: "wrapCommand",
            parts: ["<commandRootSquare>"],
        },
    },
});
```


## Execution

```
> tsc main.ts
> node main.js 10 8
6
```

