#define MyAppName "ClipForge"
#define MyAppVersion "1.0.0"
#define MyAppPublisher "ClipForge"

[Setup]
AppId={{9A6ED75E-8B8E-4F03-9F34-4F7F0798515A}
AppName={#MyAppName}
AppVersion={#MyAppVersion}
AppPublisher={#MyAppPublisher}
DefaultDirName={userappdata}\Adobe\CEP\extensions\ClipForge
DisableProgramGroupPage=yes
OutputDir=..\dist
OutputBaseFilename=ClipForge-Windows-Setup
Compression=lzma
SolidCompression=yes
WizardStyle=modern
PrivilegesRequired=lowest
UninstallDisplayName=ClipForge
UninstallFilesDir={app}\.uninstall

[Languages]
Name: "english"; MessagesFile: "compiler:Default.isl"

[Tasks]
Name: "enablecepdebug"; Description: "Enable unsigned CEP extension debug mode for this Windows user"; GroupDescription: "Adobe Premiere Pro CEP:"; Flags: checkedonce

[Files]
Source: "..\.debug"; DestDir: "{app}"; Flags: ignoreversion
Source: "..\CSXS\*"; DestDir: "{app}\CSXS"; Flags: ignoreversion recursesubdirs createallsubdirs
Source: "..\assets\*"; DestDir: "{app}\assets"; Flags: ignoreversion recursesubdirs createallsubdirs
Source: "..\index.html"; DestDir: "{app}"; Flags: ignoreversion
Source: "..\jsx\*"; DestDir: "{app}\jsx"; Flags: ignoreversion recursesubdirs createallsubdirs
Source: "..\lib\*"; DestDir: "{app}\lib"; Flags: ignoreversion recursesubdirs createallsubdirs
Source: "..\src\*"; DestDir: "{app}\src"; Flags: ignoreversion recursesubdirs createallsubdirs

[Registry]
Root: HKCU; Subkey: "Software\Adobe\CSXS.11"; ValueType: string; ValueName: "PlayerDebugMode"; ValueData: "1"; Flags: uninsneveruninstall; Tasks: enablecepdebug
Root: HKCU; Subkey: "Software\Adobe\CSXS.12"; ValueType: string; ValueName: "PlayerDebugMode"; ValueData: "1"; Flags: uninsneveruninstall; Tasks: enablecepdebug
Root: HKCU; Subkey: "Software\Adobe\CSXS.13"; ValueType: string; ValueName: "PlayerDebugMode"; ValueData: "1"; Flags: uninsneveruninstall; Tasks: enablecepdebug

[UninstallDelete]
Type: filesandordirs; Name: "{app}"

[Code]
procedure CurStepChanged(CurStep: TSetupStep);
begin
  if CurStep = ssPostInstall then
  begin
    MsgBox('ClipForge has been installed. Restart Adobe Premiere Pro, then open ClipForge from Window > Extensions or Window > Extensions Legacy.', mbInformation, MB_OK);
  end;
end;
