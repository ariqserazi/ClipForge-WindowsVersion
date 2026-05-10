function importFilesIntoProject(filePathsJson) {
  try {
    if (!app || !app.project) {
      return "ClipForge import error: Premiere Pro project is not available."
    }

    if (typeof filePathsJson !== "string" || !filePathsJson.length) {
      return "ClipForge import error: No file path payload was provided."
    }

    var parsed = JSON.parse(filePathsJson)
    if (!(parsed instanceof Array) || parsed.length === 0) {
      return "ClipForge import error: No files were provided for import."
    }

    var importableFiles = []
    var index

    for (index = 0; index < parsed.length; index += 1) {
      if (typeof parsed[index] === "string" && parsed[index].length) {
        importableFiles.push(parsed[index])
      }
    }

    if (importableFiles.length === 0) {
      return "ClipForge import error: The file list did not contain valid paths."
    }

    var imported = app.project.importFiles(importableFiles, true, app.project.rootItem, false)

    if (imported) {
      return "Imported " + importableFiles.length + " file(s) into the current Premiere project."
    }

    return "Premiere Pro did not confirm the import operation."
  } catch (error) {
    return "ClipForge import error: " + error.toString()
  }
}
