import type { PkgSources } from "./utils/types";

import fs from "fs/promises";
import path from "path";

import logging from "./utils/logging";
import { ReadJson } from "./utils/json";
import { DecompressTarGzip, DecompressTarXz, DecompressZip } from "./utils/compression";

// Package sources for server addons
const resolved = path.resolve(__dirname, "../sources.json");
const sourcesJson = await ReadJson(resolved);
const pkgSources: PkgSources = sourcesJson;

async function FixPaths(pkgname: string, srvGameDir: string): Promise<void> {
    switch (pkgname) {
        case "metamod_p": {
            // Create metamod directory
            const createDir = `${srvGameDir}/addons/metamod/`;

            if (await fs.exists(createDir))
                await fs.mkdir(createDir);

            // Move metamod.so to addons/metamod/
            await fs.cp(`${srvGameDir}/metamod.so`, `${createDir}/metamod.so`);
            await fs.rm(`${srvGameDir}/metamod.so`);

            break;
        }
        case "metamod_r": {
            await fs.rm(`${srvGameDir}/example_plugin/`, { recursive: true, force: false });
            await fs.rm(`${srvGameDir}/sdk/`, { recursive: true, force: false });

            break;
        }
        default: {
            break;
        }
    }
}

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
            await DecompressZip(dest, srvDir);
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

            await logging.info("Package installed successfully.");
        }

        //await logging.debug(`${fileext}`);

        // Clear temp folder
        await fs.rm("./tmp", { recursive: true, force: false });

        // Fix paths for specific packages
        await FixPaths(pkgname, srvDir);
    }
    catch (err: unknown) {
        await logging.error(`Error occurred while InstallPkg(): ${err}`);
        throw err;
    }
}
