import { Logger } from "../../classes/Logger";

test("all logger methods should not yield error", () => {
    const logger = new Logger();
    try {
        logger.debug("debug");
        logger.error("error");
        logger.info("info");
        logger.log("log");
        logger.warn("warn");
    } catch (error) {
        expect(error).toBeUndefined();
    }
});
