# CHIML

CHIML stands for Chimera Markup Language, `(JavaScript + YAML + GoodIntentions) --> CHIML`. It is an orchestration language for Chimera-Framework. (__PS:__ This one is a complete rewrite).

CHIML allows you to call pre-existing programs and compose them like this one:

```yaml
# filename: myProgram.chiml
ins: a, b
out: e
do:
  # call python and java program in parallel
  - parallel:
    - |(a, b) -> python add.py -> c
    - |(a, b) -> java minus -> d
  # compose the result javascript arrow function
  - |(c, d) -> (x, y) => x * y -> e
```

## Execution

You can execute any CHIML script by using `chie` command:

```bash
> chie myProgram.chiml 10 6
64
```

## Compilation

CHIML is also compilable into JavaScript by using `chic` command:

```bash
> chic myProgram.chiml
> ls
myProgram.chiml    myProgram.js
> node myProgram.js 10 8
36
```

# Installation

```
node install --global chiml
```

# Test

```
npm test
```
