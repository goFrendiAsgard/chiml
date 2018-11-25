"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const index_js_1 = require("../../dist/index.js");
const baseInjection_1 = require("./baseInjection");
class DogInjection extends baseInjection_1.BaseInjection {
    constructor() {
        super(...arguments);
        this.imageFetcherCommand = "curl https://random.dog/woof.json";
        this.imageKey = "url";
        this.writeHtmlCommand = `echo \${1} > "${__dirname}/../dog.html"`;
        this.showCalendarCommand = `google-chrome file://${__dirname}/../dog.html`;
    }
}
const injection = Object.assign(new DogInjection(), index_js_1.X);
module.exports = injection;
