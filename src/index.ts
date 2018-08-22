import { RequireCache } from "@speedy/require-cache";
new RequireCache({ cacheKiller: __dirname + "/package.json" }).start();

import { Logger } from "./classes/Logger";
import { compile, copyMultiDirs, execute, getCompiledScript, getFiles } from "./libraries/tools";
import { __cmd, __parseIns, sys } from "./libraries/utilities";

export { __cmd, __parseIns, Logger, compile, copyMultiDirs, execute, getCompiledScript, getFiles, sys };
