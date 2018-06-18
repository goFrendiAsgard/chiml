function __unit_0(input) {
  let squares = null;
  let even = null;
  let sum = null;
  let output = null;
  let __ans = null;
  let __first_0 = true;
  function __fn_0() {
    if ((__first_0 && (true)) || (!__first_0 && false)) {
      function __unit_0_0() {
        let __first_0_0 = true;
        function __fn_0_0() {
          if ((__first_0_0 && (true)) || (!__first_0_0 && false)) {
            function __main_0_0_0(__src = input) {
              function __unit_0_0_0(n) {
                let __ans = null;
                let __first_0_0_0 = true;
                function __fn_0_0_0() {
                  if ((__first_0_0_0 && (true)) || (!__first_0_0_0 && false)) {
                    const __promise_0_0_0 = Promise.resolve(((x) => x*x)(n)).then(
                      (__result) => __ans = __result
                    );
                    __first_0_0_0 = false;
                    return __promise_0_0_0.then(() => __fn_0_0_0());
                  }
                  return Promise.resolve(__ans);
                }
                return __fn_0_0_0();
              }
              const __promises = __src.map((__element) => __unit_0_0_0(__element));
              return Promise.all(__promises).then((__result) => {
                squares = __result;
              }).then(() => Promise.resolve(squares));
            }
            function __main_0_0_1(__src = input) {
              function __unit_0_0_1(n) {
                let __ans = null;
                let __first_0_0_1 = true;
                function __fn_0_0_1() {
                  if ((__first_0_0_1 && (true)) || (!__first_0_0_1 && false)) {
                    const __promise_0_0_1 = Promise.resolve(((x) => x % 2 === 0)(n)).then(
                      (__result) => __ans = __result
                    );
                    __first_0_0_1 = false;
                    return __promise_0_0_1.then(() => __fn_0_0_1());
                  }
                  return Promise.resolve(__ans);
                }
                return __fn_0_0_1();
              }
              const __promises = __src.map((__element) => __unit_0_0_1(__element));
              return Promise.all(__promises).then((__result) => {
                __filtered = [];
                for (let __i = 0; __i < __src.length; __i++){
                  if (__result[__i]) {
                    __filtered.push(__src[__i]);
                  }
                }
                even = __filtered;
              }).then(() => Promise.resolve(even));
            }
            function __main_0_0_2(__src = input) {
              let __accumulator = 0;
              function __unit_0_0_2(n, total) {
                let __ans = null;
                let __first_0_0_2 = true;
                function __fn_0_0_2() {
                  if ((__first_0_0_2 && (true)) || (!__first_0_0_2 && false)) {
                    const __promise_0_0_2 = Promise.resolve(((x, acc) => x + acc)(n, total)).then(
                      (__result) => __ans = __result
                    );
                    __first_0_0_2 = false;
                    return __promise_0_0_2.then(() => __fn_0_0_2());
                  }
                  return Promise.resolve(__ans);
                }
                return __fn_0_0_2();
              }
              let __promise = Promise.resolve(true);
              for (let __i = 0; __i < __src.length; __i++){
                __promise = __promise.then(
                  () => __unit_0_0_2(__src[__i], __accumulator)
                ).then((__result) => {
                  __accumulator = __result;
                });
              }
              return __promise.then(() => {
                sum = __accumulator;
              }).then(() => Promise.resolve(sum));
            }
            const __promise_0_0 = Promise.all([__main_0_0_0(), __main_0_0_1(), __main_0_0_2()]);
            __first_0_0 = false;
            return __promise_0_0.then(() => __fn_0_0());
          }
          return Promise.resolve(__ans);
        }
        return __fn_0_0();
      }
      __main_0_0 = __unit_0_0;
      function __unit_0_1() {
        let __first_0_1 = true;
        function __fn_0_1() {
          if ((__first_0_1 && (true)) || (!__first_0_1 && false)) {
            const __promise_0_1 = Promise.resolve(((x) => x)({even, squares, sum})).then(
              (__result) => output = __result
            );
            __first_0_1 = false;
            return __promise_0_1.then(() => __fn_0_1());
          }
          return Promise.resolve(output);
        }
        return __fn_0_1();
      }
      __main_0_1 = __unit_0_1;
      const __promise_0 = Promise.resolve(true).then(() => __main_0_0()).then(() => __main_0_1());
      __first_0 = false;
      return __promise_0.then(() => __fn_0());
    }
    return Promise.resolve(output);
  }
  return __fn_0();
}
__main_0 = __unit_0;

__main_0([1,2,3,4]).then((result) => {
  console.log(result);
})
