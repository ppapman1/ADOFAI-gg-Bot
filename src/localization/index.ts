import { Language } from "../typings";
import { assignParams, FileData } from "../util";

export class Localizations extends FileData {
    protected static override _instance: Localizations;

    /**
     * Instance of this class.
     */
    static override get instance() {
        return this._instance;
    }

    /**
     * Name of the data to display in the log.
     */
    static override readonly dataType = "localizations";

    /**
     * Loads current file data.
     */
    static override Load(): void {
        this.LoadFrom("./dist/localization");
    }

    // extended features
    // -----------------

    /**
     * Gets the localization string directly.
     * @param key Localization string key
     * @param language Language to get the key from
     * @param params Parameters to assign to the result string
     * @returns Localized string with variables applied
     */
    static override Get(key: string, language: Language = "English", params: {[key: string]: any} = {}): string {
        return this.GetWithCheck(key, language, params).value;
    }

    /**
     * Gets the localization string with check.
     * @param key Localization string key
     * @param language Language to get the key from
     * @param params Parameters to assign to the result string
     * @returns Localized string with variables applied
     */
    static GetWithCheck (key: string, language: Language, params: {[key: string]: any} = {}): { success: boolean, value: string} {
        let result = {
            success: false,
            value: ""
        };

        // Global key check
        if (key.startsWith("global.")) {
            language = "Global";
            key = key.replace("global.", "");
        }

        let langContent: any = this.instance.data.get(language);

        // Language not found
        if (!langContent) {
            console.warn(`Localization language '${language}' not found!`);
            result.value = `No such language '${language}'`;

            return result;
        }

        let str = langContent[key];

        // There's no string here
        if (str === undefined) {
            console.warn(`Localization key '${key}' on language '${language}' not found!`);
            result.value = `No such key '${key}'`;

            // Fallback
            if (language !== "English") {
                result = this.GetWithCheck (key, "English", params);
            }

            return result;
        }

        result.success = true;
        result.value = assignParams(str, params);

        return result;
    }
}