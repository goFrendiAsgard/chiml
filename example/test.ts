import { X } from "chiml";

const main = X.declarative({
    vals: {...X},
    comp: {
        average: ["<divide>", ["<sum>", "<length>"]],
    },
    main: "average",
});
