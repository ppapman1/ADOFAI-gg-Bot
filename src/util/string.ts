/**
 * Assign parameters in the variabled string.
 * @param str String to assign parameters
 * @param params Parameter values to assign
 */
export function assignParams(str: string, params: {[key: string]: any}): string {
    // Return the string without any parameters
    if (!str.includes("{") || !Object.keys(params).length) return str;

    // Get matching regexes
    str.match(/({[^}]+})/g)?.forEach(m => {
        let param = m.substr(1, m.length - 2);

        // Check if the value exists but in quick way
        if (params[param] !== undefined) {
            str = str.replace(m, params[param]);
        }
    });

    return str;
}
