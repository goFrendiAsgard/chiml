"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const index_js_1 = require("../../dist/index.js");
function composeHtml(imageUrl, calendar) {
    return `<img style="max-width: 50%; float:left;" src="${imageUrl}" />` +
        `<pre style="float:right">${calendar}</pre>`;
}
exports.baseInjection = Object.assign({ calCommand: "ncal ${1} -h", composeHtml, imageFetcherCommand: "curl https://somewhere.com/randomImage.json", imageKey: "image", writeHtmlCommand: `echo \${1} > "${__dirname}/calendar.html"`, showCalendarCommand: `google-chrome file://${__dirname}/calendar.html` }, index_js_1.X);
