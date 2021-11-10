import * as fs from "fs";
import * as path from "path";
import { Uri } from "vscode";

export function isAnalyzable(
  file: { uri: Uri, isUntitled?: boolean, languageId?: string },
  analyzableLanguages: Array<String>,
  analyzableFileExtensions: Array<String>,
): boolean {
  if (file.isUntitled || !fsPath(file.uri) || file.uri.scheme !== "file") {
    return false;
  }

  const extName = path.extname(fsPath(file.uri));
  const extension = extName ? extName.substr(1) : undefined;

  return (file.languageId && analyzableLanguages.indexOf(file.languageId) >= 0)
    || (extension !== undefined && analyzableFileExtensions.includes(extension));
}

export function fsPath(uri: { fsPath: string } | string) {
  // tslint:disable-next-line:disallow-fspath
  return forceWindowsDriveLetterToUppercase(typeof uri === "string" ? uri : uri.fsPath);
}

export function forceWindowsDriveLetterToUppercase(p: string): string {
  if (p && isWin && path.isAbsolute(p) && p.charAt(0) === p.charAt(0).toLowerCase()) {
    p = p.substr(0, 1).toUpperCase() + p.substr(1);
  }

  return p;
}

export const isWin = /^win/.test(process.platform);

/// Path

export function mkDirRecursive(folder: string) {
  const parent = path.dirname(folder);
  if (!fs.existsSync(parent)) {
    mkDirRecursive(parent);
  }

  if (!fs.existsSync(folder)) {
    fs.mkdirSync(folder);
  }
}