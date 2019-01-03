import * as cote from "cote";
export function createPublishHandler(
    Publisher: any,
    configCreator: () => {name: string, event: string},
): (req: any, cb: any) => void {
    const { name, event } = configCreator();
    const publisher = new Publisher() as cote.Publisher;
    return (req: any, cb: any) => {
        publisher.publish(event, req);
        cb(null, `New event ${req} published`);
    };
}
