import fs from "node:fs"
import path from "node:path"
import { spawnSync } from "node:child_process"

const root = path.resolve(process.cwd())
const requiredFiles = [
  ".debug",
  ".gitignore",
  "CSXS/manifest.xml",
  "Install-ClipForge-Windows.bat",
  "assets/icons/icon-dark.svg",
  "assets/icons/icon-light.svg",
  "index.html",
  "installer/ClipForge.iss",
  "installer/README.md",
  "jsx/clipforge-host.jsx",
  "lib/CSInterface.js",
  "package.json",
  "README.md",
  "LICENSE",
  "scripts/build-installer-windows.ps1",
  "scripts/enable-cep-debug-windows.ps1",
  "scripts/install-windows.ps1",
  "scripts/setup-windows.ps1",
  "scripts/validate.mjs",
  "scripts/zip.mjs",
  "src/main.js",
  "src/styles.css"
]

for (const relativeFile of requiredFiles) {
  const absoluteFile = path.join(root, relativeFile)
  if (!fs.existsSync(absoluteFile)) {
    throw new Error(`Missing required file: ${relativeFile}`)
  }
}

const packageJson = JSON.parse(fs.readFileSync(path.join(root, "package.json"), "utf8"))
for (const scriptName of ["setup:win", "install:win", "debug:win", "installer:win", "validate", "zip"]) {
  if (!packageJson.scripts || !packageJson.scripts[scriptName]) {
    throw new Error(`package.json must include the ${scriptName} script.`)
  }
}

const manifestXml = fs.readFileSync(path.join(root, "CSXS/manifest.xml"), "utf8")
if (!manifestXml.includes("ClipForge")) {
  throw new Error("manifest.xml must contain the ClipForge extension name.")
}

if (!manifestXml.includes("--enable-nodejs")) {
  throw new Error("manifest.xml must enable Node with --enable-nodejs.")
}

const read = (relativeFile) => fs.readFileSync(path.join(root, relativeFile), "utf8")
const mainJs = read("src/main.js")
const readme = read("README.md")
const gitignore = read(".gitignore")
const hostJsx = read("jsx/clipforge-host.jsx")

if (!mainJs.includes("child_process")) {
  throw new Error("src/main.js must use Node child_process.")
}

if (!hostJsx.includes("importFiles")) {
  throw new Error("jsx/clipforge-host.jsx must contain an importFiles function.")
}

for (const needle of [
  "ffmpeg.exe",
  "ffprobe.exe",
  "C:\\\\ffmpeg\\\\bin\\\\ffmpeg.exe",
  "C:\\\\ffmpeg\\\\bin\\\\ffprobe.exe",
  "C:\\\\Program Files\\\\ffmpeg\\\\bin\\\\ffmpeg.exe",
  "C:\\\\Program Files\\\\ffmpeg\\\\bin\\\\ffprobe.exe",
  "C:\\\\Program Files (x86)\\\\ffmpeg\\\\bin\\\\ffmpeg.exe",
  "C:\\\\Program Files (x86)\\\\ffmpeg\\\\bin\\\\ffprobe.exe"
]) {
  if (!mainJs.includes(needle)) {
    throw new Error(`src/main.js must check for ${needle}.`)
  }
}

for (const needle of [
  "Windows-only",
  "Install-ClipForge-Windows.bat",
  "%APPDATA%\\Adobe\\CEP\\extensions\\ClipForge",
  "npm run debug:win",
  "npm run install:win",
  "npm run installer:win",
  "Window > Extensions",
  "Window > Extensions Legacy",
  "Inno Setup"
]) {
  if (!readme.includes(needle)) {
    throw new Error(`README.md is missing Windows documentation for: ${needle}`)
  }
}

for (const needle of ["dist/", "installer/output/", "*.exe"]) {
  if (!gitignore.includes(needle)) {
    throw new Error(`.gitignore must include ${needle}`)
  }
}

const productionFiles = [
  "README.md",
  "index.html",
  "CSXS/manifest.xml",
  "jsx/clipforge-host.jsx",
  "src/main.js",
  "src/styles.css",
  "package.json"
]

const forbiddenPatterns = [
  /\/Users\//,
  /\/Library\/Application Support\/Adobe\/CEP\/extensions/,
  /~\/Library\/Application Support\/Adobe\/CEP\/extensions/,
  /\/opt\/homebrew\/bin\/ffmpeg/,
  /\/opt\/homebrew\/bin\/ffprobe/,
  /\/usr\/local\/bin\/ffmpeg/,
  /\/usr\/local\/bin\/ffprobe/,
  new RegExp("\\b" + "Home" + "brew" + "\\b"),
  new RegExp("\\b" + "mac" + "OS" + "\\b")
]

for (const file of productionFiles) {
  const contents = read(file)
  for (const pattern of forbiddenPatterns) {
    if (pattern.test(contents)) {
      throw new Error(`${file} contains forbidden source-platform text matching ${pattern}.`)
    }
  }
}

for (const file of [
  "scripts/validate.mjs",
  "scripts/zip.mjs",
  "lib/CSInterface.js",
  "src/main.js"
]) {
  const result = spawnSync(process.execPath, ["--check", path.join(root, file)], {
    encoding: "utf8"
  })

  if (result.status !== 0) {
    throw new Error(`Syntax check failed for ${file}\n${result.stderr}`)
  }
}

console.log("ClipForge-Windows validation passed.")
