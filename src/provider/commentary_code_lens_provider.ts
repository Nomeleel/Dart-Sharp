import { CancellationToken, CodeLens, CodeLensProvider, commands, Disposable, env, languages, ProviderResult, Range, TextDocument, window } from "vscode";
import { DART_MODE } from "../constant/constant";
import { getRangeText } from "../util/document";
import { getRange } from "../util/util";

const dartCodeRegExp = /(?<=\/\/\/ ```dart\n)[^`]*(?=\n\/\/\/ ```)/gmi;
const COPY_TO_CLIPBOARD_COMMAND = 'copyToClipboard';

export class CommentaryCodeLensProvider implements CodeLensProvider {

  public disposables: Disposable[] = [];

  constructor() {
    this.disposables.push(
      languages.registerCodeLensProvider(DART_MODE, this),
      commands.registerCommand(COPY_TO_CLIPBOARD_COMMAND, this.copyToClipboard),
    );
  }

  copyToClipboard(range: Range) {
    let text = getRangeText(range);
    if (text) {
      // todo: 删除///
      env.clipboard.writeText(text);
      window.showInformationMessage('😊 😊 😊已复制到剪切板📋😊 😊 😊');
    }
  }

  provideCodeLenses(document: TextDocument, token: CancellationToken): ProviderResult<CodeLens[]> {
    let codeLensList: CodeLens[] = [];
    let text = document.getText();
    let match: RegExpExecArray | null;
    dartCodeRegExp.lastIndex = -1;
    while (match = dartCodeRegExp.exec(text)) {
      let range = getRange(document, match.index, match[0].length);
      codeLensList.push(
        new CodeLens(
          range.with(range.start.translate(-1)),
          {
            title: 'Copy Code',
            tooltip: 'Copy Code',
            command: COPY_TO_CLIPBOARD_COMMAND,
            arguments: [range],
          }
        )
      );
    }

    return codeLensList;
  }

  public dispose(): any {
    this.disposables.forEach((e) => e.dispose());
  }
}