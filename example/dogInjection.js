const baseComponent = require("./baseInjection.js");
module.exports = Object.assign(baseComponent, {
    imageFetcherCommand: "curl https://random.dog/woof.json",
    imageKey: "url",
    writeHtmlCommand: `echo \${1} > "${__dirname}/dog.html"`,
    showCalendarCommand: `google-chrome file://${__dirname}/dog.html`,
});
