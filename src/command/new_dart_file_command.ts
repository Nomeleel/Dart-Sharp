import { existsSync, statSync, writeFileSync } from "fs";
import { commands, InputBoxOptions, Uri, window, workspace } from "vscode";
import { DisposableBase } from "../common/disposable_base";
import { ADD_DART_FILE_COMMAND } from "../constant/constant";
import { openTextDocument } from "../util/util";

export class NewDartFileCommand extends DisposableBase {

  constructor() {
    super();
    this.disposables.push(
      commands.registerCommand(ADD_DART_FILE_COMMAND, NewDartFileCommand.newDartFile, this),
    );
  }

  static async newDartFile(uri: Uri) {
    let dir = currentFileDir(uri);
    if (dir) {
      let fileName = window.activeTextEditor?.document.getText(window.activeTextEditor?.selection);
      if (!fileName) fileName = await inputDartFileName();
      if (fileName) {
        let filePath = Uri.joinPath(dir, `${snakeCase(fileName)}.dart`).fsPath;
        if (!existsSync(filePath)) {
          writeFileSync(filePath, '');
          openTextDocument(filePath);
        } else {
          window.showErrorMessage('😭😭😭文件已存在😭😭😭');
        }
      }
    } else {
      window.showErrorMessage('404');
    }
  }
}

function currentFileDir(uri: Uri): Uri | undefined {
  if (uri) {
    if (statSync(uri.fsPath).isFile()) uri = Uri.joinPath(uri, '../');
    return uri;
  } else return workspace.workspaceFolders?.[0].uri;
}

function inputDartFileName(): Thenable<string | undefined> {
  const inputBoxOptions: InputBoxOptions = {
    prompt: "Dart File Name",
    placeHolder: "Will auto convert to snake_case style",
  };
  return window.showInputBox(inputBoxOptions);
}

function snakeCase(str: string): string {
  return str.replace(/[A-Z]/gm, (match, offset) => {
    let lowerCase = match.toLowerCase();
    return offset == 0 ? lowerCase : `_${lowerCase}`;
  })
}