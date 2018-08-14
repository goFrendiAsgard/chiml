import { remove as fsRemove } from "fs-extra";
import { dirname as pathDirName, resolve as pathResolve } from "path";
import { cmdComposedCommand } from "../../libraries/cmd";
import { compile, copyMultiDirs, execute, getCompiledScript, getFiles } from "../../libraries/tools";

const rootDirPath = pathDirName(pathDirName(pathDirName(__dirname)));
const testDirPath = pathResolve(rootDirPath, "testcase", "compile");
const srcFilePath = pathResolve(testDirPath, "test.chiml");

test("run correct chiml script", () => {
    return execute("(a, b) -> (x, y) => x + y", 4, 5)
        .then((result) => {
            expect(result).toBe(9);
        })
        .catch((error) => {
            console.error(error);
            expect(error).toBeNull();
        });
});

test("yield error when run incorrect chiml script", () => {
    return execute("(a, b) -> (x, y) => {x + y", 4, 5)
        .then((result) => {
            expect(result).toBeUndefined();
        })
        .catch((error) => {
            console.error(error);
            expect(error).toBeDefined();
        });
});

test("translate chiml into js", () => {
    return getCompiledScript("(a, b) -> (x, y) => x + y")
        .then((result) => {
            expect(result.split("\n").length).toBeGreaterThan(11);
        })
        .catch((error) => {
            console.error(error);
            expect(error).toBeNull();
        });
});

test("yield error when translate incorrect chiml script", () => {
    return getCompiledScript("(a, b) -> (x, y) => {x + y")
        .then((result) => {
            expect(result).toBeUndefined();
        })
        .catch((error) => {
            console.error(error);
            expect(error).toBeDefined();
        });
});

test("ensure chiml file is executable", () => {
    return execute(srcFilePath, 5, 4)
        .then((result) => {
            expect(result).toBe(9);
        })
        .catch((error) => {
            console.error(error);
            expect(error).toBeNull();
        });
});

test("compile test.chiml", () => {
    const compiledFilePath = pathResolve(testDirPath, "test.js");
    const nodeModulePath = pathResolve(testDirPath, "node_modules");
    return compile([srcFilePath])
        .then(() => {
            return cmdComposedCommand(`node ${compiledFilePath}`, [10, 8]);
        })
        .then((result) => {
            expect(result).toBe(36);
        })
        .then(() => {
            return Promise.all([
                fsRemove(nodeModulePath),
                fsRemove(compiledFilePath),
            ]);
        })
        .catch((error) => {
            console.error(error);
            expect(error).toBeUndefined();
        });
}, 100000);

test("get files recursively", () => {
    return getFiles(pathResolve(rootDirPath, "src"))
        .then((result) => {
            expect(result).toContain(pathResolve(rootDirPath, "src", "tools", "chic.ts"));
            expect(result).toContain(pathResolve(rootDirPath, "src", "libraries", "cmd.ts"));
            expect(result).toContain(pathResolve(rootDirPath, "src", "classes", "SingleTask.ts"));
        })
        .catch((error) => {
            console.error(error);
            expect(error).toBeUndefined();
        });
}, 20000);

test("get files from non-exist path", () => {
    return getFiles("/dev/null/oraono")
        .then((result) => {
            expect(result).toBeNull();
        })
        .catch((error) => {
            console.error(error);
            expect(error).toBeDefined();
        });
}, 20000);

test("copy non-exists path", () => {
    return copyMultiDirs([["/dev/null/oraono", "/dev/null/oraoni"]])
        .then((result) => {
            expect(result).toBeNull();
        })
        .catch((error) => {
            console.error(error);
            expect(error).toBeDefined();
        });
}, 20000);
