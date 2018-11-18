"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const baseInjection_1 = require("./baseInjection");
const injection = Object.assign(baseInjection_1.baseInjection, {
    imageFetcherCommand: "curl https://random.dog/woof.json",
    imageKey: "url",
    writeHtmlCommand: `echo \${1} > "${__dirname}/../dog.html"`,
    showCalendarCommand: `google-chrome file://${__dirname}/../dog.html`,
});
module.exports = injection;
