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

## Main Program (In Typescript, imperative)

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

## Main Program (In Typescript, free of side effect)

```typescript
// main.ts
import * as X from "chiml";
import { add, minus, multiply, rootSquare } from "lib";
export default async function main(n1: number, n2: number): Promises<number> {
    return await X.pipe(
        X.parallel(
            X.wrap(add)(n1, n2),
            X.wrap(minus)(n1, n2),
        ),
        X.curry(X.reduce(multiply), 2, 1),
        rootSquare,
    )();
}
```


## Main Program (In Yaml, imperative)

```yaml
# main.yml
import:
    lib: [ add, minus, multiply, rootSquare ]
ins: [ n1:number, n2:number ]
vars: [ addResult:number, minusResult:number ]
out: result
do:
    - parallel:
        - ins: [n1, n2]
          out: addResult
          do: <add>
        - ins: [n1, n2]
          out: minusResult
          do: <minus>
    - ins: [ addResult, minusResult ]
      out: result
      do: [ multiply, rootSquare ]
```

## Main Program (In Yaml, free of side effect)

```yaml
# main.yml
import:
    lib: [ add, minus, multiply, rootSquare ]
ins: [ n1:number, n2:number ]
vars: [ addResult:number, minusResult:number ]
out: result
do:
    - out: result
      pipe:
        - parallel:
            - ins: [n1, n2]
              out: addResult
              do: <add>
            - ins: [n1, n2]
              out: minusResult
              do: <minus>
        - do: <X.curry(X.reduce(multiply), 2, 1)>
        - do: <rootSquare>
```


## Execution

```
> chie main.ts 10 8
6

> chie main.yml 10 8
6
```

# Example 2

## Main Program (In Typescript)

```typescript
// main.ts
import * as X from "chiml";
export default async function main(): Promises<any> {
    const data: number[] = [1, 2, 3, 4, 5];
    const squared = X.map((x) => x * x)(data);
    const even = X.filter((x) => x % 2 === 0)( data);
    const sum = X.reduce((x, y) => x + y)(0, data);
    return { data, even, squared, sum };
}
```

## Main Program (In Yaml)

```yaml
# main.yml
vars:
    data:number[]: [1, 2, 3, 4, 5]
    result:{[key: string]: number[]}:
        squared: []
        even: []
        sum: []
out: result
do:
    - ins: data
      out: result.squared
      map: <(x) => x * x>
    - ins: data
      out: result.even
      filter: <(x) => x % 2 === 0>
    - ins: data
      out: result.even
      accumulator: 0
      reduce: <(x, y) => x + y>
```

## Execution

```
> chie main.ts
{
    "data": [ 1, 2, 3, 4, 5 ],
    "even": [ 2, 4 ],
    "squared": [ 1, 4, 9, 16, 25 ],
    "sum": 15
}

> chie main.yml
{
    "data": [ 1, 2, 3, 4, 5 ],
    "even": [ 2, 4 ],
    "squared": [ 1, 4, 9, 16, 25 ],
    "sum": 15
}
```
