const { X } = require("../dist/index.js");

module.exports = {
    calCommand: "ncal ${1} -h",
    composeHtml: composeHtml,
    imageFetcherCommand: "curl https://somewhere.com/randomImage.json",
    imageKey: "image",
    writeHtmlCommand: `echo \${1} > "${__dirname}/calendar.html"`,
    showCalendarCommand: `google-chrome file://${__dirname}/calendar.html`,
    ...X,
}

function composeHtml(imageUrl, calendar) {
    return `<img style="max-width: 50%; float:left;" src="${imageUrl}" />` +
        `<pre style="float:right">${calendar}</pre>`;
}
