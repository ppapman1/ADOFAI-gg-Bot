import { DataMap } from "./map";
import { readFiles } from "..";

export class FileData {
    /**
     * Initializes an instance of `FileData`.
     * @param data Loaded file data
     */
    protected constructor(public data: Map<string, DataMap>) {
        FileData._instance = this;
    }

    protected static _instance: FileData;

    /**
     * Instance of this class.
     */
    static get instance() {
        return this._instance;
    }

    /**
     * Loads the file contents from extended types.
     */
    static Load(): void {
        throw new Error("Please override FileData.Load in order to use this method!!!");
    }

    /**
     * Creates the cached values in selected files.
     */
    protected static LoadFrom(directory: string): void {
        let result = new Map<string, DataMap>();

        readFiles(directory, [".json"])?.forEach((content, filename) => {
            result.set(filename.replace(".json", ""), DataMap.Build(content));
        });

        new FileData(result);
    }
}