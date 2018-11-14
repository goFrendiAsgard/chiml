const { X } = require("../dist/index.js");
module.exports = {
    calCommand: "cal",
    imageFetcherCommand: "curl https://aws.random.cat/meow",
    imageKey: "file",
    composeHtml: (imageUrl, calendar) => `<img src="${imageUrl}" /><pre>${calendar}</pre>`,
    ...X,
}

/*
// You can try this also
module.exports = {
    calCommand: "cal",
    imageFetcherCommand: "curl https://random.dog/woof.json",
    imageKey: "url",
    composeHtml: (imageUrl, calendar) => `<img src="${imageUrl}" /><pre>${calendar}</pre>`,
    ...X,
}
*/
