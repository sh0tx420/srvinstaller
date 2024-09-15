import pkg from "../package.json";

import logging from "./utils/logging";
import { InstallPkg } from "./installer";

import { parseArgs } from "util";

async function main(): Promise<void> {
    // Parse arguments
    const { values } = parseArgs({
        args: Bun.argv,
        options: {
            help: {
                type: "boolean",
                short: "h"
            },
            install: {
                type: "string",
                short: "i"
            }
        },
        strict: true,
        allowPositionals: true
    });

    if (values.help) {
        await logging.raw(`Usage:\n  ${pkg.name} [options]\n\nOptions:\n`);
        await logging.raw("  --help,    -h     Show this help message\n");
        await logging.raw("  --install, -i     Install a specific package\n\n");

        process.exit(0);
    }
    else if (values.install) {
        const baseDir = prompt("Input game directory of server:");

        if (!baseDir) {
            await logging.error("No server directory given, exiting...");
            return;
        }

        await InstallPkg(values.install, baseDir);
    }
}

await main();
