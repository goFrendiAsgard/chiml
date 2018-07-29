export enum Mode {
    parallel,
    series,
    single,
}

export enum FunctionalMode {
    none,
    map,
    filter,
    reduce,
}

export enum CommandType {
    cmd,
    jsAsyncFunction,
    jsSyncFunction,
    jsPromise,
}
