#! /usr/bin/env node
import { execute } from "../index";

function main(args: any[]): any {
    if (args.length < 1) {
        return console.error("Expect more than one parameter(s): `chiml script/file` and `inputs`");
    }
    return execute(...args)
        .then((result) => {
            console.log(result);
        })
        .catch((error) => {
            console.error(error);
        });
}

if (require.main === module) {
    const args = process.argv.slice(2);
    main(args);
}
