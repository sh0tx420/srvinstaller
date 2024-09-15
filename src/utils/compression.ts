import { $ } from "bun";
import fs from "fs";
import { XzReadableStream } from "xz-decompress";
import unzipper from "unzipper";

import logging from "./logging";

async function ExtractTar(tarPath: string, destDir: string): Promise<void> {
    try {
        if (!await fs.promises.exists(destDir))
            await fs.promises.mkdir(destDir);

        // retarded shell method for extracting tar
        await $`tar -xf ${tarPath} -C ${destDir}`.quiet();

        //await logging.raw(`${res.text()}\n`);

        /* wtf
        const extractor = tar.extract({ objectMode: true });

        const readStream = fs.createReadStream(tarPath);
        const writeStream = fs.createWriteStream(path.join(destDir, "extracted.tar"))

        readStream.pipe(extractor).pipe(writeStream);

        return new Promise((resolve, reject) => {
            extractor.on("entry", async (entry) => {
                await logging.debug(`${entry.name}`);
            })
        })
        */

        // ambatukam tar extract method
        // NOTE: this one only extracts .so files because its boutta blow
        /*
        const tar = await import("tar");
        return new Promise(async (resolve, reject) => {
            await tar.extract({
                
                file: tarPath,
                cwd: destDir,
                strip: 0
            }, (err) => {
                if (err) {
                    reject(err)
                }
                else {
                    resolve();
                }
            })
        });
        */
    }
    catch (err: unknown) {
        await logging.error(`Error#ExtractTar(): ${err}`);
        console.error(err);
        throw err;
    }
}

/**
 * Parse a .zip file and decompress it
 * 
 * @param filePath Input file to decompress
 * @param outPath Where to output contents of file
 */
export async function DecompressZip(inputPath: string, outputPath: string): Promise<void> {
    const dir = await unzipper.Open.file(inputPath);
    await dir.extract({ path: outputPath });
}

/**
 * Parse a .tar.gz file and decompress it
 * 
 * @param filePath Input file to decompress
 * @param outPath Where to output contents of file
 */
export async function DecompressTarGzip(inputPath: string, outputPath: string): Promise<void> {
    try {
        // Get file from path
        const file = Bun.file(inputPath);
        const fileData = await file.bytes();

        if (!file.name)
            throw new Error("Error#DecompressTarGzip(): No file name");

        // Extract tar from .tar.gz
        const gzipData = Bun.gunzipSync(fileData);

        await fs.promises.mkdir(outputPath, { recursive: true });
        await Bun.write("./tmp/extracted.tar", gzipData);

        // Extract contents of tar file
        await ExtractTar("./tmp/extracted.tar", outputPath);
    }
    catch (err: unknown) {
        await logging.error(`Error#DecompressTarGzip(): ${err}`);
        //throw new Error(err.message);
    }
}

export async function DecompressTarXz(inputPath: string, outputPath: string): Promise<void> {
    try {
        // Get file from path
        const file = Bun.file(inputPath);
        const fileData = file.stream();

        if (!file.name)
            throw new Error("Error#DecompressTarXz(): No file name");

        // Extract tar from .tar.xz
        const xzData = new XzReadableStream(fileData);
        const xzRes = new Response(xzData);
        const xzText = await xzRes.text();

        await fs.promises.mkdir(outputPath, { recursive: true });
        await Bun.write("./tmp/extracted.tar", xzText);

        // Extract contents of tar file
        await ExtractTar("./tmp/extracted.tar", outputPath);
    }
    catch (err: unknown) {
        await logging.error(`Error#DecompressTarXz(): ${err}`);
        throw err;
    }
}
