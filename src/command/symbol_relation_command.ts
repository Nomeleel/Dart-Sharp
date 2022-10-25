import { commands, DefinitionLink, Location, Position, TreeItem, Uri, window } from "vscode";
import { DisposableBase } from "../common/disposable_base";
import { SYMBOL_RELATION_COMMAND } from "../constant/constant";
import { VSCODE_EXECUTE_REFERENCE_PROVIDER } from "../constant/vscode";
import { getTextFromLocationFillRange, getTextFromPosition } from "../util/util";

export class SymbolRelationCommand extends DisposableBase {

  constructor() {
    super();
    this.disposables.push(
      commands.registerCommand(SYMBOL_RELATION_COMMAND, symbolRelationScan, this),
    );
  }
}

async function symbolRelationScan(uri?: Uri, position?: Position, symbolItem?: SymbolItem): Promise<SymbolItem | undefined> {
  let curUri = uri ?? window.activeTextEditor?.document.uri;
  let curPosition = position ?? window.activeTextEditor?.selection.start;
  if (!curUri || !curPosition) return;
  let locations = await commands.executeCommand<Array<Location>>(VSCODE_EXECUTE_REFERENCE_PROVIDER, curUri, curPosition);
  let symbol = await getTextFromPosition(curUri, curPosition);
  if (symbolItem == null) symbolItem = new SymbolItem(symbol, uri);
  if (locations) {
    for await (const location of locations) {
      let rangeText = await getTextFromLocationFillRange(location);
      let extendRegExp = new RegExp(`(?<=((abstract )?class ))(?<symbol>\\\w*).*(?= extends ${symbol})`, 'gmi');
      let match = extendRegExp.exec(rangeText);
      if (match) {
        let curSymbolItem = new SymbolItem(match.groups!.symbol, location.uri, symbolItem);
        symbolItem.children.push(curSymbolItem);
        await symbolRelationScan(location.uri, new Position(location.range.start.line, match.index + 1), curSymbolItem);
      }
    }
  }
  return symbolItem;
}

export class SymbolItem extends TreeItem {
  public parent: SymbolItem | undefined;
  public children: SymbolItem[] = [];

  constructor(title: string, uri?: Uri, parent?: SymbolItem) {
    super(title);
    this.resourceUri = uri;
    this.parent = parent;
  }

  public equal(symbolItem: SymbolItem): boolean {
    return this.label === symbolItem.label && this.resourceUri === symbolItem.resourceUri;
  }
}