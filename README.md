# ClipForge-Windows

ClipForge-Windows is a Windows-only Adobe Premiere Pro CEP extension that generates random short b roll clips from local video files with `ffmpeg` and `ffprobe`, then optionally imports the generated clips into the current Premiere Pro project.

This project is intentionally a CEP extension. It is not Electron, UXP, a desktop app, a web app, or a server project.

## Features

- Windows-only Premiere Pro CEP panel
- Select an input folder of source videos
- Select or enter an output folder
- Generate random silent H.264 `.mp4` b roll clips
- Optionally import generated clips into Premiere Pro
- Safe output names like `broll_0001.mp4`
- Case-insensitive input support for `.mp4`, `.mkv`, `.mov`, `.avi`, and `.m4v`
- Windows path support for drive letters, backslashes, and spaces

Default generation behavior:

- `30` clips
- `6` seconds each
- skip the first `90` seconds
- skip the last `90` seconds
- write silent H.264 `.mp4` files

## Requirements

- Windows 10 or Windows 11
- Adobe Premiere Pro with CEP or Extensions Legacy support
- `ffmpeg.exe` and `ffprobe.exe`
- Node.js for validation and helper scripts
- Inno Setup 6 only if building the installer

## Install ffmpeg

Use one of these Windows install options.

With winget:

```powershell
winget install Gyan.FFmpeg
```

With Chocolatey:

```powershell
choco install ffmpeg
```

With Scoop:

```powershell
scoop install ffmpeg
```

Manual install:

1. Download a Windows ffmpeg build.
2. Extract it so the tools live at `C:\ffmpeg\bin`.
3. Confirm these files exist:

```text
C:\ffmpeg\bin\ffmpeg.exe
C:\ffmpeg\bin\ffprobe.exe
```

ClipForge-Windows checks `ffmpeg.exe` and `ffprobe.exe` from `PATH`, then:

```text
C:\ffmpeg\bin
C:\Program Files\ffmpeg\bin
C:\Program Files (x86)\ffmpeg\bin
```

## Enable CEP Debug Mode

Unsigned CEP extensions require Adobe debug mode. Run:

```powershell
npm run debug:win
```

This creates or updates:

```text
HKCU\Software\Adobe\CSXS.11
HKCU\Software\Adobe\CSXS.12
HKCU\Software\Adobe\CSXS.13
```

Each key receives:

```text
PlayerDebugMode = "1"
```

Restart Premiere Pro after enabling debug mode.

## Manual Extension Install

Recommended per-user install path:

```text
%APPDATA%\Adobe\CEP\extensions\ClipForge
```

Install with:

```powershell
npm run install:win
```

System-level alternatives are available, but usually require admin permissions:

```text
C:\Program Files\Common Files\Adobe\CEP\extensions\ClipForge
C:\Program Files (x86)\Common Files\Adobe\CEP\extensions\ClipForge
```

Manual fallback:

1. Create `%APPDATA%\Adobe\CEP\extensions`.
2. Copy this extension folder into that directory.
3. Make sure the installed folder is named `ClipForge`.
4. Confirm `CSXS\manifest.xml` is directly inside the installed `ClipForge` folder.
5. Run `npm run debug:win`.
6. Restart Premiere Pro.

## Windows Installer

Build the Inno Setup installer with:

```powershell
npm run installer:win
```

The installer is written to:

```text
dist\ClipForge-Windows-Setup.exe
```

The installer:

- installs to `%APPDATA%\Adobe\CEP\extensions\ClipForge`
- does not require admin permissions by default
- can optionally enable CEP debug mode
- tells the user to restart Premiere Pro when installation finishes

The uninstaller removes only:

```text
%APPDATA%\Adobe\CEP\extensions\ClipForge
```

It does not delete user video files, generated clips, ffmpeg, Premiere files, or unrelated Adobe folders.

## Open In Premiere Pro

After installing and restarting Premiere Pro, open:

```text
Window > Extensions > ClipForge
```

If your Premiere Pro version labels CEP panels as legacy, use:

```text
Window > Extensions Legacy > ClipForge
```

## Development

Run validation:

```powershell
npm run validate
```

Create a distributable zip:

```powershell
npm run zip
```

Useful Windows commands:

```powershell
npm run validate
npm run debug:win
npm run install:win
npm run installer:win
```

## Troubleshooting

### Panel does not appear

- Confirm the installed folder is `%APPDATA%\Adobe\CEP\extensions\ClipForge`.
- Confirm `CSXS\manifest.xml` exists inside that folder.
- Run `npm run debug:win`.
- Fully quit and restart Premiere Pro.
- Check `Window > Extensions` and `Window > Extensions Legacy`.

### Unsigned extension is not enabled

Run:

```powershell
npm run debug:win
```

Then restart Premiere Pro.

### Wrong CEP folder

Use the per-user path first:

```text
%APPDATA%\Adobe\CEP\extensions\ClipForge
```

The system-level folders can work, but they usually require admin permissions.

### ffmpeg not found

- Install ffmpeg.
- Add the ffmpeg `bin` folder to `PATH`.
- Or install it at `C:\ffmpeg\bin`.
- Confirm both `ffmpeg.exe` and `ffprobe.exe` are available.

### Paths with spaces

ClipForge-Windows calls ffmpeg and ffprobe with argument arrays, so paths like these are supported:

```text
D:\Anime Clips\Input
C:\Users\YourName\Desktop\ClipForge Output
```

If a path fails, verify the folder exists and that Premiere Pro can access it.

### Premiere needs restart

Premiere Pro scans CEP extensions when it starts. Restart Premiere Pro after installing, uninstalling, or changing debug mode.

### Inno Setup not found

Install Inno Setup 6, then run:

```powershell
npm run installer:win
```

The build script checks:

```text
C:\Program Files (x86)\Inno Setup 6\ISCC.exe
C:\Program Files\Inno Setup 6\ISCC.exe
```

### Installer built but extension does not appear

- Run the installer again and keep CEP debug mode enabled.
- Confirm `%APPDATA%\Adobe\CEP\extensions\ClipForge\CSXS\manifest.xml` exists.
- Restart Premiere Pro.
- Check both Extensions menus.

## License

MIT License. See [LICENSE](./LICENSE).
