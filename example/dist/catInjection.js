"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const baseInjection_1 = require("./baseInjection");
const injection = Object.assign(baseInjection_1.baseInjection, {
    imageFetcherCommand: "curl https://aws.random.cat/meow",
    imageKey: "file",
    writeHtmlCommand: `echo \${1} > "${__dirname}/../cat.html"`,
    showCalendarCommand: `google-chrome file://${__dirname}/../cat.html`,
});
module.exports = injection;
