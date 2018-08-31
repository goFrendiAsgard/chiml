"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Logger_1 = require("../../classes/Logger");
test("all logger methods should not yield error", () => {
    const logger = new Logger_1.Logger();
    try {
        logger.debug("debug");
        logger.error("error");
        logger.info("info");
        logger.log("log");
        logger.warn("warn");
        expect(true).toBeTruthy();
    }
    catch (error) {
        expect(error).toBeUndefined();
    }
});
//# sourceMappingURL=Logger.test.js.map