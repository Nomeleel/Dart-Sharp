import { CancellationToken, DefinitionProvider, Disposable, Hover, HoverProvider, languages, LocationLink, MarkdownString, Position, ProviderResult, Range, TextDocument, Uri, workspace } from "vscode";
import { DART_MODE } from "../constant/constant";

export class AssetProvider implements DefinitionProvider, HoverProvider, Disposable {
  public disposables: Disposable[] = [];

  constructor() {
    this.disposables.push(languages.registerDefinitionProvider(DART_MODE, this));
    this.disposables.push(languages.registerHoverProvider(DART_MODE, this));
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

  private async getAssetUris(document: TextDocument, position: Position, pathRange?: Range):  Promise<Array<Uri> | undefined> {
    pathRange = document.getWordRangeAtPosition(position, /(?<=[\"\'])\S+\.\S+(?=[\"\'])/);
    if (pathRange) {
      const pathText = document.getText(pathRange);
      return await workspace.findFiles(`**/${pathText}`, `build`);
    }
  }

  public dispose() {
    this.disposables.forEach(e => e.dispose());
  }
}