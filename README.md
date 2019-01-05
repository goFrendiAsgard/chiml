# CHIML

## What is it?

CHIML (Chimera Markup Language) is a declarative dependency injection framework based on `Ramda.js`. CHIML allows you to build software by composing your pre-existing components (`CLI programs`, or `JavasScript modules`).

## What problems does it solve?

* Spaghetti code
* Unclear error message
* Code redundancy

## Who is it for?

* Developers who want to build solution by composing `Javascript module` and `CLI programs` in a declarative way using `YAML`.
* Developers who don't want to memorize a lot of keyword. CHIML only has 5 keywords: `injection`, `bootstrap`, `component`, `perform`, `parts`.

# Convention and Philosophy

* Components are functions.
* Naming is important:
    - Everything that do something should be named as `verb`
    - Everything else should be named as `noun`
* Composing components is better than creating nested structure.
* Container and injections should be independent to each others.
* If you write similar code several times, you do it wrong. You should break down your code into smaller components instead.
* Brevity matters, but never sacrifice readability for brevity.

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
