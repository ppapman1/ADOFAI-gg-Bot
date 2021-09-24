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

/**
 * Parses json but without any volume.
 * @param json The json string to parse
 */
export function flatParse(json: string): any {
    let parsed = JSON.parse(json);

    if (!isFlatParsable(parsed)) {
        // console.warn(`Unsupported parse type ${typeof parsed} (isArray: ${Array.isArray(parsed)}, isNull: ${parsed == null})`);
        return parsed;
    }

    let result: any = {};

    Object.keys(parsed).forEach(k => {
        // if (isFlatParsable) {
            
        // }
        result[k] = parsed[k];
    })
}