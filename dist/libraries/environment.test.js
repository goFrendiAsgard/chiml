"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const environment_1 = require("./environment");
it("able to cascade environment", (done) => {
    const env = {
        config_db_port: "3306",
        config_name: "test",
        lazy: 1,
        unknown: 1,
    };
    const obj = {
        config: {
            db: {
                name: "mysql",
                port: 3307,
            },
            name: "not test",
        },
        lazy: null,
    };
    const expected = {
        config: {
            db: {
                name: "mysql",
                port: 3306,
            },
            name: "test",
        },
        lazy: 1,
    };
    const result = environment_1.cascade(obj, env);
    expect(result).toMatchObject(expected);
    done();
});
//# sourceMappingURL=environment.test.js.map