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

  # compose results using JavaScript Synchronous Function
  - (c, d) -> (x, y) => x * y -> e

  # or using JSON RPC
  #- ("http://server.com", "multi", c, d) -> [sys.jsonRpcRequest] -> e

  # or using [JavaScript Asynchronous] Function
  #- (c, d) -> [(x, y, cb) => cb(null, x + y)] -> e

  # or using <JavaScript Promise>
  #- (c, d) -> (x, y) => Promise.resolve(x, y)) -> myPromise
  #- <myPromise> -> e

  # or using {JavaScript Synchronous Function} again
  #- (c, d) -> {(x, y) => x * y} -> e

  # or using {JavaScript Synchronous Function} again, without fat arrow
  #- (c, d) -> {function (x, y) {return x * y;}} -> e

  # or using External JavaScript Library
  #- (require("./myLib.js")) --> lib
  #- (c, d) -> {lib.add} -> e
```

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

# Grammar
```
<program> ::= <completeVars>
              <command>

<command> ::= <completeCommand>
            | <shortCommand>

<completeCommand> ::= <completeIns>
                      <completeOut>
                      <completeIf>
                      "do: "<singleCommand><newLine>
                      <completeWhile>

                    | <completeIns>
                      <completeOut>
                      <completeIf>
                      "parallel: "<singleCommand><newLine>
                      <completeWhile>

                    | <completeIns>
                      <completeOut>
                      <completeIf>
                      "do: "<commandList>
                      <completeWhile>

                    | <completeIns>
                      <completeOut>
                      <completeIf>
                      "parallel: "<commandList>
                      <completeWhile>

                    | "map: "<variableName>
                      "into: "<variableName>
                      <completeCommand>

                    | "filter: "<variableName>
                      "into: "<variableName>
                      <completeCommand>

<shortCommand> ::= "("<ins>") -> " <singleCommand> " -> " <out><newLine>
                 | "("<ins>") -> " <singleCommand> "<newLine>
                 | <singleCommand> " -> " <out><newLine>
                 | "("<ins>") --> " <out><newLine>
                 | ""<out> " <-- ("<ins>")"<newLine>

<commandList>  ::= "- "<command>
                 | <commandList><commandList>

<completeVars>  ::= ""
                  | "vars: "<variableList><newLine>

<completeIns>   ::= ""
                  | "ins: "<ins><newLine>

<completeOut>   ::= ""
                  | "out: "<out><newLine>

<completeIf>    ::= ""
                  | "if: "<condition><newLine>

<completeWhile> ::= ""
                  | "while: "<condition><newLine>

<ins> ::= <variableList>

<out> ::= <variableName>

<singleCommand> ::= <cliCommand>
                  | <jsAnonymousFunction>
                  | "{"<jsSyncFunction>"}"
                  | "["<jsAsyncFunction>"]"
                  | "<"<jsPromise>">"

<variableName> ::= <alpha>
                 | <alpha><alphaNumeric>

<variableList> ::= <variableName>
                 | <variableName>","<variableList>

<condition> ::= "true"
              | "false"
              | Any JavaScript statement evaluated to either "true" or "false"

<string> ::= <string><string>
           | <alphanumeric>
           | <space>
           | <symbol>

<alphanumeric> ::= <alphanumeric><alphanumeric>
                 | <alpha>
                 | <integer>

<alpha> ::= <letter><alpha>

<letter> ::= "a" | "b" | "c" | "d" | "e" | "f" | "g" | "h" | "i" | "j" | "k" | "l" | "m"
           | "n" | "o" | "p" | "q" | "r" | "s" | "t" | "u" | "v" | "w" | "x" | "y" | "z"
           | "A" | "B" | "C" | "D" | "E" | "F" | "G" | "H" | "I" | "J" | "K" | "L" | "M"
           | "N" | "O" | "P" | "Q" | "R" | "S" | "T" | "U" | "V" | "W" | "X" | "Y" | "Z"

<space> ::= " "

<newLine> ::= "\n"

<symbol> ::= "|" | " " | "!" | "#" | "$" | "%" | "&" | "(" | ")" | "*" | "+" | "," | "-"
           | "." | "/" | ":" | ";" | ">" | "=" | "<" | "?" | "@" | "[" | "\" | "]" | "^"
           | "_" | "`" | "{" | "}" | "~"

<integer> ::= <digit>
            | <digit><integer>

<digit> ::= "0" | "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9"

<cliCommand> ::= CLI Command
<jsAnonymousFunction> ::= JavaScript Anonymous Function
<jsSyncFunction> ::= JavaScript Function (i.e: one that return value)
<jsAsyncFunction> ::= JavaScript Asynhronous Function (i.e: one with callback)
<jsPromise> ::= JavaScript Promise
```

# Reserved Variables

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
