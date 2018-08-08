"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs_extra_1 = require("fs-extra");
const path_1 = require("path");
const cmd_1 = require("./cmd");
const tools_1 = require("./tools");
it("run correct chiml script", (done) => {
    tools_1.execute("(a, b) -> (x, y) => x + y", 4, 5)
        .then((result) => {
        expect(result).toBe(9);
        done();
    })
        .catch((error) => {
        expect(error).toBeNull();
        done();
    });
});
it("yield error when run incorrect chiml script", (done) => {
    tools_1.execute("(a, b) -> (x, y) => {x + y", 4, 5)
        .then((result) => {
        expect(result).toBeUndefined();
        done();
    })
        .catch((error) => {
        expect(error).toBeDefined();
        done();
    });
});
it("translate chiml into js", (done) => {
    tools_1.getCompiledScript("(a, b) -> (x, y) => x + y")
        .then((result) => {
        expect(result.split("\n").length).toBeGreaterThan(11);
        done();
    })
        .catch((error) => {
        expect(error).toBeNull();
        done();
    });
});
it("yield error when translate incorrect chiml script", (done) => {
    tools_1.getCompiledScript("(a, b) -> (x, y) => {x + y")
        .then((result) => {
        expect(result).toBeUndefined();
        done();
    })
        .catch((error) => {
        expect(error).toBeDefined();
        done();
    });
});
const rootDirPath = path_1.dirname(path_1.dirname(__dirname));
const testDirPath = path_1.resolve(rootDirPath, "testcase", "compile");
const srcFilePath = path_1.resolve(testDirPath, "test.chiml");
it("ensure chiml file is executable", (done) => {
    tools_1.execute(srcFilePath, 5, 4)
        .then((result) => {
        expect(result).toBe(9);
        done();
    })
        .then(done)
        .catch((error) => {
        expect(error).toBeNull();
        done();
    });
});
it("compile test.chiml", (done) => {
    const compiledFilePath = path_1.resolve(testDirPath, "test.js");
    const nodeModulePath = path_1.resolve(testDirPath, "node_modules");
    tools_1.compile([srcFilePath])
        .then(() => {
        return cmd_1.cmdComposedCommand(`node ${compiledFilePath}`, [10, 8]);
    })
        .then((result) => {
        expect(result).toBe(36);
    })
        .then(() => {
        return Promise.all([
            fs_extra_1.remove(nodeModulePath),
            fs_extra_1.remove(compiledFilePath),
        ]);
    })
        .then(() => {
        done();
    })
        .catch((error) => {
        console.error(error);
        expect(error).toBeUndefined();
        done();
    });
}, 100000);
it("read file recursively", (done) => {
    tools_1.getFiles(path_1.resolve(rootDirPath, "src"))
        .then((result) => {
        expect(result).toContain(path_1.resolve(rootDirPath, "src", "tools", "chic.ts"));
        expect(result).toContain(path_1.resolve(rootDirPath, "src", "libraries", "cmd.ts"));
        expect(result).toContain(path_1.resolve(rootDirPath, "src", "classes", "SingleTask.ts"));
        done();
    })
        .catch((error) => {
        expect(error).toBeUndefined();
        done();
    });
}, 20000);
it("throws error when read file recursively from nonexistent directory", (done) => {
    tools_1.getFiles("/dev/null/oraono")
        .then((result) => {
        expect(result).toBeUndefined();
        done();
    })
        .catch((error) => {
        expect(error).toBeDefined();
        done();
    });
}, 20000);
//# sourceMappingURL=tools.test.js.map