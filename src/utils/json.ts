import { readFile } from "fs/promises";

import logging from "./logging";

/**
 * Reads a JSON configuration file from a path.
 * 
 * @param fpath File path to read from
 * @returns JSON object of the configuration file
 */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function ReadJson(fpath: string): Promise<any> {
    try {
        // Read file
        const content: string = await readFile(fpath, { encoding: "utf-8" });
        
        // Support JSON with Comments
        // NOTE: broken for now
        const lines = content.split("\n");
        const processedLines = lines.map(line => {
            return line.replace(/\/\/.*$/, "");
        });

        const cfgfile = processedLines.join("\n");
        
        return JSON.parse(cfgfile);
    }
    catch {
        logging.warn(`Failed to read json file: ${fpath}`);
        return undefined;
    }
}
