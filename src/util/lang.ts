import { assignParams } from ".";
import { loadFiles } from "../lang";
import { Language } from "../typings";

let localizationContents = loadFiles();

export namespace Localization {
    export function Get(key: string, language: Language, params: {[key: string]: any} = {}): string {
        let langContent = localizationContents.get(language);

        // Language not found
        if (!langContent) {
            console.warn(`Localization language '${language}' not found!`);

            return `No such language '${language}'`;
        }

        let result = langContent[key];

        if (result === undefined) {
            console.warn(`Localization key '${key}' on language '${language}' not found!`);

            return `No such key '${key}'`;
        }

        return assignParams(result, params);
    }

    export function Reload(): void {
        localizationContents = loadFiles();
    }
}