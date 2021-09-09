import * as path from "path";
import { CancellationToken, DefinitionProvider, Disposable, DocumentLink, DocumentLinkProvider, Hover, HoverProvider, languages, LocationLink, MarkdownString, Position, Range, TextDocument, Uri, workspace } from "vscode";
import { DART_MODE } from "../constant/constant";
import { getRange } from "../util/util";

const mdAssetExtension = 'jpg|jpeg|png|gif|gif|svg';
const assetExtension = `(${mdAssetExtension}|webp|svga|json)`;
const assetRegExp = new RegExp(`(?<=["'])[^\\s:]+\\.${assetExtension}(?=["'])`, 'gmi');
const netAssetRegExp = new RegExp(`(?<=["'])https?://[^\\s:]+\\.(${mdAssetExtension})(?=["'])`, 'gmi');
const matchAll = '**/';

export class AssetProvider implements DefinitionProvider, HoverProvider, DocumentLinkProvider, Disposable {
  public disposables: Disposable[] = [];

  constructor() {
    this.disposables.push(
      languages.registerDefinitionProvider(DART_MODE, this),
      languages.registerHoverProvider(DART_MODE, this),
      languages.registerDocumentLinkProvider(DART_MODE, this),
    );
  }

  public async provideDefinition(document: TextDocument, position: Position, token: CancellationToken): Promise<LocationLink[] | undefined> {
    let pathRange: Range | undefined;
    let uris = await this.getAssetUris(document, position, pathRange);
    if (uris) {
      return uris.map((uri) => {
        return {
          originSelectionRange: pathRange,
          targetRange: pathRange,
          targetUri: uri,
          targetSelectionRange: new Range(new Position(0, 0), new Position(0, 0))
        } as LocationLink
      });
    }
  }

  public async provideDocumentLinks(document: TextDocument, token: CancellationToken): Promise<DocumentLink[] | undefined> {
    let links: DocumentLink[] = [];
    let text = document.getText();
    let match: RegExpExecArray | null;
    
    assetRegExp.lastIndex = -1;
    while(match = assetRegExp.exec(text)) {
      let range = getRange(document, match.index, match[0].length);
      let findFiles = await this.findFiles(document.getText(range));
      if (findFiles.length > 0) {
        links.push(new DocumentLink(range, findFiles[0]));
      }
    }
    return links;
  }

  public async provideHover(document: TextDocument, position: Position, token: CancellationToken): Promise<Hover | undefined> {
    let uris = await this.getAssetUris(document, position);
    if (uris) {
      return new Hover(
        uris.map((uri) => {
          let supportMD = mdAssetExtension.includes(path.parse(uri.path).ext.substr(1));
          let desc = supportMD ? uri.path : '😂 😂 😂 暂时不支持预览呦～😂 😂 😂';
          return new MarkdownString(`![${desc}](${uri.path})`, true);
        }
      ));
    }

    // net asset
    let pathText = this.getWordAtPosition(document, position, netAssetRegExp);
    if (pathText) {
      return new Hover(
        new MarkdownString(`![${pathText}](${pathText})`, true)
      )
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

  private async getAssetUris(document: TextDocument, position: Position, pathRange?: Range):  Promise<Array<Uri> | undefined> {
    let pathText = this.getWordAtPosition(document, position, assetRegExp, pathRange);
    if (pathText) {
      return await this.findFiles(pathText);
    }
  }

  private getWordAtPosition(document: TextDocument, position: Position, regex = assetRegExp, pathRange?: Range): string | undefined {
    pathRange = document.getWordRangeAtPosition(position, regex);
    if (pathRange) {
      return document.getText(pathRange);
    }
  }

  private async findFiles(pathText: string):  Promise<Array<Uri>> {
    // 考虑**/**/3×/abc.png
    let splitIndex = pathText.lastIndexOf('/') + 1;
    let pathDir = pathText.substring(0, splitIndex);
    let searchDir = pathDir ? `${matchAll}${pathDir}${matchAll}` : matchAll;
    let searchPath = `${searchDir}${pathText.substring(splitIndex)}`;
    return await workspace.findFiles(searchPath, 'build');
  }

  public dispose() {
    this.disposables.forEach(e => e.dispose());
  }
}