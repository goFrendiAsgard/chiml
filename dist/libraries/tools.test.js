"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs_extra_1 = require("fs-extra");
const path_1 = require("path");
const cmd_1 = require("./cmd");
const tools_1 = require("./tools");
it("run correct chiml script", (done) => {
    tools_1.execute("(a, b) -> (x, y) => x + y", 4, 5).then((result) => {
        expect(result).toBe(9);
        done();
    }).catch((error) => {
        expect(error).toBeNull();
        done();
    });
});
it("yield error when run incorrect chiml script", (done) => {
    tools_1.execute("(a, b) -> (x, y) => {x + y", 4, 5).then((result) => {
        expect(result).toBeUndefined();
        done();
    }).catch((error) => {
        expect(error).toBeDefined();
        done();
    });
});
it("translate chiml into js", (done) => {
    tools_1.getCompiledScript("(a, b) -> (x, y) => x + y").then((result) => {
        expect(result.split("\n").length).toBeGreaterThan(11);
        done();
    }).catch((error) => {
        expect(error).toBeNull();
        done();
    });
});
it("yield error when translate incorrect chiml script", (done) => {
    tools_1.getCompiledScript("(a, b) -> (x, y) => {x + y").then((result) => {
        expect(result).toBeUndefined();
        done();
    }).catch((error) => {
        expect(error).toBeDefined();
        done();
    });
});
it("compile testCompile/test.chiml", (done) => {
    const srcFilePath = path_1.resolve(__dirname, "testCompile/test.chiml");
    const compiledFilePath = path_1.resolve(__dirname, "testCompile/test.js");
    const libDirPath = path_1.resolve(__dirname, ".chiml");
    tools_1.compileChimlFile(srcFilePath).then((result) => {
        return tools_1.execute(srcFilePath, 10, 6);
    }).then((result) => {
        expect(result).toBe(64);
    }).then(() => {
        return cmd_1.cmdComposedCommand(`node ${compiledFilePath}`, [10, 8]);
    }).then((result) => {
        expect(result).toBe(36);
    }).then(() => {
        return fs_extra_1.remove(compiledFilePath);
    }).then(() => {
        return fs_extra_1.remove(libDirPath);
    }).then(done).catch((error) => {
        console.error(error);
        expect(error).toBeUndefined();
        done();
    });
});
//# sourceMappingURL=tools.test.js.map