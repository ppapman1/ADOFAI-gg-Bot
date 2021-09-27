import { CredentialsMap } from "./credentialsMap";
import { flatParse } from "../util";

export function CredentialsBuilder(fileContent: string): CredentialsMap {
    let result = new CredentialsMap();

    let parsed = flatParse(fileContent);
    Object.keys(parsed).forEach(k => {
        result.set(k, parsed[k]);
    });

    return result;
}