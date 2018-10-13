export type IChimlResult = Promise<any>;
export type IAnyFunction = (...args: any) => any;

interface ISingleProgramSkeleton {
    ins: string[];
    out: string;
}

interface ICompositeProgramSkeleton extends ISingleProgramSkeleton {
    vars: string[];
    branchCondition: IExecution;
    loopCondition: IExecution;
}

interface ISingleInternalAction extends ISingleProgramSkeleton {
    process: Promise<any> | IAnyFunction;
}

interface ISingleExternalAction extends ISingleProgramSkeleton {
    command: string;
}

interface ISerialAction extends ICompositeProgramSkeleton {
    series: IProgram[];
}

interface IParallelAction extends ICompositeProgramSkeleton {
    parallel: IProgram[];
}

export interface IExecution {
    args: any[];
    program: IProgram;
}

export type IProgram = ISingleInternalAction | ISingleExternalAction | ISerialAction | IParallelAction;
