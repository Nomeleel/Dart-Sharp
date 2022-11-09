import { commands, env, Range, TextDocument, window } from "vscode";
import { DisposableBase } from "../common/disposable_base";
import { COPY_COMMENTARY_COMMAND } from "../constant/constant";
import { getRangeText } from "../util/document";

export const documentCommentPrefixSlash = '\n/// ';

export class CopyCommentaryCommand extends DisposableBase {
  constructor() {
    super();
    this.disposables.push(
      commands.registerCommand(COPY_COMMENTARY_COMMAND, copyToClipboard),
    );
  }
}

function copyToClipboard(document?: TextDocument, range?: Range, shrink = true) {
  let text = getRangeCommentaryText(range, shrink);
  if (text) {
    env.clipboard.writeText(text);
    window.showInformationMessage('😊 😊 😊已复制到剪切板📋😊 😊 😊');
  }
}

export function getRangeCommentaryText(range?: Range, shrink = true): string | undefined {
  return getRangeText(range)?.replace(RegExp(documentCommentPrefixSlash, 'gmi'), shrink ? '' : '\n');
}
