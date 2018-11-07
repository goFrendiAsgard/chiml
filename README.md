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

export default const main = X.pipeP(
    X.parallel(syncAdd, asyncMinus),
    X.reduce(X.nodeback(nodebackMultiply), 1),
    X.command(commandRootSquare)
);
```

## Execution

```
> chie main.ts 10 8
6
```

