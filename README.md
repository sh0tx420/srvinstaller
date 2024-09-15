# srvinstaller
CLI app for installing GoldSrc/Source/Source2 gameservers and popular addons

### Installation
1. Install [Bun](https://bun.sh/)
2. Clone this repository: `git clone https://github.com/sh0tx420/srvinstaller.git`
3. Install dependencies: `bun install`
4. Run program: `bun start -h`

### Installation (Single-file executable)
This app is bundled to a single-file executable release with Bun.
<br>
If for some reason you don't like the normal installation method, you can install it this way, although the file size is very large.
1. Go to Releases and download:
    - `srvinstaller_win32.exe` if using Windows
    - `srvinstaller` if using Linux
    - `sources.json` - Required for package sources
2. Run the program: `./srvinstaller -h`

### Usage
```md
$ bun run src/main.ts -h
Usage:
  srvinstaller [options]

Options:
  --help,    -h     Show this help message    
  --install, -i     Install a specific package
```
