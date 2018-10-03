# CHIML

CHIML is stands for Chimera-Lib. It is a collection of useful libraries that keep you sane while doing some typescript.

# Concept

## User's Library

```typescript
// lib.ts
export function syncAdd(a: number, b: number): number {
  return a + b;
}

export function async asyncAdd(a: number, b: number): Promise<number> {
  return a + b;
}

export function callbackAdd(a: number, b: number, callback:(error: Error, number: number) => void) {
  callback(null, a + b);
}

export const cmd = "python3 add.py";
```

## Main Program

```typescript
// main.ts
import * as chiml from "chiml";
import { asyncAdd, callbackAdd, cmd, syncAdd } from "lib";

export default async function main(input1: any, input2: any): Promises<any> {
  let myNumber: number = input1;
  myNumber = await @chiml.sync add(myNumber, input2);
  myNumber = await @chiml.async asyncAdd(myNumber, input2);
  myNumber = await @chiml.callback callbackAdd(myNumber, input2);
  myNumber = await @chiml.async exec(cmd, myNumber, input2);
  const [x, y, z] = await chiml.parallel(
    add(myNumber, input),
    add(myNumber, input),
    add(myNumber, input),
  );
}
```