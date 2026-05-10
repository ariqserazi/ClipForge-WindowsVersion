import fs from "node:fs"
import path from "node:path"
import { spawnSync } from "node:child_process"

const root = path.resolve(process.cwd())
const parent = path.dirname(root)
const projectName = path.basename(root)
const distDir = path.join(root, "dist")
const zipPath = path.join(distDir, `${projectName}.zip`)

fs.mkdirSync(distDir, { recursive: true })

fs.rmSync(zipPath, { force: true })

const exclusions = [
  "node_modules",
  ".git",
  "dist",
  "installer/output",
  ".DS_Store"
]

const command = process.platform === "win32" ? "powershell" : "zip"
const args = process.platform === "win32"
  ? [
      "-NoProfile",
      "-ExecutionPolicy",
      "Bypass",
      "-Command",
      [
        "$ErrorActionPreference = 'Stop'",
        `$source = '${path.join(parent, projectName).replaceAll("'", "''")}'`,
        `$destination = '${zipPath.replaceAll("'", "''")}'`,
        "$temp = Join-Path ([System.IO.Path]::GetTempPath()) ('clipforge-zip-' + [System.Guid]::NewGuid())",
        "New-Item -ItemType Directory -Path $temp | Out-Null",
        "Copy-Item -Path $source -Destination $temp -Recurse",
        `$copy = Join-Path $temp '${projectName.replaceAll("'", "''")}'`,
        exclusions.map((item) => `$remove = Join-Path $copy '${item.replaceAll("'", "''")}'; if (Test-Path $remove) { Remove-Item $remove -Recurse -Force }`).join("; "),
        "Compress-Archive -Path $copy -DestinationPath $destination -Force",
        "Remove-Item $temp -Recurse -Force"
      ].join("; ")
    ]
  : [
      "-r",
      zipPath,
      projectName,
      ...exclusions.flatMap((item) => ["-x", `${projectName}/${item}/*`, `${projectName}/${item}`])
    ]

const result = spawnSync(command, args, {
  cwd: parent,
  encoding: "utf8"
})

if (result.status !== 0) {
  throw new Error(result.stderr || result.stdout || "Could not create distributable zip.")
}

console.log(`Created ${zipPath}`)
