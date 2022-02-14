import { CancellationToken, CodeLens, CodeLensProvider, commands, Disposable, env, Hover, HoverProvider, languages, MarkdownString, Position, ProviderResult, Range, TextDocument, window } from "vscode";
import { DART_MODE } from "../constant/constant";
import { getRangeText } from "../util/document";
import { getRange } from "../util/util";

const documentCommentPrefixSlash = '\n/// ';
const markDownCodeInDocumentComment = `${documentCommentPrefixSlash}\`\`\``;
const dartCodeRegExp = RegExp(`(?<=${markDownCodeInDocumentComment}dart)[^\`]*(?=${markDownCodeInDocumentComment})`, 'gmi');

const COPY_TO_CLIPBOARD_COMMAND = 'copyToClipboard';

export class CommentaryCodeLensProvider implements CodeLensProvider, HoverProvider {

  public disposables: Disposable[] = [];

  constructor() {
    this.disposables.push(
      languages.registerCodeLensProvider(DART_MODE, this),
      languages.registerHoverProvider(DART_MODE, this),
      commands.registerCommand(COPY_TO_CLIPBOARD_COMMAND, this.copyToClipboard),
    );
  }

  copyToClipboard(range: Range) {
    let text = this.getRangeCommentaryText(range);
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
 
      // TODO(Nomeleel): 代码特殊化显示 区别于真正的注释
      window.activeTextEditor?.setDecorations(
        window.createTextEditorDecorationType({
          isWholeLine: true,
          backgroundColor: '#171717',
          fontStyle: 'oblique',
          cursor: 'pointer'
        }),
        [new Range(range.start, range.end.translate(1))],
      );

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

  provideHover(document: TextDocument, position: Position, token: CancellationToken): ProviderResult<Hover> {
    let text = document.getText();
    let match: RegExpExecArray | null;
    dartCodeRegExp.lastIndex = -1;
    while (match = dartCodeRegExp.exec(text)) {
      let range = getRange(document, match.index, match[0].length);
      if (range.contains(position)) {
        let commentaryText = this.getRangeCommentaryText(range);
        return new Hover(
          new MarkdownString(`\`\`\`dart${commentaryText}\n\`\`\`\``)
        );
      }
    }
  }

  private getRangeCommentaryText(range: Range): string | undefined {
    return getRangeText(range)?.replace(RegExp(documentCommentPrefixSlash, 'gmi'), '\n');
  }

  public dispose(): any {
    this.disposables.forEach((e) => e.dispose());
  }
}