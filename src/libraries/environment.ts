function addToObj(obj: { [key: string]: any }, keyParts: string[], value: any): { [key: string]: any } {
    if (keyParts.length < 1 || !(keyParts[0] in obj)) {
        return obj;
    }
    const key = keyParts[0];
    obj[key] = keyParts.length === 1 ? value : addToObj(obj[key], keyParts.slice(1), value);
    return obj;
}

export function cascade(
    obj: { [key: string]: any }, env: { [key: string]: any } = process.env,
): { [key: string]: any } {
    for (const key in env) {
        if (key in env) {
            const keyParts = key.split("_");
            let value;
            try {
                value = JSON.parse(env[key]);
            } catch (error) {
                value = env[key];
            }
            obj = addToObj(obj, keyParts, value);
        }
    }
    return obj;
}
