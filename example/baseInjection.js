const { X } = require("../dist/index.js");
module.exports = {
    calCommand: "cal",
    composeHtml: (imageUrl, calendar) => `<img style="max-width: 500px; max-height: 500px;" src="${imageUrl}" /><pre>${calendar}</pre>`,
    imageFetcherCommand: "curl https://somewhere.com/randomImage.json",
    imageKey: "image",
    writeHtmlCommand: `echo \${1} > "${__dirname}/calendar.html"`,
    showCalendarCommand: `google-chrome file://${__dirname}/calendar.html`,
    ...X,
}
