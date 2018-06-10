var _childProcess = require('child_process');
var a = 10;
var b = 6;
var c, d, e;

(new Promise((_resolve, reject) => {   // The beginning
  _resolve(null);
})).then(Promise.all([ // series
  // c = a + b
  new Promise ((_resolve, _reject) => { // parallel
    if (true) {
      do {
        c = a + b;
      } while (false);
    }
    _resolve(c);
  }),
  // d = a - b
  new Promise ((_resolve, _reject) => { // parallel
    if (true) {
      do {
        d = a - b;
      } while (false);
    }
    _resolve(d);
  })
]).then(
  // e = c * d
  new Promise ((_resolve, _reject) => { // series
    if (true) {
      do {
        e = c * d;
      } while (false);
    }
    _resolve(e);
  })
)).then(
  // e = factors e
  new Promise ((_resolve, _reject) => { // series
    if (true) {
      do {
        _childProcess.exec('factor ' + e, (error, stdout, stderr) => {
          if (error) {
            _reject(error);
          } else {
            e = stdout
            _resolve(stdout);
          }
        });
      } while (false);
    }
  })
).then((result) => {
  // show output
  console.log(e);
}).catch((error) => {
  // catch error
  console.error(error);
});
