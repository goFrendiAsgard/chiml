# CHIML

CHIML stands for Chimera Markup Language, `(JavaScript + YAML + GoodIntentions) --> CHIML`. It is an orchestration language for Chimera-Framework. (__PS:__ This one is a complete rewrite).

CHIML allows you to call pre-existing programs and compose them like this one:

```yaml
# fileName: program.chiml
ins: a, b
out: e
do:
  # call external Python and Java program
  - parallel:
    - (a, b) -> python3 lib/add.py -> c
    - (a, b) -> java -cp lib Minus -> d

  # compose results using JavaScript function
  - (c, d) -> (x, y) => x * y -> e

  # or using {JavaScript function} again
  #- (c, d) -> {(x, y) => x * y} -> e

  # or using {JavaScript function} again, without fat arrow
  #- (c, d) -> {function (x, y) {return x * y;}} -> e

  # or using [JavaScript function with error-first callback as last parameter]
  #- (c, d) -> [(x, y, cb) => cb(null, x + y)] -> e

  # or using <JavaScript promise>
  #- (c, d) -> (x, y) => Promise.resolve(x, y)) -> myPromise
  #- <myPromise> -> e

  # or using external javaScript library
  #- (require("./myLib.js")) --> lib
  #- (c, d) -> {lib.add} -> e

  # or call remote procedure call (JSON-RPC)
  #- ("http://server.com", "multi", c, d) -> [sys.jsonRpcRequest] -> e
```

Using CHIML, you can use synchonous function, invoke external command, use promise, and even call JSON-RPC in similar manners.

## Execution

You can execute any CHIML script by using `chie` command:

```bash
> chie program.chiml 10 6
64
```

## Compilation

CHIML is also compilable into JavaScript by using `chic` command:

```bash
> chic program.chiml
JavaScript file created:
- /home/gofrendi/chiml/examples/program.js

> ls
libs  node_modules  program.chiml  program.js

> node program.js 10 8
36
```

# Installation

```bash
> node install --global chiml
```

# Test

```bash
> npm link --global
> npm test
```

# Examples

* [Simple](./examples/simple): Call external Python and Java Program.
* [Composition](./examples/composition): Call other CHIML script, Use JavaScript functions and Promise.
* [Branch](./examples/branch): Use branch control to determine whether a student `pass` or `fail`.
* [Loop](./examples/loop): Use loop control to calculate factorial of a number.
* [Map](./examples/map): Functional map to get square of numbers.
* [Filter](./examples/filter): Functional filter to get even numbers.
* [Reduce](./examples/reduce): Functional reduce to get sum of numbers.
* [Web](./examples/web): Make a web server that has a single page and a JSON-RPC endpoint.
* [Interactive](./examples/interactive): Number guessing game using loop, `[sys.prompt]` and `[sys.print]`.
* [Web Advance](./examples/web-advance): Make a web server the semi-professional way :).

# Technical Specification

## Program Structure

CHIML program should contains a single `command` that should be written as `string` or `Command Object` in `YAML` format. The `CommandObject` should comply the specification below:

```typescript
// Structure of a `command`
interface CommandObject{
  ins : string | string[],    // program input, can be written as string array or comma
                              // separated string like: "a, b, c"

  out: string,                // program output

  vars: {[key: string]: any}, // object, initial values of variables

  if: string = "true",        // branch condition, default to be `true`

                              // `map`, `filter`, and `reduce` are mutually exclussive
  map: string,                // variable name for mapping
  filter: string,             // variable name for filtering
  reduce: string,             // variable name for reducing

  into: string,               // variable name, output of `map`, `filter`, or `reduce`

  accumulator: string,        // ignored unless `reduce` is presence, default to be `0`

                              // `do` and `parallel` are mutually exclusive
  do: command | command[],    // command or list of commands that should be executed in serries
  parallel: command[],        // list of commands that should be executed in parallel

  while: string = "false",    // loop condition, default to be "false"
};

// CHIML program can be written as an object or as a string
type command = CommandObject | string; 
```

Command can be written as string with following format:

* `(ins) -> process -> out`
* `(ins) -> process`
* `process -> out`
* `(ins) --> out`

The `->` and `-->` can also be reversed into `<-` and `<--`, so that the following is also true:

* `out <- process <- (ins)`
* `process <- (ins)`
* `out <- process`
* `out <-- (ins)`

Finally, a process can be a JavaScript Function, a JavaScript Promise, or any valid CLI command. In order to distinguish which is which, the following format is used:

* Any `JavaScript anonymous function` or `CLI command` can be written as is.
* Any `JavaScript function that return value`, should be wrapped with `{` and `}`.
* Any `JavaScript function that has error-first-callback as it's last parameter`, should be wrapped with `[` and `]`.
* Any `Javascript promise` should be wrapped with `<` and `>`.

## Reserved Variables

Some variables are used and generated automatically. You should stay away from these variables unless you have a very good reason. Below is the list of reserved variables:

* `__accumulator: number`: Temporary accumulator for `reduce` function.
* `__cmd: Function`: Function to run terminal based application.
* `__dst: Array<any>`: Temporary storage for storing results from `map`, `filter`, or `reduce` function.
* `__element: any`: First input for `map`, `filter`, or `reduce` function.
* `__error: Error`: Error object.
* `__ins: Array<any>`: Task inputs.
* `__isCompiled: boolean`: Compilation flag. `true` for JavaScript compilation script, `false` for uncompiled CHIML.
* `__filtered: Array<any>`: Temporary storage to store the result of `filter` function.
* `__first<%- taskId %>: boolean`: Flag to indicate if the task is executed for the first time or inside a recursive loop.
* `__fn<%- taskId %>: Function`: Functions corresponded to tasks. Returning and wrap a `promise`.
* `__main<%- taskId %>: Function`: Functions corresponded to tasks. Wrap `__unit<%- taskId %>`.
* `__parseIns: Function`: Function to parse inputs.
* `__promise<%- taskId %>: Promise`: Promise corressponded to tasks. Wrapped inside `__fn<%- taskId %>`.
* `__promises: Array<Promise>`: Array of promises, used for parallel execution.
* `__reject: Function`: Promise reject function
* `__resolve: Function`: Promise resolve vunction
* `__result: any`: Temporary storage to store calculation result.
* `__src: Array<any>`: Temporary storage for storing array that will be mapped into `__element`.
* `__unit<%- taskId %>`: Function that return `__promise<%- taskId %>`.
