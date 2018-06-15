/*
 * ins: a, b                                                  # p0
 * out: out
 * do:
 *   - parallel:                                              # p1
 *       - (a,b) -> (x,y) => x-y -> c                         # p2
 *       - (a,b) -> (x,y) => x+y -> d                         # p3
 *
 *   - (c,d) -> (x,y) => x*y -> e                             # p4
 *
 *   - parallel:                                              # p5
 *
 *     - if: b < 100                                          # p6
 *       do: (b) -> (x) => x*x -> b
 *       while: b < 10000
 *
 *     - (e) -> factor -> f                                   # p7 (external command, callback)
 *
 *   - () -> <p73> -> g                                       # p8 (promise)
 *
 *   - map: [1, 2, 3, 4, 5]                                   # p9 (map)
 *     into: h
 *     do: (x) -> (x) => x*x
 *
 *   - filter: [1, 2, 3, 4, 5]                                # p10 (filter)
 *     into: i
 *     do: (x) -> (x) => x%2
 *
 *   - ([a, b, c, d, e, f, g, h, i]) -> (x) => x -> out       # p11
 */

// Promise example:

const p73 = new Promise((resolve, reject) => {
  resolve(73);
});

// Code started here:

const childProcess = require('child_process');

function __main (a, b) {
  let c, d, e, f, g, out;
  let __f0First = __f1First = __f2First = __f3First = __f4First = __f5First = __f6First = __f7First = __f8First = __f9First = __f10First = __f11First = true;

  function __f2 () {
    return new Promise((__resolve, __reject) => {
      if ((__f2First && true) || !__f2First) {
        __f2First = false;
        try {
          c = ((x,y) => x-y)(a, b);
          if (false) {
            __f2().then(
              __resolve(true)
            ).catch((__error) => {
              __reject(__error)
            });
          } else {
            __resolve(true);
          }
        } catch (__error) {
          __reject(__error);
        }
      } else {
        __resolve(true);
      }
    });
  }

  function __f3 () {
    return new Promise((__resolve, __reject) => {
      if ((__f3First && true) || !__f3First) {
        __f3First = false;
        try {
          d = ((x,y) => x+y)(a, b);
          if (false) {
            __f3().then(
              __resolve(true)
            ).catch((__error) => {
              __reject(__error)
            });
          } else {
            __resolve(true);
          }
        } catch (__error) {
          __reject(__error);
        }
      } else {
        __resolve(true);
      }
    });
  }

  function __f1 () {
    return Promise.all([__f2(), __f3()]);
  }

  function __f4 () {
    return new Promise((__resolve, __reject) => {
      if ((__f4First && true) || !__f4First) {
        __f4First = false;
        try {
          e = ((x,y) => x*y)(c, d);
          if (false) {
            __f4().then(
              __resolve(true)
            ).catch((__error) => {
              __reject(__error)
            });
          } else {
            __resolve(true);
          }
        } catch (__error) {
          __reject(__error);
        }
      } else {
        __resolve(true);
      }
    });
  }

  function __f6 () {
    return new Promise((__resolve, __reject) => {
      if ((__f6First && (b < 1000)) || !__f6First) {
        __f6First = false;
        try {
          b = ((x) => x*x)(b);
          if (b < 10000) {
            __f6().then(
              __resolve(true)
            ).catch((__error) => {
              __reject(__error)
            });
          } else {
            __resolve(true);
          }
        } catch (__error) {
          __reject(__error);
        }
      } else {
        __resolve(true);
      }
    });
  }

  function __f7 () {
    return new Promise((__resolve, __reject) => {
      if ((__f7First && true) || !__f7First) {
        __f7First = false;
        try {
          const _cmd = 'factor ' + e;
          childProcess.exec(_cmd,  (__error, __result) => {
            f = __result.trim()
            if (__error) {
              __reject(__error);
            } else {
              if (false) {
                __f7().then(
                  __resolve(true)
                ).catch((__error) => {
                  __reject(__error)
                });
              } else {
                __resolve(true);
              }
            }
          });
        } catch (__error) {
          __reject(__error);
        }
      } else {
        __resolve(true);
      }
    });
  }

  function __f5 () {
    return Promise.all([__f6(), __f7()]);
  }

  function __f8 () {
    return new Promise((__resolve, __reject) => {
      if ((__f8First && true) || !__f8First) {
        __f8First = false;
        p73.then((__result) => {
          g = __result
          __resolve(true);
        }).catch((__error) => {
          __reject(__error);
        });
      } else {
        __resolve(true);
      }
    });
  }

  function __f9Sub (__val) {
    return new Promise((__resolve, __reject) => {
      try {
        __result = ((x) => x*x)(__val);
        __resolve(__result);
      } catch (__error) {
        __reject(__error);
      }
    });
  }

  function __f9 () {
    return new Promise((__resolve, __reject) => {
      if ((__f9First && true) || !__f9First) {
        __f9First = false;
        const __vals = [1,2,3,4,5];
        let __promises = []
        for (let __val of __vals) {
          __promises.push(__f9Sub(__val));
        }
        Promise.all(__promises).then((__result) => {
          h = __result;
          __resolve(true);
        }).catch((__error) => {
          __reject(__error);
        });
      } else {
        __resolve(true);
      }
    })
  }

  function __f10Sub (__val) {
    return new Promise((__resolve, __reject) => {
      try {
        __result = ((x) => x%2)(__val);
        __resolve(__result);
      } catch (__error) {
        __reject(__error);
      }
    });
  }

  function __f10 () {
    return new Promise((__resolve, __reject) => {
      if ((__f10First && true) || !__f10First) {
        __f10First = false;
        const __vals = [1,2,3,4,5];
        let __promises = []
        for (let __val of __vals) {
          __promises.push(__f10Sub(__val));
        }
        Promise.all(__promises).then((__result) => {
          __filtered = [];
          for (let _index = 0; _index < __vals.length; _index ++) {
            if (__result[_index]) {
              __filtered.push(__vals[_index]);
            }
          }
          i = __filtered;
          __resolve(true);
        }).catch((__error) => {
          __reject(__error);
        });
      } else {
        __resolve(true);
      }
    })
  }

  function __f11 () {
    return new Promise((__resolve, __reject) => {
      if ((__f11First && true) || !__f11First) {
        __f11First = false;
        try {
          out = ((x) => x)([a, b, c, d, e, f, g, h, i]);
          if (false) {
            __f11().then(
              __resolve(true)
            ).catch((__error) => {
              __reject(__error)
            });
          } else {
            __resolve(true);
          }
        } catch (__error) {
          __reject(__error);
        }
      } else {
        __resolve(true);
      }
    });
  }

  function __f0 () {
    return __f1().then(
      () => __f4()
    ).then(
      () => __f5()
    ).then(
      () => __f8()
    ).then(
      () => __f9()
    ).then(
      () => __f10()
    ).then(
      () => __f11()
    );
  }

  return new Promise((__resolve, __reject) => {
    __f0().then(() => {
      __resolve(out);
    }).catch ((__error) => {
      __reject(__error);
    })
  });
}

exports = __main;

if (require.main === module) {
  const args = process.argv.slice(2).map((value) => {
    try {
      return JSON.parse(value);
    } catch (error) {
      return value;
    }
  });
  __main(...args).then(
    (result) => console.log(result)
  ).catch(
    (error) => console.error(error)
  )
}
