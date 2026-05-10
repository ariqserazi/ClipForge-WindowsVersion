# ClipForge Windows Installer

ClipForge uses Inno Setup to build a per-user Windows installer for the Premiere Pro CEP extension.

## Requirements

- Windows 10 or Windows 11
- Inno Setup 6
- Node.js if running the npm script

Install Inno Setup from:

```text
https://jrsoftware.org/isinfo.php
```

## Build

From the project root:

```powershell
npm run installer:win
```

The build script looks for `ISCC.exe` in:

```text
C:\Program Files (x86)\Inno Setup 6\ISCC.exe
C:\Program Files\Inno Setup 6\ISCC.exe
```

The installer is written to:

```text
dist\ClipForge-Windows-Setup.exe
```

## Install Behavior

The installer is named `ClipForge Setup` and installs ClipForge to:

```text
%APPDATA%\Adobe\CEP\extensions\ClipForge
```

It does not require admin permissions by default. During install, the user can choose to enable unsigned CEP extension debug mode for:

```text
HKCU\Software\Adobe\CSXS.11
HKCU\Software\Adobe\CSXS.12
HKCU\Software\Adobe\CSXS.13
```

Each key receives this string value:

```text
PlayerDebugMode = "1"
```

After installing, restart Premiere Pro and open ClipForge from `Window > Extensions` or `Window > Extensions Legacy`.

## Uninstall Behavior

The uninstaller removes only the installed ClipForge extension folder:

```text
%APPDATA%\Adobe\CEP\extensions\ClipForge
```

It does not remove Adobe registry keys, user video files, generated clips, ffmpeg, Premiere files, or unrelated Adobe folders.
