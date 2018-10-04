# CHIML

CHIML is stands for Chimera-Lib. It is a collection of useful libraries that keep you sane while doing some typescript.

# Concept

**NOTE :** This concept is not fully implemented and is subject to change

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
import { chiml as $ } from "chiml";
import { asyncAdd, callbackAdd, cmd, syncAdd } from "lib";

export default async function main(input1: any, input2: any): Promises<any> {

    let myNumber: number = input1;

    myNumber = await $(add, myNumber, input2);
    myNumber = await $(asyncAdd, myNumber, input2);
    myNumber = await $(callbackAdd, myNumber, input2);
    myNumber = await $(cmd, myNumber, input2);

    const [x, y, z] = await $.parallel(
        $(add, myNumber, 1),
        $(add, myNumber, 2),
        $(add, myNumber, 3),
    );
    return [myNumber, x, y, z];

}
```

## Execution

```
chie main.ts 5 1
11, 12, 13, 14
```