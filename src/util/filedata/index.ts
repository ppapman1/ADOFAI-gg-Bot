import { DataMap } from "./map";
import { readFiles } from "..";
import { JsonValue } from "../../typings";

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
     * Name of the data to display in the log.
     */
    static readonly dataType: string = "unset";

    /**
     * Loads the file contents from extended types.
     */
    static Load(): void {
        throw new Error("Please override FileData.Load in order to use this method!!!");
    }

    /**
     * Creates the cached values in selected files.
     */
    protected static LoadFrom(directory: string, extensions: string[] = [".json"]): void {
        let result = new Map<string, DataMap>();

        let ext = "(";
        extensions.forEach((e, i) => {
            ext += e.replace(/\./g, "\\.") + (i == extensions.length - 1 ? ")$" : "|");
        });

        readFiles(directory,extensions)?.forEach((content, filename) => {
            result.set(filename.replace(new RegExp(ext, "g"), ""), DataMap.Build(content));
        });

        new FileData(result);
    }

    //@ts-ignore key parameter is unused here but it is extended
    public static Get(key: string): JsonValue | undefined {
        throw new Error("Please override FileData.Get in order to use this method!!!");
    };
}