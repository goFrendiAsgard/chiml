# CHIML

CHIML (Chimera Markup Language) is a dependency injection framework based on `Ramda.js`. CHIML allows you to build software by composing your pre-existing components (API, command-line utility, or JavasScript functions).

# Convention

* Naming is important:
    - Component that do something should be named as `verb`
    - Component that not do anything should be named as `noun`
* No nested structure, instead of creating nested structure, declare components instead
* Container and injections should be independent to each others.

# Install

```
npm install -g chiml
```

# Example

## Goal

We want to show calendar on the browser. We also want to show a cute animal image next to the calendar.

![dog calendar](./example/static/calendar.png)

## Input

* `year`: any valid number

## Output

* `result`: HTML script that should be shown in the browser

## Bird-view Planning

```
1. `fetchImageAndCalendar`: fetch imageUrl from the internet and calendar from our local machine
2. `composeCalendar`: After getting the imageUrl and the calendar, compose them into HTML-script
3. `writeCalendar`: Save the HTML-script into a HTML-file
4. `showCalendar`: Open the HTML-file using a browser
```

This bird-view planning can be written in YAML as follow:

```yaml
ins: year
out: result
bootstrap: main
component:

    main:
        perform: pipeP
        parts:
            - <fetchImageAndCalendar>
            - <composeCalendar>
            - <writeCalendar>
            - <showCalendar>
```

## Implementation (without dependency-injection)

In order to make the implementation, we need to break-down our plan and make it more detail:

```
1. `fetchImageAndCalendar`: fetch imageUrl from the internet and calendar from our local machine
    1.1. `fetchImageUrl`: fetch random animal picture from the internet.
        1.1.2. `fetchImageObj`: fetch image from the internet. This link: `https://aws.random.cat/meow` gives you a random cat in JSON format. We can fetch the image using CURL.
        1.1.3. `getImageUrl`: After fetching the image object, we need to get the url. In our case, since the JSON response is similar to `{file: "http://some-place/random-cat.jpg"}`, we have to extract the `file` key.
    1.2. `fetchCalendar`: simply perform `ncal <year> -h`, and we will get the calendar
2. `composeCalendar`: After getting the imageUrl and the calendar, compose them into HTML-script. String concatenation should do it. And in UNIX-like system, we have `echo` command. So, we can just use it. No need to code anything.
3. `writeCalendar`: Save the HTML-script into a HTML-file. Writing to a calendar is as easy as `echo "content" > file.html`
4. `showCalendar`: Open the HTML-file using a browser. We can open google chrome usiing this command: `google-chrome file://some-folder/some-file.html`
```

Below is the detail implementation, as well as our executable CHIML program:

```yaml
# file: animal-calendar-no-injection.yml
ins: year
out: result
bootstrap: main
component:

    main:
        perform: pipeP
        parts:
            - <fetchImageAndCalendar>
            - <composeCalendar>
            - <writeCalendar>
            - <showCalendar>

    fetchImageAndCalendar:
        perform: concurrent
        parts:
            - <fetchImageUrl>
            - <fetchCalendar>

    composeCalendar:
        ins:
            - imageUrl
            - calendar
        out: result
        perform: wrapCommand
        parts: echo '<img src="' && echo ${1} && echo '"/>' && echo "<pre>" && echo ${2} && echo "</pre>"

    writeCalendar:
        ins: result
        perform: wrapCommand
        parts: echo ${1} > ${PWD}/calendar.html

    showCalendar:
        ins: []
        perform: wrapCommand
        parts: google-chrome file://${PWD}/calendar.html

    fetchCalendar:
        ins: year
        out: calendar
        perform: wrapCommand
        parts: ncal ${1} -h

    fetchImageUrl:
        out: imageUrl
        perform: pipeP
        parts:
            - <fetchImageObj>
            - <getImageUrl>

    fetchImageObj:
        ins: []
        perform: wrapCommand
        parts: curl https://aws.random.cat/meow

    getImageUrl:
        perform: prop
        parts: file
