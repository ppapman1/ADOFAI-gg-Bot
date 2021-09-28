import { existsSync, readdirSync, readFileSync } from 'fs';

/**
 * Checks the filename's extension.
 * @param filename Name of the file to check extension from
 * @param extensions List of extensions to check
 * @returns Whether the filename ends with any of extensions listed
 */
export function checkExtensions(filename: string, extensions: string[]): boolean {
    for (let i = 0; i < extensions.length; i++) {
        if (filename.endsWith(extensions[i] as string)) return true;
    }
    
    return false;
}

/**
 * Combine paths by safely adding separator.
 * @param paths List of path to combine
 * @returns Subdirectories within parameters
 */
export function combinePath(...paths: string[]): string {
    return paths.reduce(p => {
        if (!p.endsWith("/")) p += "/";
        return p;
    });
}

/**
 * Reads files in directory and maps them.
 * @param path Directory to read files from
 * @returns Map of file name and file content
 */
export function readFiles(path: string, allowedExtensions: string[] | null = null): Map<string, string> | null {
    let result = new Map<string, string>();

    // Return null if there is no directory
    if (!existsSync(path)) return null;
    
    readdirSync(path).forEach(f => {
        if (!allowedExtensions || checkExtensions(f, allowedExtensions)) {
            // result.set (filename, content)
            result.set(f, readFileSync(combinePath(path, f)).toString());
        }
    });

    return result;
}