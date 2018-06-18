function __main_0(__src = [1, 2, 3, 4, 5]) {
  let square;
  function __unit_0() {
    let __ans = null;
    let __first_0 = true;
    function __fn_0() {
      if ((__first_0 && (true)) || (!__first_0 && false)) {
        const __promise_0 = Promise.resolve(((x) => x * x)()).then(
          (__result) => __ans = __result
        );
        __first_0 = false;
        return __promise_0.then(() => __fn_0());
      }
      return Promise.resolve(__ans);
    }
    return __fn_0();
  }
  const __promises = __src.map((__element) => __unit_0(__element));
  return Promise.all(__promises).then((__result) => {
    square = __result;
  }).then(() => Promise.resolve(square));
}

__main_0().then((result) => {
  console.log(result);
})
