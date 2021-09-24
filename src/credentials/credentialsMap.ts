import { CredentialsValue } from "../typings"

/**
 * Basically Map but with an extra feature.
 */
export class CredentialsMap extends Map<string, CredentialsValue> {
    /**
     * Finds keys based from certain key.
     * @param baseKey Base key to get keys "based in" the key
     * @returns List of keys
     */
    keysIn(baseKey: string): string[] {
        const iterator = this.keys();
        let iteratorValue = iterator.next();
        let result: string[] = [];

        // Shorthand call for Array.prototype.push
        function pushItem(s: string): void {
            if (s.startsWith(baseKey + ".")) result.push(s);
        }

        while (!iteratorValue.done) {
            pushItem(iteratorValue.value);

            iteratorValue = iterator.next();
        }

        // Try to add one more because if done is true, item won't get pushed
        pushItem(iteratorValue.value);

        return result;
    }
}