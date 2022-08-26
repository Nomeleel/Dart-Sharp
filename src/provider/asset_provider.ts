import * as path from "path";
import { CancellationToken, DefinitionProvider, Disposable, DocumentLink, DocumentLinkProvider, Hover, HoverProvider, languages, LocationLink, MarkdownString, Position, Range, TextDocument, Uri, workspace } from "vscode";
import { RegExpProvider } from "../common/regexp_provider";
import { DART_MODE } from "../constant/constant";

const mdAssetExtension = 'jpg|jpeg|png|gif|gif|svg';
const assetExtension = `(${mdAssetExtension}|webp|svga|json)`;
const assetRegExp = new RegExp(`(?<=["'])[^\\s:]+\\.${assetExtension}(?=["'])`, 'gmi');
const netAssetRegExp = new RegExp(`(?<=["'])https?://[^\\s:]+\\.(${mdAssetExtension})(?=["'])`, 'gmi');
const matchAll = '**/';

export class AssetProvider extends RegExpProvider implements DefinitionProvider, HoverProvider, DocumentLinkProvider, Disposable {
  public disposables: Disposable[] = [];

  constructor() {
    super(assetRegExp);
    this.disposables.push(
      languages.registerDefinitionProvider(DART_MODE, this),
      languages.registerHoverProvider(DART_MODE, this),
      languages.registerDocumentLinkProvider(DART_MODE, this),
    );
  }

  public async provideDocumentLinkByRegExpRange(document: TextDocument, range: Range, rangeText: string): Promise<DocumentLink | undefined> {
    let findFiles = await this.findFiles(rangeText);
    if (findFiles.length > 0) {
      return new DocumentLink(range, findFiles[0]);
    }
  }

  public async provideLocationLinksByRegExpWord(document: TextDocument, range: Range, word: string): Promise<LocationLink[] | undefined> {
    let uris = await this.findFiles(word);;
    if (uris) {
      return uris.map((uri) => {
        return {
          originSelectionRange: range,
          targetRange: range,
          targetUri: uri,
          targetSelectionRange: new Range(new Position(0, 0), new Position(0, 0))
        } as LocationLink
      });
    }
  }

  public async provideHover(document: TextDocument, position: Position, token: CancellationToken): Promise<Hover | undefined> {
    return (await super.provideHover(document, position, token)) ?? this.provideNetAssetHover(document, position);
  }

  public provideNetAssetHover(document: TextDocument, position: Position): Hover | undefined {
    let pathText = this.getWordAtPosition(document, position, netAssetRegExp);
    if (pathText) {
      return new Hover(new MarkdownString(`![${pathText}](${pathText})`, true));
    }
  }

  public async provideHoverByRegExpWord(document: TextDocument, range: Range, word: string): Promise<Hover | undefined> {
    let uris = await this.findFiles(word);
    if (uris) {
      return new Hover(
        uris.map((uri) => {
          let supportMD = mdAssetExtension.includes(path.parse(uri.path).ext.substr(1));
          let desc = supportMD ? uri.path : '😂 😂 😂 暂时不支持预览呦～😂 😂 😂';
          return new MarkdownString(`![${desc}](${uri.path})`, true);
        })
      );
    }
  }

  public async provideDocumentLinks2(document: TextDocument, token: CancellationToken): Promise<DocumentLink[] | undefined> {
    let links: DocumentLink[] = [];
    for (let line = 0; line < document.lineCount; line++) {
      let textLine = document.lineAt(line);
      // TODO 不支持跨行匹配
      let matchArray = textLine.text.match(assetRegExp);
      if (matchArray) {
        let indexOfStart = 0;
        for await (const match of matchArray) {
          let findFiles = await this.findFiles(match);
          if (findFiles.length > 0) {
            let index = textLine.text.indexOf(match, indexOfStart);
            indexOfStart = index + match.length;
            links.push(
              new DocumentLink(new Range(new Position(line, index), new Position(line, indexOfStart)), findFiles[0])
            )
          }
        }
      }
    }
    return links;
  }

  private async findFiles(pathText: string): Promise<Array<Uri>> {
    // 考虑**/**/3×/abc.png
    let splitIndex = pathText.lastIndexOf('/') + 1;
    let pathDir = pathText.substring(0, splitIndex);
    let searchDir = pathDir ? `${matchAll}${pathDir}${matchAll}` : matchAll;
    let searchPath = `${searchDir}${pathText.substring(splitIndex)}`;
    // TODO(Nomeleel): 应该只对项目资源文件夹内进行搜索 排除build产物中的资源文件
    return workspace.findFiles(searchPath, 'build');
  }

  public dispose() {
    this.disposables.forEach(e => e.dispose());
  }
}