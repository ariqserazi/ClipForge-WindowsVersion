(function () {
  "use strict"

  var childProcess = require("child_process")
  var fs = require("fs")
  var path = require("path")

  var execFile = childProcess.execFile
  var spawnSync = childProcess.spawnSync

  var DEFAULT_SETTINGS = {
    inputFolder: "",
    outputFolder: "",
    clipCount: 30,
    clipLength: 6,
    skipFirstSeconds: 90,
    skipLastSeconds: 90
  }

  var SUPPORTED_EXTENSIONS = {
    ".mp4": true,
    ".mkv": true,
    ".mov": true,
    ".avi": true,
    ".m4v": true
  }

  var TOOL_HINT = [
    "ffmpeg and ffprobe are required.",
    "Install ffmpeg for Windows, add its bin folder to PATH, or install it at C:\\ffmpeg\\bin.",
    "Expected tools: ffmpeg.exe and ffprobe.exe"
  ].join("\n")
  var STORAGE_KEY = "clipforge.settings"

  var appState = {
    csInterface: null,
    ffmpegPath: "",
    ffprobePath: "",
    isGenerating: false,
    lastGeneratedFiles: []
  }

  var dom = {}

  function init() {
    appState.csInterface = typeof window.CSInterface === "function" ? new window.CSInterface() : null

    cacheDom()
    loadSavedSettings()
    bindEvents()
    setStatus("Ready")
    log("ClipForge ready.")
    log("This panel generates random silent H.264 broll clips from local source videos.")
    checkDependencies(false)
  }

  function cacheDom() {
    dom.inputFolder = document.getElementById("inputFolder")
    dom.outputFolder = document.getElementById("outputFolder")
    dom.clipCount = document.getElementById("clipCount")
    dom.clipLength = document.getElementById("clipLength")
    dom.skipFirstSeconds = document.getElementById("skipFirstSeconds")
    dom.skipLastSeconds = document.getElementById("skipLastSeconds")
    dom.generateButton = document.getElementById("generateButton")
    dom.importButton = document.getElementById("importButton")
    dom.clearLogButton = document.getElementById("clearLogButton")
    dom.status = document.getElementById("statusText")
    dom.log = document.getElementById("logOutput")
    dom.inputBrowseButton = document.getElementById("inputBrowseButton")
    dom.outputBrowseButton = document.getElementById("outputBrowseButton")
  }

  function bindEvents() {
    dom.generateButton.addEventListener("click", generateClips)
    dom.importButton.addEventListener("click", importGeneratedClips)
    dom.clearLogButton.addEventListener("click", clearLog)
    dom.inputBrowseButton.addEventListener("click", function () {
      browseForFolder("inputFolder")
    })
    dom.outputBrowseButton.addEventListener("click", function () {
      browseForFolder("outputFolder")
    })

    ;[
      dom.inputFolder,
      dom.outputFolder,
      dom.clipCount,
      dom.clipLength,
      dom.skipFirstSeconds,
      dom.skipLastSeconds
    ].forEach(function (element) {
      element.addEventListener("change", persistSettings)
      element.addEventListener("input", persistSettings)
    })
  }

  function browseForFolder(fieldName) {
    if (!window.cep || !window.cep.fs || typeof window.cep.fs.showOpenDialogEx !== "function") {
      log("Folder chooser is unavailable in this environment. Enter the path manually.")
      return
    }

    var currentValue = fieldName === "inputFolder" ? dom.inputFolder.value : dom.outputFolder.value
    var result = window.cep.fs.showOpenDialogEx(false, true, "Select a folder", currentValue || "")

    if (result && result.data && result.data.length) {
      if (fieldName === "inputFolder") {
        dom.inputFolder.value = result.data[0]
      } else {
        dom.outputFolder.value = result.data[0]
      }

      persistSettings()
    }
  }

  function loadSavedSettings() {
    var savedSettings = null

    try {
      savedSettings = JSON.parse(window.localStorage.getItem(STORAGE_KEY) || "null")
    } catch (error) {
      savedSettings = null
    }

    var merged = {
      inputFolder: savedSettings && savedSettings.inputFolder ? savedSettings.inputFolder : DEFAULT_SETTINGS.inputFolder,
      outputFolder: savedSettings && savedSettings.outputFolder ? savedSettings.outputFolder : DEFAULT_SETTINGS.outputFolder,
      clipCount: savedSettings && savedSettings.clipCount ? savedSettings.clipCount : DEFAULT_SETTINGS.clipCount,
      clipLength: savedSettings && savedSettings.clipLength ? savedSettings.clipLength : DEFAULT_SETTINGS.clipLength,
      skipFirstSeconds: savedSettings && savedSettings.skipFirstSeconds >= 0 ? savedSettings.skipFirstSeconds : DEFAULT_SETTINGS.skipFirstSeconds,
      skipLastSeconds: savedSettings && savedSettings.skipLastSeconds >= 0 ? savedSettings.skipLastSeconds : DEFAULT_SETTINGS.skipLastSeconds
    }

    dom.inputFolder.value = merged.inputFolder
    dom.outputFolder.value = merged.outputFolder
    dom.clipCount.value = merged.clipCount
    dom.clipLength.value = merged.clipLength
    dom.skipFirstSeconds.value = merged.skipFirstSeconds
    dom.skipLastSeconds.value = merged.skipLastSeconds
  }

  function persistSettings() {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(getSettings()))
    } catch (error) {
      log("Could not save panel settings: " + error.message)
    }
  }

  function log(message) {
    var line = document.createElement("div")
    var timestamp = new Date().toLocaleTimeString()
    line.className = "log-line"
    line.textContent = "[" + timestamp + "] " + String(message)
    dom.log.appendChild(line)
    dom.log.scrollTop = dom.log.scrollHeight
  }

  function setStatus(message) {
    dom.status.textContent = message
  }

  function getSettings() {
    return {
      inputFolder: String(dom.inputFolder.value || "").trim(),
      outputFolder: String(dom.outputFolder.value || "").trim(),
      clipCount: Number(dom.clipCount.value),
      clipLength: Number(dom.clipLength.value),
      skipFirstSeconds: Number(dom.skipFirstSeconds.value),
      skipLastSeconds: Number(dom.skipLastSeconds.value)
    }
  }

  function validateSettings(settings) {
    if (!settings.inputFolder) {
      throw new Error("Input folder is required.")
    }

    if (!settings.outputFolder) {
      throw new Error("Output folder is required.")
    }

    if (!Number.isInteger(settings.clipCount) || settings.clipCount <= 0) {
      throw new Error("Clip count must be a positive whole number.")
    }

    if (!Number.isFinite(settings.clipLength) || settings.clipLength <= 0) {
      throw new Error("Clip length must be greater than 0.")
    }

    if (!Number.isFinite(settings.skipFirstSeconds) || settings.skipFirstSeconds < 0) {
      throw new Error("Skip first seconds must be 0 or greater.")
    }

    if (!Number.isFinite(settings.skipLastSeconds) || settings.skipLastSeconds < 0) {
      throw new Error("Skip last seconds must be 0 or greater.")
    }

    if (!fs.existsSync(settings.inputFolder) || !fs.statSync(settings.inputFolder).isDirectory()) {
      throw new Error("Input folder does not exist: " + settings.inputFolder)
    }

    return settings
  }

  function ensureOutputFolder(outputFolder) {
    if (!fs.existsSync(outputFolder)) {
      fs.mkdirSync(outputFolder, { recursive: true })
      log("Created output folder:")
      log(outputFolder)
      return
    }

    if (!fs.statSync(outputFolder).isDirectory()) {
      throw new Error("Output path is not a folder: " + outputFolder)
    }
  }

  function findVideoFiles(inputFolder) {
    var entries = fs.readdirSync(inputFolder, { withFileTypes: true })
    var outputFolder = dom.outputFolder ? String(dom.outputFolder.value || "").trim() : ""
    var inputFolderResolved = path.resolve(inputFolder)
    var outputFolderResolved = outputFolder ? path.resolve(outputFolder) : ""

    return entries
      .filter(function (entry) {
        if (!entry.isFile()) {
          return false
        }

        if (
          outputFolderResolved &&
          inputFolderResolved === outputFolderResolved &&
          /^broll_\d{4}\.mp4$/i.test(entry.name)
        ) {
          return false
        }

        var extension = path.extname(entry.name).toLowerCase()
        return Boolean(SUPPORTED_EXTENSIONS[extension])
      })
      .map(function (entry) {
        return path.join(inputFolder, entry.name)
      })
      .sort()
  }

  function getVideoDuration(filePath) {
    return new Promise(function (resolve, reject) {
      execFile(appState.ffprobePath, [
        "-v",
        "error",
        "-show_entries",
        "format=duration",
        "-of",
        "default=nokey=1:noprint_wrappers=1",
        filePath
      ], {
        cwd: process.cwd(),
        encoding: "utf8",
        env: buildToolEnv(),
        maxBuffer: 1024 * 1024
      }, function (error, stdout, stderr) {
        if (error) {
          reject(new Error(stderr || error.message))
          return
        }

        var rawDuration = String(stdout || "").trim()
        var duration = Number(rawDuration)

        if (!rawDuration || !Number.isFinite(duration)) {
          resolve(null)
          return
        }

        resolve(duration)
      })
    })
  }

  async function generateRandomClip(settings, index, sourceFiles) {
    var randomIndex = Math.floor(Math.random() * sourceFiles.length)
    var sourcePath = sourceFiles[randomIndex]
    var durationRaw = await getVideoDuration(sourcePath)
    var duration = durationRaw === null ? null : Math.floor(durationRaw)
    var minStart = settings.skipFirstSeconds
    var maxStart
    var start
    var outputName
    var outputPath

    if (duration === null) {
      log("Could not read duration. Skipping:")
      log(sourcePath)
      return null
    }

    maxStart = duration - settings.clipLength - settings.skipLastSeconds

    if (maxStart <= minStart) {
      log("Video too short. Skipping:")
      log(sourcePath)
      return null
    }

    start = Math.floor(Math.random() * (maxStart - minStart + 1)) + minStart
    outputName = "broll_" + String(index).padStart(4, "0") + ".mp4"
    outputPath = path.join(settings.outputFolder, outputName)

    if (fs.existsSync(outputPath)) {
      log("Overwriting existing output because ffmpeg is running with -y:")
      log(outputPath)
    }

    log("Creating " + outputName + " from " + path.basename(sourcePath) + " at " + start + " seconds...")

    await runFfmpeg([
      "-y",
      "-hide_banner",
      "-loglevel",
      "error",
      "-ss",
      String(start),
      "-i",
      sourcePath,
      "-t",
      String(settings.clipLength),
      "-an",
      "-c:v",
      "libx264",
      "-preset",
      "veryfast",
      "-crf",
      "20",
      outputPath
    ])

    return outputPath
  }

  async function generateClips() {
    if (appState.isGenerating) {
      return
    }

    var settings
    var sourceFiles
    var generatedFiles = []
    var index

    try {
      setGeneratingState(true)
      settings = validateSettings(getSettings())
      persistSettings()
      ensureDependencies()
      ensureOutputFolder(settings.outputFolder)
      sourceFiles = findVideoFiles(settings.inputFolder)

      if (!sourceFiles.length) {
        throw new Error("No video files found in:\n" + settings.inputFolder)
      }

      log("Found " + sourceFiles.length + " video file(s). Making clips...")
      log("Input folder:")
      log(settings.inputFolder)
      log("")
      log("Saving clips to:")
      log(settings.outputFolder)
      log("")

      for (index = 1; index <= settings.clipCount; index += 1) {
        setStatus("Generating clip " + index + " of " + settings.clipCount + "...")

        try {
          var generatedPath = await generateRandomClip(settings, index, sourceFiles)
          if (generatedPath) {
            generatedFiles.push(generatedPath)
          }
        } catch (clipError) {
          log("ffmpeg failed while creating broll_" + String(index).padStart(4, "0") + ".mp4:")
          log(clipError.message)
        }
      }

      appState.lastGeneratedFiles = generatedFiles.slice()

      log("")
      log("Done. Clips saved here:")
      log(settings.outputFolder)
      setStatus("Finished. Created " + generatedFiles.length + " clip(s).")
    } catch (error) {
      setStatus("Generation failed")
      log(error.message)
    } finally {
      setGeneratingState(false)
    }
  }

  function importGeneratedClips() {
    var outputFolder
    var filesToImport
    var script

    try {
      outputFolder = String(dom.outputFolder.value || "").trim()

      if (!outputFolder) {
        throw new Error("Output folder is required to import generated clips.")
      }

      filesToImport = appState.lastGeneratedFiles.length ? appState.lastGeneratedFiles.slice() : scanGeneratedClips(outputFolder)

      if (!filesToImport.length) {
        throw new Error("No generated clips were found to import.")
      }

      if (!appState.csInterface) {
        throw new Error("CSInterface is unavailable. Open this panel inside Premiere Pro to import clips.")
      }

      log("Sending " + filesToImport.length + " generated clip(s) to Premiere Pro...")
      setStatus("Importing clips into Premiere Pro...")
      script = "importFilesIntoProject(" + JSON.stringify(JSON.stringify(filesToImport)) + ")"

      appState.csInterface.evalScript(script, function (result) {
        var message = result || "No response from Premiere Pro."
        log(message)

        if (String(message).toLowerCase().indexOf("error") !== -1) {
          setStatus("Import failed")
          return
        }

        appState.lastGeneratedFiles = filesToImport.slice()
        setStatus("Import complete")
      })
    } catch (error) {
      setStatus("Import failed")
      log(error.message)
    }
  }

  function clearLog() {
    dom.log.innerHTML = ""
    setStatus("Log cleared")
  }

  function scanGeneratedClips(outputFolder) {
    if (!fs.existsSync(outputFolder) || !fs.statSync(outputFolder).isDirectory()) {
      return []
    }

    return fs.readdirSync(outputFolder, { withFileTypes: true })
      .filter(function (entry) {
        return entry.isFile() && /^broll_\d{4}\.mp4$/i.test(entry.name)
      })
      .map(function (entry) {
        return path.join(outputFolder, entry.name)
      })
      .sort()
  }

  function buildToolEnv() {
    var env = {}
    var key

    for (key in process.env) {
      if (Object.prototype.hasOwnProperty.call(process.env, key)) {
        env[key] = process.env[key]
      }
    }

    return env
  }

  function resolveToolPath(commandName, absoluteCandidates) {
    var candidates = [commandName].concat(absoluteCandidates)
    var index

    for (index = 0; index < candidates.length; index += 1) {
      var candidate = candidates[index]
      var result = spawnSync(candidate, ["-version"], {
        cwd: process.cwd(),
        env: buildToolEnv(),
        encoding: "utf8"
      })

      if (!result.error && result.status === 0) {
        return candidate
      }
    }

    return ""
  }

  function checkDependencies(showSuccessLog) {
    var ffmpegPath = resolveToolPath("ffmpeg.exe", [
      "C:\\ffmpeg\\bin\\ffmpeg.exe",
      "C:\\Program Files\\ffmpeg\\bin\\ffmpeg.exe",
      "C:\\Program Files (x86)\\ffmpeg\\bin\\ffmpeg.exe"
    ])
    var ffprobePath = resolveToolPath("ffprobe.exe", [
      "C:\\ffmpeg\\bin\\ffprobe.exe",
      "C:\\Program Files\\ffmpeg\\bin\\ffprobe.exe",
      "C:\\Program Files (x86)\\ffmpeg\\bin\\ffprobe.exe"
    ])

    appState.ffmpegPath = ffmpegPath
    appState.ffprobePath = ffprobePath

    if (!ffmpegPath || !ffprobePath) {
      log("ffmpeg or ffprobe could not be found.")
      log(TOOL_HINT)
      return false
    }

    if (showSuccessLog) {
      log("Using ffmpeg: " + ffmpegPath)
      log("Using ffprobe: " + ffprobePath)
    }

    return true
  }

  function ensureDependencies() {
    if (appState.ffmpegPath && appState.ffprobePath) {
      return
    }

    if (!checkDependencies(true)) {
      throw new Error("ffmpeg and ffprobe are required.\n" + TOOL_HINT)
    }
  }

  function runFfmpeg(args) {
    return new Promise(function (resolve, reject) {
      execFile(appState.ffmpegPath, args, {
        cwd: process.cwd(),
        encoding: "utf8",
        env: buildToolEnv(),
        maxBuffer: 1024 * 1024 * 10
      }, function (error, stdout, stderr) {
        if (error) {
          reject(new Error((stderr || stdout || error.message).trim()))
          return
        }

        resolve()
      })
    })
  }

  function setGeneratingState(isGenerating) {
    appState.isGenerating = isGenerating
    dom.generateButton.disabled = isGenerating
    dom.importButton.disabled = isGenerating
    dom.inputBrowseButton.disabled = isGenerating
    dom.outputBrowseButton.disabled = isGenerating
  }

  document.addEventListener("DOMContentLoaded", init)
  window.ClipForgeApp = {
    init: init,
    log: log,
    setStatus: setStatus,
    getSettings: getSettings,
    validateSettings: validateSettings,
    ensureOutputFolder: ensureOutputFolder,
    findVideoFiles: findVideoFiles,
    getVideoDuration: getVideoDuration,
    generateRandomClip: generateRandomClip,
    generateClips: generateClips,
    importGeneratedClips: importGeneratedClips,
    clearLog: clearLog
  }
})()