```

Now you can simply perform `chie -c animal-calendar-no-injection.yml 2017`

## Implementation (with dependency-injection)

Our previous implementation is highly opinionated. We use `ncal` to generate calendar, we use `random-cat API`, eventhough some users prefer dog, and we use google-chrome as our browser of choice. Now, how if you want dog instead of cat?

We have something named `inversion of control` aka `dependency injection`. What we need to do is providing the injection in other files. If you are familiar with typescript, you can make a directory with the following structure:

```
.
├── animal-calendar.yml
├── src
│   ├── baseInjection.ts
│   ├── catInjection.ts
│   ├── dogInjection.ts
│   └── interfaces
│       └── descriptor.ts
└── tsconfig.json
```

First of all, I define my `tsconfig.json` and `package.json` as follow:

__tsconfig.json__

```json
{
    "compileOnSave": true,
    "compilerOptions": {
        "module": "commonjs",
        "target": "es2015",
        "experimentalDecorators": true,
        "declaration": true,
        "outDir": "./dist",
        "rootDir": "./src"
    },
    "include": [
        "src/**/*"
    ],
    "sourceMaps": true
}
```

__package.json__

```json
{
  "name": "chiml",
  "version": "0.2.2",
  "description": "Flow-based-programming inspired dependency injection",
  "main": "dist/index.js",
  "bin": {
    "chie": "dist/chie.js"
  },
  "scripts": {
    "lint": "tslint -c tslint.json 'src/**/*.{ts,tsx}'",
    "pretest": "npm run lint && tsc --sourcemap && chmod 755 ./dist -R",
    "test": "jest"
  },
  "repository": {
    "type": "git",
    "url": "git+https://github.com/goFrendiAsgard/chiml.git"
  },
  "jest": {
    "transform": {
      "\\.(ts|tsx)$": "ts-jest"
    },
    "testRegex": "/.*\\.test\\.(ts|tsx)$",
    "moduleFileExtensions": [
      "ts",
      "tsx",
      "js"
    ],
    "verbose": false,
    "collectCoverage": true
  },
  "keywords": [
    "dependency-injection",
    "fbp-inspired",
    "orchestration-language",
    "chimera-framework"
  ],
  "author": "goFrendi",
  "license": "ISC",
  "bugs": {
    "url": "https://github.com/goFrendiAsgard/chiml/issues"
  },
  "homepage": "https://github.com/goFrendiAsgard/chiml#readme",
  "dependencies": {
    "get-args": "^2.0.0",
    "js-yaml": "^3.12.0",
    "ramda": "^0.25.0"
  },
  "devDependencies": {
    "@types/jest": "^23.3.2",
    "@types/js-yaml": "^3.11.2",
    "@types/node": "^10.11.3",
    "@types/ramda": "^0.26.0",
    "jest": "^23.6.0",
    "ts-jest": "^23.10.3",
    "tslint": "^5.11.0"
  }
}
```

Then we define our container, `animal-calendar.yml`:

__animal-calendar.yml__

```yaml
ins: year
out: result
bootstrap: main
injection: ./dist/catInjection.js
component:

    main:
        perform: pipeP
        parts:
            - <fetchImageAndCalendar>
            - <composeCalendar>
            - <writeCalendar>
            - <showCalendar>

    fetchImageAndCalendar:
        perform: concurrent
        parts:
            - <fetchImageUrl>
            - <fetchCalendar>

    composeCalendar:
        ins:
            - imageUrl
            - calendar
        out: result
        perform: composeHtml

    writeCalendar:
        ins: result
        perform: wrapCommand
        parts: <writeHtmlCommand>

    showCalendar:
        ins: []
        perform: wrapCommand
        parts: <showCalendarCommand>

    fetchCalendar:
        ins: year
        out: calendar
        perform: wrapCommand
        parts: <calCommand>

    fetchImageUrl:
        out: imageUrl
        perform: pipeP
        parts:
            - <fetchImageObj>
            - <getImageUrl>

    fetchImageObj:
        ins: []
        perform: wrapCommand
        parts: <imageFetcherCommand>

    getImageUrl:
        perform: prop
        parts: <imageKey>
