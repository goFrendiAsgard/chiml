import { readFile, writeFile } from "fs";
import { join } from "path";
import { IStorage } from "./interfaces";

const fileName = join(__dirname, "../event.json");

export default class Storage {

    public async append(line: string): Promise<any> {
        return new Promise((resolve, reject) => {
            this.read()
            .then((eventList: string[]) => {
                eventList.push(line);
                try {
                    const content = JSON.stringify(eventList, null, 2);
                    writeFile(fileName, content, (error) => {
                        if (error) {
                            return reject(error);
                        }
                        resolve(content);
                    });
                } catch (parseError) {
                    reject(parseError);
                }
            })
            .catch((readError) => {
                reject(readError);
            });
        });
    }

    public async read(): Promise<any> {
        return new Promise((resolve, reject) => {
            readFile(fileName, (readError, content) => {
                if (readError) {
                    return reject(readError);
                }
                try {
                    return resolve(JSON.parse(String(content)));
                } catch (parseError) {
                    return reject(parseError);
                }
            });
        });
    }

}
