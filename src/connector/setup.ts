import { Localizations } from "../localization";
import { Credentials } from "../credentials";
import { Config } from "../config";

/**
 * Setup file data
 */
export function Setup(): void {
    [Localizations, Credentials, Config].forEach(f => {
        console.log(`Setup> Loading ${f.dataType}..`)
        f.Load();
    });
}