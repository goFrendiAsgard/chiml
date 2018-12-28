# CHIML

## What is it?

CHIML (Chimera Markup Language) is a declarative dependency injection framework based on `Ramda.js`. CHIML allows you to build software by composing your pre-existing components (`CLI programs`, or `JavasScript modules`).

## What problems does it solve?

* Spaghetti code
* Unclear error message
* Code redundancy

## Who is it for?

* Developers who want to build solution by composing `Javascript module` and `CLI programs` in a declarative way using `YAML`.
* Developers who don't want to memorize a lot of keyword. CHIML only has 7 keywords: `ins`, `out`, `injection`, `bootstrap`, `component`, `perform`, `parts`.

# Convention and Philosophy

* States are immutable once it is set.
* Components are functions.
* Naming is important:
    - Everything that do something should be named as `verb`
    - Everything else should be named as `noun`
* Composing components is better than creating nested structure.
* Container and injections should be independent to each others.
* If you write similar code several times, you do it wrong. You should break down your code into smaller components instead.

# Install

```
npm install -g chiml
```

# API

By default, Chiml injects 2 Objects:

* R: [Ramda Js](https://ramdajs.com/docs/)
* X: Chiml parser, injector, and some utilities not provided in ramda
    - declare: (partialDeclarativeConfig: Partial<IUserDeclarativeConfig>) => AnyFunction;
    - inject: (containerFile: string, injectionFile?: string) => AnyFunction;
    - foldInput: (fn: AnyFunction) => ((arr: any[]) => any);
    - spreadInput: (fn: (arr: any[]) => any) => AnyFunction;
    - concurrent: (...fnList: AnyAsyncFunction[]) => AnyAsyncFunction;
    - wrapCommand: (stringCommand: string) => AnyAsyncFunction;
    - wrapNodeback: (fn: AnyFunction) => AnyAsyncFunction;
    - wrapSync: (fn: AnyFunction) => AnyAsyncFunction;

# Example (Calendar)

* [Calendar](./example/calendar/)
* [Microservice](./example/microservice/)
