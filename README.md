# CHIML

## What is it?

CHIML (Chimera Markup Language) is a declarative dependency injection framework based on `Ramda.js`. CHIML allows you to build software by composing your pre-existing components (`CLI programs`, or `JavasScript modules`).

## What problems does it solve?

* Spaghetti code
* Unclear error message
* Code redundancy

## Who is it for?

* Developers who want to build solution by composing `Javascript module` and `CLI programs` in a declarative way using `YAML`.
* Developers who don't want to memorize a lot of keyword. CHIML only has 5 keywords: `injection`, `bootstrap`, `component`, `arity`, `setup`, `parts`.

# Convention and Philosophy

* No global state.
* What to do instead of how to do.
* Readability matters, brevity follows.
* Currying and composition are prioritized.
* Components should be small and composable.
* Structure should be flat and sparse.

# Install

This package require nodejs version `10.12.0` or newer since it use `module.createRequireFromPath`.

```
npm install -g chiml
```

# API

By default, Chiml injects 2 Objects:

* R: [Ramda Js](https://ramdajs.com/docs/)
* X: Chiml parser, injector, and some utilities not provided in ramda
    - `declare: (partialDeclarativeConfig: Partial<IUserDeclarativeConfig>) => AnyFunction;`
    - `inject: (containerFile: string, injectionFile?: string) => AnyFunction;`
    - `initClassAndRun: (configs: Partial<IClassRunnerConfig>) => any;`
    - `getMethodEvaluator: (methodName: string, ...args: any[]) => (obj: IObjectWithMethod) => any;`
    - `getMethodExecutor: <T extends IObjectWithMethod>(methodName: string, ...args: any[]) => (obj: T) => T;`
    - `concurrent: (...fnList: AnyAsyncFunction[]) => AnyAsyncFunction;`
    - `wrapCommand: (stringCommand: string) => AnyAsyncFunction;`
    - `wrapNodeback: (fn: AnyFunction) => AnyAsyncFunction;`

# Examples

* [Animal Calendar](./example/animal-calendar/)
* [Microservice](./example/microservice/)
