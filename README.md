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
  # compose results using JavaScript
  - (c, d) -> (x, y) => x * y -> e
  # or even calling json rpc
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
- /home/gofrendi/chiml/sample/program.js

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

* [Simple](./sample/simple): Call external Python and Java Program
* [Composition](./sample/composition): Call other CHIML script, Use JavaScript functions and Promise
* [Web](./sample/web): Make a web server that has a single page and a JSON-RPC endpoint.

[Click here](./sample)

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
