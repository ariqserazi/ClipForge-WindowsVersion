# ClipForge-Windows

ClipForge-Windows is a Windows-only Adobe Premiere Pro extension.

It takes videos from a folder, makes random short b roll clips with `ffmpeg`, and can import those clips into Premiere Pro.

This is a Premiere Pro CEP extension. It is not Electron, UXP, a desktop app, or a website.

## Easiest Install

For most people, this is the only thing they should do:

1. Download this repo.
2. Unzip it.
3. Open the folder.
4. Double-click this file:

```text
Install-ClipForge-Windows.bat
```

That file tries to do everything:

- install ffmpeg if Windows does not already have it
- enable Premiere Pro extension support
- copy ClipForge into the correct Premiere Pro folder

When it finishes, restart Premiere Pro.

Then open ClipForge from:

```text
Window > Extensions > ClipForge
```

If you do not see it there, try:

```text
Window > Extensions Legacy > ClipForge
```

## What You Need

The one-click installer expects:

1. Windows 10 or Windows 11
2. Adobe Premiere Pro
3. Internet access if ffmpeg needs to be installed

You do not need Node.js for the one-click installer.

You only need Node.js if you want to run development commands yourself, like:

```powershell
npm run debug:win
npm run install:win
npm run installer:win
```

You only need Inno Setup if you want to build the `.exe` installer yourself.

ClipForge installs to:

```text
%APPDATA%\Adobe\CEP\extensions\ClipForge
```

The installer build is documented in:

```text
installer/README.md
```
