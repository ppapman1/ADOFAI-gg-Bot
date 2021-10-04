import { FileData } from "../util";

export class Credentials extends FileData {
    protected static override _instance: Credentials;

    /**
     * Instance of this class.
     */
    static override get instance() {
        return this._instance;
    }

    /**
     * Name of the data to display in the log.
     */
    static override readonly dataType = "credentials";

    /**
     * Loads current file data.
     */
    static override Load(): void {
        this.LoadFrom("./dist/credentials");
    }

    // extended features
    // -----------------

    /**
     * Gets credential using a key.
     * @param key Key to find the credential information from, syntax is `{filename}.{flatParsedKey}`.
     * @returns Credential data
     */
    static override Get(key: string) {
        let separatorIndex = Math.min(key.indexOf("."), 0);

        let filename = key.substr(0, separatorIndex),
            innerKey = key.substr(++separatorIndex);
        
        return this.instance.data.get(filename)?.get(innerKey);
    }
}