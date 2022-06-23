import { CancellationToken, CodeLens, CodeLensProvider, commands, Disposable, DocumentLink, env, Hover, HoverProvider, languages, LocationLink, MarkdownString, Position, ProviderResult, Range, TextDocument, Uri, window } from "vscode";
import { RegExpProvider } from "../common/regexp_provider";
import { DART_MODE } from "../constant/constant";
import { getRangeText } from "../util/document";
import { getRange, getTextDocumentContent } from "../util/util";

const documentCommentPrefixSlash = '\n///';
const markDownCodeInDocumentComment = `${documentCommentPrefixSlash} \`\`\``;
const dartCodeRegExp = RegExp(`(?<=${markDownCodeInDocumentComment}dart)[^\`]*(?=${markDownCodeInDocumentComment})`, 'gmi');
const flutterExampleLinkRegExp = /(?<=\\*\\* See code in )\S+(?= \\*\\*)/gmi;

const COPY_TO_CLIPBOARD_COMMAND = 'copyToClipboard';

export class CommentaryExampleProvider extends RegExpProvider implements CodeLensProvider, HoverProvider {

  public disposables: Disposable[] = [];
  private flutterSdkPath: string = '';

  constructor() {
    super(flutterExampleLinkRegExp);
    this.disposables.push(
      languages.registerCodeLensProvider(DART_MODE, this),
      languages.registerHoverProvider(DART_MODE, this),
      languages.registerDocumentLinkProvider(DART_MODE, this),
      languages.registerDefinitionProvider(DART_MODE, this),
      commands.registerCommand(COPY_TO_CLIPBOARD_COMMAND, this.copyToClipboard),
    );
  }

  copyToClipboard(range: Range) {
    let text = getRangeCommentaryText(range);
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

  public async provideHover(document: TextDocument, position: Position, token: CancellationToken): Promise<Hover | undefined> {
    return (await super.provideHover(document, position, token)) ?? this.provideDartCodeHover(document, position);
  }
  
  public provideDartCodeHover(document: TextDocument, position: Position): Hover | undefined {
    let text = document.getText();
    let match: RegExpExecArray | null;
    dartCodeRegExp.lastIndex = -1;
    while (match = dartCodeRegExp.exec(text)) {
      let range = getRange(document, match.index, match[0].length);
      if (range.contains(position)) {
        let commentaryText = getRangeCommentaryText(range);
        return this.getCodeHover(commentaryText);
      }
    }
  }

  public async provideHoverByRegExpWord(document: TextDocument, range: Range, word: string): Promise<Hover | undefined> {
    let exampleContent = await getTextDocumentContent(this.getExampleUri(document, word))
    return this.getCodeHover(`\n${exampleContent}`);
  }

  private getCodeHover(code: string | undefined) {
    return new Hover(
      new MarkdownString(`\`\`\`dart${code}\n\`\`\`\``)
    );
  }

  public async provideDocumentLinkByRegExpRange(document: TextDocument, range: Range, rangeText: string): Promise<DocumentLink | undefined> {
    return new DocumentLink(range, this.getExampleUri(document, rangeText));
  }

  public async provideLocationLinksByRegExpWord(document: TextDocument, range: Range, word: string): Promise<LocationLink[] | undefined> {
    return [{
      originSelectionRange: range,
      targetRange: range,
      targetUri: this.getExampleUri(document, word),
      targetSelectionRange: new Range(new Position(0, 0), new Position(0, 0))
    } as LocationLink];
  }

  private getExampleUri(document: TextDocument, path: string): Uri {
    if (!this.flutterSdkPath) {
      this.flutterSdkPath = document.uri.path.split('packages/flutter')[0];
    }

    return Uri.file(`${this.flutterSdkPath}${path}`);
  }

  public dispose(): any {
    this.disposables.forEach((e) => e.dispose());
  }
}

export function getRangeCommentaryText(range: Range): string | undefined {
  return getRangeText(range)?.replace(RegExp(documentCommentPrefixSlash, 'gmi'), '\n');
}