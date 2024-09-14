import type { PkgSources } from "./utils/types";

import fs from "fs/promises";
import path from "path";

import logging from "./utils/logging";
import { ReadJson } from "./utils/json";
import { DecompressTarGzip, DecompressTarXz } from "./utils/compression";

// Package sources for server addons
const resolved = path.resolve(__dirname, "../sources.json");
const sourcesJson = await ReadJson(resolved);
const pkgSources: PkgSources = sourcesJson;

export async function InstallPkg(pkgname: string, srvDir: string): Promise<void> {
    const source = pkgSources[pkgname];

    // Download package from source
    await logging.info(`Installing package: ${pkgname}`);

    // file exts: .zip, .tar.xz, .tar.gz

    try {
        // Download & save the file
        const res = await fetch(source);
        const filename = source.split("/").pop();

        // check filename just in case
        if (!filename) {
            await logging.error("Error occurred while InstallPkg(): File name is undefined");
            return;
        }

        //const fileStream = createReadStream("./.tmp/filename.zip");
        if (!res.ok)
            throw new Error(`HTTP Error occurred while InstallPkg(): ${res.status}`);

        await fs.rm("./tmp", { recursive: true, force: false });
    
        const blob = await res.blob();
        const dest = `./tmp/${filename}`;
        await Bun.write(dest, blob);
    
        // Identify archive type and unarchive package
        //const fileext = filename.split(".").slice(-2);
        let fileext = filename.split(".").pop();
        if (fileext === "zip") {
            // Unzip
            
        }
        else {
            // Try tar.gz
            //fileext = filename.split(".").slice(-2).toString().replace(",", ".");
            fileext = filename.split(".").slice(-2).toString();

            switch (fileext) {
                case "tar,gz": {
                    // decompress gz
                    await DecompressTarGzip(dest, srvDir);
                    break;
                }
                case "tar,xz": {
                    await DecompressTarXz(dest, srvDir);
                    break;
                }
                default: {
                    break;
                }
            }
        }

        //await logging.debug(`${fileext}`);

        // Clear temp folder
        //await fs.rm("./tmp", { recursive: true, force: false });
    }
    catch (err: unknown) {
        await logging.error(`Error occurred while InstallPkg(): ${err}`);
        throw err;
    }
}
