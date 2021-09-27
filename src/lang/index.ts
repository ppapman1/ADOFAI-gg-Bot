import { Language } from "../typings";
import { flatParse, readFiles } from "../util";

export function loadFiles(): Map<Language, {[key: string]: string}> {
    let result = new Map<Language, {[key: string]: string}>();

    readFiles(".", [".json"])?.forEach((content, filename) => {
        let parsedContent: {[key: string]: string} = {};
        
        try {
            parsedContent = flatParse(content);
        } catch (e) {
            console.error(`Cannot parse file ${filename}`, e);
        }

        result.set(filename.replace(".json", "") as Language, parsedContent);
    });

    return result;
}