export function stringToArray(separator: string, str: string): Array<string> {
    return str.split(separator).map((word) => {
        return word.trim();
    });
}
