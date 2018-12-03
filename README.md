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

* `fetchImageAndCalendar`: fetch imageUrl from the internet and calendar from our local machine
* `composeCalendar`: After getting the imageUrl and the calendar, compose them into HTML-script
* `writeCalendar`: Save the HTML-script into a HTML-file
* `showCalendar`: Open the HTML-file using a browser

This bird-view planning can be written in YAML as follow:

```yaml
ins: year
out: result
bootstrap: main
component:

    main:
        perform: X.pipeP
        parts:
            - <fetchImageAndCalendar>
            - <composeCalendar>
            - <writeCalendar>
            - <showCalendar>
```

## Implementation (without dependency-injection)

In order to make the implementation, we need to break-down our plan and make it more detail:

* `fetchImageAndCalendar`: fetch imageUrl from the internet and calendar from our local machine
    * `fetchImageUrl`: fetch random animal picture from the internet.
        * `fetchImageObj`: fetch image from the internet. This link: `https://aws.random.cat/meow` gives you a random cat in JSON format. We can fetch the image using CURL.
        * `getImageUrl`: After fetching the image object, we need to get the url. In our case, since the JSON response is similar to `{file: "http://some-place/random-cat.jpg"}`, we have to extract the `file` key.
    * `fetchCalendar`: simply perform `ncal <year> -h`, and we will get the calendar
* `composeCalendar`: After getting the imageUrl and the calendar, compose them into HTML-script. String concatenation should do it. And in UNIX-like system, we have `echo` command. So, we can just use it. No need to code anything.
* `writeCalendar`: Save the HTML-script into a HTML-file. Writing to a calendar is as easy as `echo "content" > file.html`
* `showCalendar`: Open the HTML-file using a browser. We can open google chrome usiing this command: `google-chrome file://some-folder/some-file.html`

Below is the detail implementation, as well as our executable CHIML program:

```yaml
# file: animal-calendar-no-injection.yml
ins: year
out: result
bootstrap: main
component:

    main:
        perform: X.pipeP
        parts:
            - <fetchImageAndCalendar>
            - <composeCalendar>
            - <writeCalendar>
            - <showCalendar>

    fetchImageAndCalendar:
        perform: X.concurrent
        parts:
            - <fetchImageUrl>
            - <fetchCalendar>

    composeCalendar:
        ins:
            - imageUrl
            - calendar
        out: result
        perform: X.wrapCommand
        parts: echo '<img src="' && echo ${1} && echo '"/>' && echo "<pre>" && echo ${2} && echo "</pre>"

    writeCalendar:
        ins: result
        perform: X.wrapCommand
        parts: echo ${1} > ${PWD}/calendar.html

    showCalendar:
        ins: []
        perform: X.wrapCommand
        parts: google-chrome file://${PWD}/calendar.html

    fetchCalendar:
        ins: year
        out: calendar
        perform: X.wrapCommand
        parts: ncal ${1} -h

    fetchImageUrl:
        out: imageUrl
        perform: X.pipeP
        parts:
            - <fetchImageObj>
            - <getImageUrl>

    fetchImageObj:
        ins: []
        perform: X.wrapCommand
        parts: curl https://aws.random.cat/meow

    getImageUrl:
        perform: X.prop
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
  "name": "example",
  "version": "1.0.0",
  "description": "",
  "main": "index.js",
  "scripts": {
    "test": "echo \"Error: no test specified\" && exit 1"
  },
  "author": "",
  "license": "ISC",
  "dependencies": {
    "chiml": "^0.2.2"
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
        perform: X.pipeP
        parts:
            - <fetchImageAndCalendar>
            - <composeCalendar>
            - <writeCalendar>
            - <showCalendar>

    fetchImageAndCalendar:
        perform: X.concurrent
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
        perform: X.wrapCommand
        parts: <writeHtmlCommand>

    showCalendar:
        ins: []
        perform: X.wrapCommand
        parts: <showCalendarCommand>

    fetchCalendar:
        ins: year
        out: calendar
        perform: X.wrapCommand
        parts: <calCommand>

    fetchImageUrl:
        out: imageUrl
        perform: X.pipeP
        parts:
            - <fetchImageObj>
            - <getImageUrl>

    fetchImageObj:
        ins: []
        perform: X.wrapCommand
        parts: <imageFetcherCommand>

    getImageUrl:
        perform: X.prop
        parts: <imageKey>
```

By default, this container will use `./dist/cat.js`. The file is currently inexist. You might notice that we have some `undefined components` like `composeHtml`, `writeHtmlCommand`, `showCalendarCommand`, `calCommand`, `imageFetcherCommand`, and `imageKey`. It's okay, we will define the interface and the implementation later.

Interface is like a contract. In this case, we want our interface to provide several functions and values that can be used in the container. Below is the content of `/src/interfaces/descriptors.ts`:

__descriptor.ts__

```typescript
import { TChimera } from "chiml/src/interfaces/descriptor";
export interface IBaseAnimalCalendarInjection {
    calCommand: string;
    composeHtml: (imageUrl: string, calendar: string) => string;
    imageFetcherCommand: string;
    imageKey: string;
    writeHtmlCommand: string;
    showCalendarCommand: string;
    X: TChimera;
}
```

After creating the interface, we can proceed by creating `baseInjection.ts`.

__baseInjection.ts__

```typescript
import { X } from "chiml";
import { TChimera } from "chiml/src/interfaces/descriptor";
import { IBaseAnimalCalendarInjection } from "./interfaces/descriptor";

export class BaseInjection implements IBaseAnimalCalendarInjection {

    public calCommand: string = "ncal ${1} -h";
    public imageFetcherCommand: string = "curl https://somewhere.com/randomImage.json";
    public imageKey: string = "image";
    public writeHtmlCommand: string = `echo \${1} > "${__dirname}/calendar.html"`;
    public showCalendarCommand: string = `google-chrome file://${__dirname}/calendar.html`;
    public X: TChimera = X;

    public composeHtml(imageUrl: string, calendar: string): string {
        return `<img style="max-width: 50%; float:left;" src="${imageUrl}" />` +
            `<pre style="float:right">${calendar}</pre>`;
    }

}
```

Lastly, let's make `catInjection.ts` and `dogInjection.ts`.

__catInjection.ts__

```typescript
import { BaseInjection } from "./baseInjection";
import { IBaseAnimalCalendarInjection } from "./interfaces/descriptor";

class CatInjection extends BaseInjection implements IBaseAnimalCalendarInjection {
    public imageFetcherCommand: string = "curl https://aws.random.cat/meow";
    public imageKey: string = "file";
    public writeHtmlCommand: string = `echo \${1} > "${__dirname}/../cat.html"`;
    public showCalendarCommand: string = `google-chrome file://${__dirname}/../cat.html`;
}

const injection = new CatInjection();
module.exports = injection;
```

__dogInjection.ts__

```typescript
import { X } from "chiml";
import { BaseInjection } from "./baseInjection";
import { IBaseAnimalCalendarInjection } from "./interfaces/descriptor";

class DogInjection extends BaseInjection implements IBaseAnimalCalendarInjection {
    public imageFetcherCommand: string = "curl https://random.dog/woof.json";
    public imageKey: string = "url";
    public writeHtmlCommand: string = `echo \${1} > "${__dirname}/../dog.html"`;
    public showCalendarCommand: string = `google-chrome file://${__dirname}/../dog.html`;
}

const injection = new DogInjection();
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

