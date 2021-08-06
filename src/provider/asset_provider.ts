import { CancellationToken, DefinitionProvider, Disposable, languages, LocationLink, Position, Range, TextDocument, workspace } from "vscode";
import { DART_MODE } from "../constant/constant";

export class AssetProvider implements DefinitionProvider, Disposable {
  public disposables: Disposable[] = [];

  constructor() {
    this.disposables.push(languages.registerDefinitionProvider(DART_MODE, this));
  }

  public async provideDefinition(document: TextDocument, position: Position, token: CancellationToken): Promise<LocationLink[] | undefined> {
    let pathRange = document.getWordRangeAtPosition(position, /(?<=[\"\'])\S+\.\S+(?=[\"\'])/);
    if (pathRange) {
      const pathText = document.getText(pathRange);
      let uris = await workspace.findFiles(`**/${pathText}`, `build`);
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
  }

  public dispose() {
    this.disposables.forEach(e => e.dispose());
  }
}