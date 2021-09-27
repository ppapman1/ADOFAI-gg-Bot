export function isFlatParsable(value: any) {
    return typeof value === "object" && value != null && !Array.isArray(value);
}

export function wrapObject(baseKey: string, value: any) {
    let result: any = {};
    baseKey += ".";

    Object.keys(value).forEach(k => {
        result[baseKey + k] = value[k];
    });

    return result;
}

/*

{
    asdf: {
        a: 1,
        b: 3
    },
    cc: "AsdDSA"
}

=>

{
    "asdf.a": 1,
    "asdf.b": 3,
    "cc": "AsdDSA"
}

dfdsfdfsfs

*/

export function flatParseObject(obj: any): any {
    if (!isFlatParsable(obj)) {
        // console.warn(`Unsupported parse type ${typeof parsed} (isArray: ${Array.isArray(parsed)}, isNull: ${parsed == null})`);
        return obj;
    }

    let result: any = {};

    // For each keys, check if the value is flat-parsable
    Object.keys(obj).forEach(k => {
        if (isFlatParsable(obj[k])) {
            // We ASSIGN to the result instead of putting in result[k], that's not flat then
            Object.assign(result, flatParseObject(wrapObject(k, obj[k])));
        } else {
            // We can just assign this value since this value is not flat-parsable
            result[k] = obj[k];
        }
    });

    return result;
}

/**
 * Parses json but without any volume.
 * @param json The json string to parse
 */
export function flatParse(json: string): any {
    let parsed = JSON.parse(json);

    return flatParseObject(parsed);
}