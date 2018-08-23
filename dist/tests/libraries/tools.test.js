"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs_extra_1 = require("fs-extra");
const path_1 = require("path");
const cmd_1 = require("../../libraries/cmd");
const tools_1 = require("../../libraries/tools");
const rootDirPath = path_1.dirname(path_1.dirname(path_1.dirname(__dirname)));
const testDirPath = path_1.resolve(rootDirPath, "testcase", "compile");
const srcFilePath = path_1.resolve(testDirPath, "test.chiml");
test("run correct chiml script", () => {
    return tools_1.execute("(a, b) -> (x, y) => x + y", 4, 5)
        .then((result) => {
        expect(result).toBe(9);
    })
        .catch((error) => {
        console.error(error);
        expect(error).toBeNull();
    });
});
test("yield error when run incorrect chiml script", () => {
    return tools_1.execute("(a, b) -> (x, y) => {x + y", 4, 5)
        .then((result) => {
        expect(result).toBeUndefined();
    })
        .catch((error) => {
        console.error(error);
        expect(error).toBeDefined();
    });
});
test("translate chiml into js", () => {
    return tools_1.getCompiledScript("(a, b) -> (x, y) => x + y")
        .then((result) => {
        expect(result.split("\n").length).toBeGreaterThan(11);
    })
        .catch((error) => {
        console.error(error);
        expect(error).toBeNull();
    });
});
test("yield error when translate incorrect chiml script", () => {
    return tools_1.getCompiledScript("(a, b) -> (x, y) => {x + y")
        .then((result) => {
        expect(result).toBeUndefined();
    })
        .catch((error) => {
        console.error(error);
        expect(error).toBeDefined();
    });
});
test("ensure chiml file is executable", () => {
    return tools_1.execute(srcFilePath, 5, 4)
        .then((result) => {
        expect(result).toBe(9);
    })
        .catch((error) => {
        console.error(error);
        expect(error).toBeNull();
    });
});
test("compile test.chiml", () => {
    const compiledFilePath = path_1.resolve(testDirPath, "test.js");
    const nodeModulePath = path_1.resolve(testDirPath, "node_modules");
    return tools_1.compile([srcFilePath])
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
        .catch((error) => {
        console.error(error);
        expect(error).toBeUndefined();
    });
}, 100000);
test("get files recursively", () => {
    return tools_1.getFiles(path_1.resolve(rootDirPath, "src"))
        .then((result) => {
        expect(result).toContain(path_1.resolve(rootDirPath, "src", "tools", "chic.ts"));
        expect(result).toContain(path_1.resolve(rootDirPath, "src", "libraries", "cmd.ts"));
        expect(result).toContain(path_1.resolve(rootDirPath, "src", "classes", "SingleTask.ts"));
    })
        .catch((error) => {
        console.error(error);
        expect(error).toBeUndefined();
    });
}, 20000);
test("get files from non-exist path", () => {
    return tools_1.getFiles("/dev/null/oraono")
        .then((result) => {
        expect(result).toBeNull();
    })
        .catch((error) => {
        console.error(error);
        expect(error).toBeDefined();
    });
}, 20000);
test("copy non-exists path", () => {
    return tools_1.copyMultiDirs([["/dev/null/oraono", "/dev/null/oraoni"]])
        .then((result) => {
        expect(result).toBeNull();
    })
        .catch((error) => {
        console.error(error);
        expect(error).toBeDefined();
    });
}, 20000);
