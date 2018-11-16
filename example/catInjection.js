const baseComponent = require("./baseInjection.js");
module.exports = Object.assign(baseComponent, {
    imageFetcherCommand: "curl https://aws.random.cat/meow",
    imageKey: "file",
    writeHtmlCommand: `echo \${1} > "${__dirname}/cat.html"`,
    showCalendarCommand: `google-chrome file://${__dirname}/cat.html`,
});
