"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var utilities_js_1 = require("./.chiml/libraries/utilities.js");
function __unit_0(a, b) {
    var e = null;
    var __ans = null;
    var c = null;
    var d = null;
    var __first_0 = true;
    function __fn_0() {
        if ((__first_0 && (true)) || (!__first_0 && false)) {
            function __unit_0_0() {
                var __first_0_0 = true;
                function __fn_0_0() {
                    if ((__first_0_0 && (true)) || (!__first_0_0 && false)) {
                        function __unit_0_0_0() {
                            var __first_0_0_0 = true;
                            function __fn_0_0_0() {
                                if ((__first_0_0_0 && (true)) || (!__first_0_0_0 && false)) {
                                    var __promise_0_0_0 = Promise.resolve((function (x, y) { return x + y; })(a, b)).then(function (__result) { return c = __result; });
                                    __first_0_0_0 = false;
                                    return __promise_0_0_0.then(function () { return __fn_0_0_0(); });
                                }
                                return Promise.resolve(c);
                            }
                            return __fn_0_0_0();
                        }
                        function __main_0_0_0() {
                            var __ins = [];
                            for (var _i = 0; _i < arguments.length; _i++) {
                                __ins[_i] = arguments[_i];
                            }
                            return __unit_0_0_0.apply(void 0, __ins);
                        }
                        function __unit_0_0_1() {
                            var __first_0_0_1 = true;
                            function __fn_0_0_1() {
                                if ((__first_0_0_1 && (true)) || (!__first_0_0_1 && false)) {
                                    var __promise_0_0_1 = Promise.resolve((function (x, y) { return x - y; })(a, b)).then(function (__result) { return d = __result; });
                                    __first_0_0_1 = false;
                                    return __promise_0_0_1.then(function () { return __fn_0_0_1(); });
                                }
                                return Promise.resolve(d);
                            }
                            return __fn_0_0_1();
                        }
                        function __main_0_0_1() {
                            var __ins = [];
                            for (var _i = 0; _i < arguments.length; _i++) {
                                __ins[_i] = arguments[_i];
                            }
                            return __unit_0_0_1.apply(void 0, __ins);
                        }
                        var __promise_0_0 = Promise.all([__main_0_0_0(), __main_0_0_1()]);
                        __first_0_0 = false;
                        return __promise_0_0.then(function () { return __fn_0_0(); });
                    }
                    return Promise.resolve(__ans);
                }
                return __fn_0_0();
            }
            function __main_0_0() {
                var __ins = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    __ins[_i] = arguments[_i];
                }
                return __unit_0_0.apply(void 0, __ins);
            }
            function __unit_0_1() {
                var __first_0_1 = true;
                function __fn_0_1() {
                    if ((__first_0_1 && (true)) || (!__first_0_1 && false)) {
                        var __promise_0_1 = Promise.resolve((function (x, y) { return x * y; })(c, d)).then(function (__result) { return e = __result; });
                        __first_0_1 = false;
                        return __promise_0_1.then(function () { return __fn_0_1(); });
                    }
                    return Promise.resolve(e);
                }
                return __fn_0_1();
            }
            function __main_0_1() {
                var __ins = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    __ins[_i] = arguments[_i];
                }
                return __unit_0_1.apply(void 0, __ins);
            }
            var __promise_0 = Promise.resolve(true).then(function () { return __main_0_0(); }).then(function () { return __main_0_1(); });
            __first_0 = false;
            return __promise_0.then(function () { return __fn_0(); });
        }
        return Promise.resolve(e);
    }
    return __fn_0();
}
function __main_0() {
    var __ins = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        __ins[_i] = arguments[_i];
    }
    return __unit_0.apply(void 0, __ins);
}
module.exports = __main_0;
if (require.main === module) {
    var args = utilities_js_1.__parseIns(process.argv.slice(2));
    __main_0.apply(void 0, args).then(function (result) { return console.log(result); }).catch(function (error) { return console.error(error); });
}
