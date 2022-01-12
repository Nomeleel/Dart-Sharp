import { CancellationToken, CodeLens, CodeLensProvider, commands, Disposable, env, languages, ProviderResult, Range, TextDocument, window } from "vscode";
import { DART_MODE } from "../constant/constant";
import { getRangeText } from "../util/document";
import { getRange } from "../util/util";

const documentCommentPrefixSlash = '\n/// ';
const markDownCodeInDocumentComment = `${documentCommentPrefixSlash}\`\`\``;
const dartCodeRegExp = RegExp(`(?<=${markDownCodeInDocumentComment}dart)[^\`]*(?=${markDownCodeInDocumentComment})`, 'gmi');

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
    let text = getRangeText(range)?.replace(RegExp(documentCommentPrefixSlash, 'gmi'), '\n');
    if (text) {
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
      // TODO(Nomeleel): 添加分割线 形成区域  
      // TODO(Nomeleel): 代码特殊化显示 区别于真正的注释
      codeLensList.push(
        new CodeLens(
          range,
          {
            title: 'Copy Example Code',
            tooltip: 'Copy Example Code',
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