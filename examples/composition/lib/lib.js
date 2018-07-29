function syncAdd (a, b) {
    return a + b;
}

function asyncAdd (a, b, callback) {
    callback(null, a + b);
}

function promiseAddMaker (a, b) {
    return Promise.resolve(a + b);
}

module.exports = {syncAdd, asyncAdd, promiseAddMaker};
