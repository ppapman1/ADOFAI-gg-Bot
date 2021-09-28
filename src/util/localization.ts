import { assignParams } from ".";
import { loadFiles } from "../lang";
import { Language } from "../typings";

let localizationContents = loadFiles();

export namespace Localization {
    /**
     * Gets the localization string without returning check values.
     * @param key Localization string key
     * @param language Language to get the key from
     * @param params Parameters to assign to the result string
     * @returns Localized string with variables applied
     */
    export function Get(key: string, language: Language, params: {[key: string]: any} = {}): string {
        return GetWithCheck(key, language, params).value;
    }

    /**
     * Gets the localization string with check.
     * @param key Localization string key
     * @param language Language to get the key from
     * @param params Parameters to assign to the result string
     * @returns Localized string with variables applied
     */
    export function GetWithCheck (key: string, language: Language, params: {[key: string]: any} = {}): { success: boolean, value: string} {
        let result = {
            success: false,
            value: ""
        };

        let langContent = localizationContents.get(language);

        // Language not found
        if (!langContent) {
            console.warn(`Localization language '${language}' not found!`);
            result.value = `No such language '${language}'`;

            return result;
        }

        let str = langContent[key];

        if (str === undefined) {
            console.warn(`Localization key '${key}' on language '${language}' not found!`);
            result.value = `No such key '${key}'`;

            // Fallback
            if (language !== "English") {
                result = GetWithCheck (key, "English", params);
            }

            return result;
        }

        result.success = true;
        result.value = assignParams(str, params);

        return result;
    }

    /**
     * Reload the localization strings.
     */
    export function Reload(): void {
        localizationContents = loadFiles();
    }
}