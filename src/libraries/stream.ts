export function readFromStream(stream: NodeJS.ReadableStream): Promise<any> {
    return new Promise((resolve, reject) => {
        const chunks: Buffer[] = [];
        stream.on("error", reject);
        stream.on("data", (chunk: Buffer) => chunks.push(chunk));
        stream.on("end", () => {
            const data = Buffer.concat(chunks).toString();
            resolve(data);
        });
    });
}
