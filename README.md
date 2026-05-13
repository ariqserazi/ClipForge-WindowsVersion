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

You only need Node.js if you want to run the development commands yourself.

You only need Inno Setup if you want to build the `.exe` installer yourself.

## Command Line Install

If you prefer PowerShell, open PowerShell in this project folder and run:

```powershell
npm run setup:win
```

Or run the manual commands one by one:

```powershell
npm run validate
npm run debug:win
npm run install:win
```

Then restart Premiere Pro.

Open ClipForge in Premiere Pro from:

```text
Window > Extensions > ClipForge
```

If you do not see it there, try:

```text
Window > Extensions Legacy > ClipForge
```

## Step 1: Check ffmpeg

ClipForge needs two helper programs:

```text
ffmpeg.exe
ffprobe.exe
```

These are not part of Premiere Pro. They are separate video tools.

First, check if you already have them.

Open PowerShell and run:

```powershell
ffmpeg -version
ffprobe -version
```

If both commands show version information, you are done with this step.

If PowerShell says something like this:

```text
The term 'ffmpeg' is not recognized
```

then Windows cannot find ffmpeg yet. Use one of the install options below.

## Step 1A: Install ffmpeg If Needed

The easiest option is usually this PowerShell command:

```powershell
winget install Gyan.FFmpeg
```

After it finishes, close PowerShell, open PowerShell again, and check:

```powershell
ffmpeg -version
ffprobe -version
```

If both commands show version information, you are good.

Other install options:

```powershell
choco install ffmpeg
```

```powershell
scoop install ffmpeg
```

## Step 1B: If You Already Have ffmpeg Somewhere

If your computer already has ffmpeg, ClipForge can use it.

The important thing is that ClipForge must be able to find both files:

```text
ffmpeg.exe
ffprobe.exe
```

The simplest fix is to put them here:

```text
C:\ffmpeg\bin\ffmpeg.exe
C:\ffmpeg\bin\ffprobe.exe
```

So the folder should look like this:

```text
C:\ffmpeg\bin
  ffmpeg.exe
  ffprobe.exe
```

If your ffmpeg is installed somewhere else, add that folder to your Windows `PATH`.

ClipForge looks in these places:

```text
Windows PATH
C:\ffmpeg\bin
C:\Program Files\ffmpeg\bin
C:\Program Files (x86)\ffmpeg\bin
```

## Step 2: Enable Premiere Pro Debug Mode

Premiere Pro blocks unsigned CEP extensions unless debug mode is enabled.

Run:

```powershell
npm run debug:win
```

This sets:

```text
PlayerDebugMode = "1"
```

For these registry keys:

```text
HKCU\Software\Adobe\CSXS.11
HKCU\Software\Adobe\CSXS.12
HKCU\Software\Adobe\CSXS.13
```

You only need to do this once.

## Step 3: Install ClipForge

Run:

```powershell
npm run install:win
```

This copies ClipForge to:

```text
%APPDATA%\Adobe\CEP\extensions\ClipForge
```

This is the recommended install location because it does not need administrator permission.

After installing, restart Premiere Pro.

## Step 4: Open ClipForge

In Premiere Pro, open:

```text
Window > Extensions > ClipForge
```

If that menu does not show ClipForge, try:

```text
Window > Extensions Legacy > ClipForge
```

## How To Use ClipForge

1. Open ClipForge in Premiere Pro.
2. Choose an input folder with your source videos.
3. Choose an output folder for the generated clips.
4. Leave the default settings or adjust them.
5. Click `Generate Clips`.
6. Wait for the clips to finish.
7. Click `Import Generated Clips` if you want them imported into Premiere Pro.

ClipForge does not edit or delete your source videos.

## Default Clip Settings

By default, ClipForge creates:

- `30` clips
- `6` seconds per clip
- no audio
- H.264 `.mp4` files
- filenames like `broll_0001.mp4`
- clips that skip the first `90` seconds of each source video
- clips that skip the last `90` seconds of each source video

Supported input files:

```text
.mp4
.mkv
.mov
.avi
.m4v
```

Uppercase extensions also work, like `.MP4`, `.MOV`, and `.MKV`.

## Good Folder Examples

These are valid Windows paths:

```text
C:\Users\YourName\Videos
D:\Anime Clips\Input
C:\Users\YourName\Desktop\ClipForge Output
```

Paths with spaces are okay.

## Build The Windows Installer

Only do this if you want to create the installer `.exe`.

