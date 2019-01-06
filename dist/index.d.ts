import { AnyFunction, IUserDeclarativeConfig, TChimera, TRamda } from "./interfaces/descriptor";
export declare const R: TRamda;
export declare const X: TChimera;
export declare function inject(containerFile: string, userInjectionFile?: string | string[]): AnyFunction;
/**
 * @param declarativeConfig IDeclarativeConfig
 */
export declare function declare(partialDeclarativeConfig: Partial<IUserDeclarativeConfig>): AnyFunction;
