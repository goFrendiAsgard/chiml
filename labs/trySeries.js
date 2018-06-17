function __main_0(a){
  let __first_0 = true;
  let b = null;
  let __ans = null;
  function __main_0_0() {
    let __first_0_0 = true;
    const __promise_0_0 = Promise.resolve(((x) => x + 1)(a)).then(
      (__result) => b = __result
    );
    function __fn_0_0() {
      if ((__first_0_0 && (true)) || (!__first_0_0 && false)) {
        __first_0_0 = false;
        return __promise_0_0.then(() => __fn_0_0());
      }
      return Promise.resolve(b);
    }
    return __fn_0_0();
  }
  function __main_0_1() {
    let __first_0_1 = true;
    const __promise_0_1 = Promise.resolve(((x) => x * 2)(b)).then(
      (__result) => __ans = __result
    );
    function __fn_0_1() {
      if ((__first_0_1 && (true)) || (!__first_0_1 && false)) {
        __first_0_1 = false;
        return __promise_0_1.then(() => __fn_0_1());
      }
      return Promise.resolve(__ans);
    }
    return __fn_0_1();
  }
  const __promise_0 = Promise.resolve(true).then(() => __main_0_0()).then(() => __main_0_1());
  function __fn_0() {
    if ((__first_0 && (true)) || (!__first_0 && false)) {
      __first_0 = false;
      return __promise_0.then(() => __fn_0());
    }
    return Promise.resolve(__ans);
  }
  return __fn_0();
}

__main_0(4).then((result) => console.log(result));

