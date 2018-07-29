import {WebApp} from "../classes/WebApp";
import {cmdComposedCommand as __cmd} from "./cmd";
import {httpRequest, jsonRpcRequest} from "./http";
import {createPrompt, print} from "./inputOutput";
import {parseStringArray as __parseIns} from "./stringUtil";

const sys = {
    WebApp,
    httpRequest,
    jsonRpcRequest,
    print,
    prompt: createPrompt(),
};

export {__cmd, __parseIns, sys};
