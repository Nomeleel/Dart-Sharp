import { CancellationToken, DefinitionProvider, Disposable, DocumentLink, DocumentLinkProvider, Hover, HoverProvider, languages, LocationLink, MarkdownString, Position, Range, TextDocument, Uri, workspace } from "vscode";
import { DART_MODE } from "../constant/constant";

const assetRegExp = /(?<=[\"\'])[^\s:\.]+\.((?!dart).)+(?=[\"\'])/gm;

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

  public async provideHover(document: TextDocument, position: Position, token: CancellationToken): Promise<Hover | undefined> {
    let uris = await this.getAssetUris(document, position);
    if (uris) {
      return new Hover(
        uris.map((uri) => {
          // TODO: 可能不是图片
          return new MarkdownString(`![${uri.path}](${uri.path})`, true);
        }
      ));
    }
  }

  public async provideDocumentLinks(document: TextDocument, token: CancellationToken): Promise<DocumentLink[] | undefined> {
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
    pathRange = document.getWordRangeAtPosition(position, assetRegExp);
    if (pathRange) {
      const pathText = document.getText(pathRange);
      return await this.findFiles(pathText);
    }
  }

  private async findFiles(pathText: string):  Promise<Array<Uri>> {
    // 考虑**/**/3×/abc.png
    let splitIndex = pathText.lastIndexOf('/') + 1;
    let searchPath = `${pathText.substring(0, splitIndex)}**/${pathText.substring(splitIndex)}`
    return await workspace.findFiles(searchPath, 'build');
  }

  public dispose() {
    this.disposables.forEach(e => e.dispose());
  }
}