const valA = 5;
const valB = 7;
let result1, result2, result3;

const jsSyncFunction = (a, b) => a + b;
const jsAsyncFunction = (a, b, callback) => { callback(null, a + b); };
const jsPromise = Promise.resolve(valA + valB);

const promiseOne = Promise.resolve((jsSyncFunction)(valA, valB)).then((_result) => {result1 = _result;});

const promiseTwo = new Promise((_resolve, _reject) => {
  (jsAsyncFunction)(valA, valB, (_error, _result) => {
    if (_error) {
      return _reject(_error);
    }
    result2 = _result;
    return _resolve(true);
  })
});

const promiseThree = jsPromise.then((_result) => {result3 = _result;});

// series call
promiseOne.then(
  promiseTwo
).then(
  promiseThree
).then(() => {
  console.log(["series", result1, result2, result3]);
});

// parallel call
Promise.all([
  promiseOne,
  promiseTwo,
  promiseThree
]).then(() => {
  console.log(["parallel", result1, result2, result3]);
})