```

By default, this container will use `./dist/cat.js`. The file is currently inexist. You might notice that we have some `undefined components` like `composeHtml`, `writeHtmlCommand`, `showCalendarCommand`, `calCommand`, `imageFetcherCommand`, and `imageKey`. It's okay, we will define the interface and the implementation later.

Interface is like a contract. In this case, we want our interface to provide several functions and values that can be used in the container. Below is the content of `/src/interfaces/descriptors.ts`:

__descriptor.ts__

```typescript
import { TChimera } from "chiml/dist/interfaces/descriptor";
export interface IBaseAnimalCalendarInjection {
    calCommand: string;
    composeHtml: (imageUrl: string, calendar: string) => string;
    imageFetcherCommand: string;
    imageKey: string;
    writeHtmlCommand: string;
    showCalendarCommand: string;
}

export type TAnimalCalendarInjection = TChimera & IBaseAnimalCalendarInjection;
```

After creating the interface, we can proceed by creating `baseInjection.ts`.

__baseInjection.ts__

```typescript
import { X } from "chiml";
import { IBaseAnimalCalendarInjection, TAnimalCalendarInjection } from "./interfaces/descriptor";

export class BaseInjection implements IBaseAnimalCalendarInjection {

    public calCommand: string = "ncal ${1} -h";
    public imageFetcherCommand: string = "curl https://somewhere.com/randomImage.json";
    public imageKey: string = "image";
    public writeHtmlCommand: string = `echo \${1} > "${__dirname}/calendar.html"`;
    public showCalendarCommand: string = `google-chrome file://${__dirname}/calendar.html`;

    public composeHtml(imageUrl: string, calendar: string): string {
        return `<img style="max-width: 50%; float:left;" src="${imageUrl}" />` +
            `<pre style="float:right">${calendar}</pre>`;
    }

}
```

Lastly, let's make `catInjection.ts` and `dogInjection.ts`.

__catInjection.ts__

```typescript
import { X } from "chiml";
import { BaseInjection } from "./baseInjection";
import { IBaseAnimalCalendarInjection, TAnimalCalendarInjection } from "./interfaces/descriptor";

class CatInjection extends BaseInjection implements IBaseAnimalCalendarInjection {
    public imageFetcherCommand: string = "curl https://aws.random.cat/meow";
    public imageKey: string = "file";
    public writeHtmlCommand: string = `echo \${1} > "${__dirname}/../cat.html"`;
    public showCalendarCommand: string = `google-chrome file://${__dirname}/../cat.html`;
}

const injection: TAnimalCalendarInjection = Object.assign(new CatInjection(), X);
module.exports = injection;
```

__dogInjection.ts__

```typescript
import { X } from "chiml";
import { BaseInjection } from "./baseInjection";
import { IBaseAnimalCalendarInjection, TAnimalCalendarInjection } from "./interfaces/descriptor";

class DogInjection extends BaseInjection implements IBaseAnimalCalendarInjection {
    public imageFetcherCommand: string = "curl https://random.dog/woof.json";
    public imageKey: string = "url";
    public writeHtmlCommand: string = `echo \${1} > "${__dirname}/../dog.html"`;
    public showCalendarCommand: string = `google-chrome file://${__dirname}/../dog.html`;
}

const injection: TAnimalCalendarInjection = Object.assign(new DogInjection(), X);
module.exports = injection;
```

Now we can show both, cat and dog calendar, using the following commands:

```
tsc --build ./tsconfig.json

chie ./dist/animal-calendar.yml 2018
# or
chie ./dist/animal-calendar.yml 2018
# or
chie --injection ./dist/dogInjection.js --container ./animal-calendar.yml 2019
# or
chie -i ./dist/dogInjection.js -c ./animal-calendar.yml 2019
```

