#! /usr/bin/env node
import { execute, Logger } from "../index";

function main(args: any[]): any {
    const logger = new Logger();
    if (args.length < 1) {
        return logger.error("Expect more than one parameter(s): `chiml script/file` and `inputs`");
    }
    return execute(...args)
        .then((result) => {
            logger.log(result);
        })
        .catch((error) => {
            logger.error(error);
        });
}

if (require.main === module) {
    const args = process.argv.slice(2);
    main(args);
}
