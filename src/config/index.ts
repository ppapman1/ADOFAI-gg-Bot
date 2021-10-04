import { FileData } from "../util";

export class Config extends FileData {
    protected static override _instance: Config;

    /**
     * Instance of this class.
     */
    static override get instance() {
        return this._instance;
    }

    static override Load(): void {
        this.LoadFrom("./dist/config");
    }

    // extended features
    // -----------------

    /**
     * Gets configuration data using a key.
     * @param key Key to find the config value from, syntax is `{flatParsedKey}`.
     * @returns Config data in key
     */
    static override Get(key: string) {
        return this.instance.data.get("config")?.get(key);
    }
}