import { RequireCache } from "@speedy/require-cache";
new RequireCache({ cacheKiller: __dirname + "/package.json" }).start();

import { SingleTask } from "./classes/SingleTask";
import { WebApp } from "./classes/WebApp";
import { CommandType, FunctionalMode, Mode } from "./enums/singleTaskProperty";
import { IRawConfig } from "./interfaces/IRawConfig";
import { ISingleTask } from "./interfaces/ISingleTask";
import { cmd, cmdComposedCommand, composeCommand, getChimlCompiledScriptPath } from "./libraries/cmd";
import { cascade } from "./libraries/environment";
import { httpRequest, jsonRpcRequest } from "./libraries/http";
import { createPrompt, print } from "./libraries/inputOutput";
import {
    createAuthenticationMiddleware, createAuthorizationMiddleware,
    createJsonRpcMiddleware, createMiddleware,
    createRouteMiddleware, defaultOutProcessor,
} from "./libraries/middlewares";
import { createSandbox } from "./libraries/sandbox";
import { tsToJs } from "./libraries/scriptTransform";
import {
    normalizeRawConfig, strToNormalizedConfig,
    strToRawConfig,
} from "./libraries/singleTaskConfigProcessor";
import { createHandlerScript, renderTemplate } from "./libraries/singleTaskScriptGenerator";
import { readFromStream } from "./libraries/stream";
import {
    chimlToConfig, chimlToYaml, doubleQuote, isFlanked,
    parseStringArray, removeFlank, smartSplit,
} from "./libraries/stringUtil";
import { compile, execute, getCompiledScript, getFiles } from "./libraries/tools";
import { __cmd, __parseIns, sys } from "./libraries/utilities";

export {
    __cmd,
    __parseIns,
    CommandType,
    FunctionalMode,
    IRawConfig,
    ISingleTask,
    Mode,
    SingleTask,
    WebApp,
    cascade,
    chimlToConfig,
    chimlToYaml,
    cmd,
    cmdComposedCommand,
    composeCommand,
    compile,
    createAuthenticationMiddleware,
    createAuthorizationMiddleware,
    createHandlerScript,
    createJsonRpcMiddleware,
    createMiddleware,
    createRouteMiddleware,
    createPrompt,
    createSandbox,
    defaultOutProcessor,
    doubleQuote,
    execute,
    getChimlCompiledScriptPath,
    getCompiledScript,
    getFiles,
    httpRequest,
    isFlanked,
    jsonRpcRequest,
    normalizeRawConfig,
    parseStringArray,
    print,
    readFromStream,
    removeFlank,
    renderTemplate,
    smartSplit,
    strToNormalizedConfig,
    strToRawConfig,
    sys,
    tsToJs,
};