Install Inno Setup 6 first:

```text
https://jrsoftware.org/isinfo.php
```

Then run:

```powershell
npm run installer:win
```

The installer will be created here:

```text
dist\ClipForge-Windows-Setup.exe
```

The installer installs ClipForge to:

```text
%APPDATA%\Adobe\CEP\extensions\ClipForge
```

It can also enable CEP debug mode during install.

## Useful Commands

Do everything:

```powershell
npm run setup:win
```

Check the project:

```powershell
npm run validate
```

Enable Premiere Pro debug mode:

```powershell
npm run debug:win
```

Install ClipForge:

```powershell
npm run install:win
```

Build the installer:

```powershell
npm run installer:win
```

## Manual Install

Use this only if the install script does not work.

1. Press `Win + R`.
2. Paste this:

```text
%APPDATA%\Adobe\CEP\extensions
```

3. Press Enter.
4. Create the `extensions` folder if it does not exist.
5. Copy this project folder into that folder.
6. Rename the copied folder to:

```text
ClipForge
```

7. Make sure this file exists:

```text
%APPDATA%\Adobe\CEP\extensions\ClipForge\CSXS\manifest.xml
```

8. Run:

```powershell
npm run debug:win
```

9. Restart Premiere Pro.

## Other Install Locations

The recommended location is:

```text
%APPDATA%\Adobe\CEP\extensions\ClipForge
```

These can also work, but usually need administrator permission:

```text
C:\Program Files\Common Files\Adobe\CEP\extensions\ClipForge
C:\Program Files (x86)\Common Files\Adobe\CEP\extensions\ClipForge
```

Use the AppData location first.

## Troubleshooting

### ClipForge Does Not Show Up In Premiere Pro

Try these in order:

1. Restart Premiere Pro.
2. Check `Window > Extensions`.
3. Check `Window > Extensions Legacy`.
4. Run `npm run debug:win`.
5. Run `npm run install:win`.
6. Restart Premiere Pro again.

Also check that this file exists:

```text
%APPDATA%\Adobe\CEP\extensions\ClipForge\CSXS\manifest.xml
```

### Premiere Says The Extension Is Unsigned

Run:

```powershell
npm run debug:win
```

Then restart Premiere Pro.

### ffmpeg Not Found

ClipForge could not find `ffmpeg.exe` or `ffprobe.exe`.

First, open PowerShell and check:

```powershell
ffmpeg -version
ffprobe -version
```

If either command fails, ClipForge will not work yet.

Fix it with the easiest option:

```powershell
winget install Gyan.FFmpeg
```

Then close PowerShell, open it again, and check:

```powershell
ffmpeg -version
ffprobe -version
```

If you already downloaded ffmpeg, make sure the files are here:

```text
C:\ffmpeg\bin\ffmpeg.exe
C:\ffmpeg\bin\ffprobe.exe
```

The main rule is simple:

```text
ClipForge needs both ffmpeg.exe and ffprobe.exe.
```

If you only have `ffmpeg.exe`, it is not enough.

If your files are in a different folder, add that folder to your Windows `PATH`, or move/copy them to:

```text
C:\ffmpeg\bin
```

### No Clips Were Created

Check these things:

- Your input folder has videos in it.
- The videos are one of the supported formats.
- The videos are long enough.
- Your output folder exists or can be created.
- ffmpeg is installed correctly.

Very short videos may be skipped because ClipForge avoids the first and last `90` seconds by default.

### Import Into Premiere Failed

Make sure:

- ClipForge is open inside Premiere Pro.
- A Premiere Pro project is open.
- The generated clips still exist in the output folder.

### Paths With Spaces Are Not Working

Paths with spaces should work. For example:

```text
D:\Anime Clips\Input
C:\Users\YourName\Desktop\ClipForge Output
```

If a path fails, check that the folder actually exists and that Premiere Pro has permission to access it.

### Inno Setup Not Found

This only matters if you are building the installer.

Install Inno Setup 6:

```text
https://jrsoftware.org/isinfo.php
```

Then run:

```powershell
npm run installer:win
```

## Safety Notes

ClipForge only writes generated clips to the output folder you choose.

The uninstaller removes only the installed ClipForge extension folder:

```text
%APPDATA%\Adobe\CEP\extensions\ClipForge
```

It does not delete:

- your source videos
- your generated clips
- ffmpeg
- Premiere Pro projects
- unrelated Adobe folders

## License

MIT License. See [LICENSE](./LICENSE).
