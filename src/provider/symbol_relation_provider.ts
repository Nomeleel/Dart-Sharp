import { CancellationToken, Command, commands, Location, Position, Progress, ProgressLocation, TreeItemCollapsibleState, TreeView, Uri, window, workspace } from "vscode";
import { TreeDataProviderBase, TreeNode } from "../common/tree_data_provider_base";
import { SYMBOL_RELATION_COMMAND } from "../constant/constant";
import { VSCODE_EXECUTE_REFERENCE_PROVIDER } from "../constant/vscode";
import { jumpToCommand } from "../util/command";
import { getTextFromLocationFillRange } from "../util/util";

export class SymbolRelationProvider extends TreeDataProviderBase<SymbolItem> {

  private treeView: TreeView<TreeNode>;

  constructor() {
    super();
    this.disposables.push(
      this.treeView = window.createTreeView('symbolRelation.view', { treeDataProvider: this, showCollapseAll: true }),
      commands.registerCommand(SYMBOL_RELATION_COMMAND, this.symbolRelation, this),
    );
  }

  public async symbolRelation() {
    const symbols = await window.withProgress({
      location: ProgressLocation.Notification,
      // title: 'Scan Symbol Relation...',
      cancellable: true,
    }, this.symbolRelationScanWithProgress);

    if (symbols) {
      this.updateTreeView(symbols);
      this.treeView.reveal(this.rootNode!);
    }
  }

  private symbolRelationScanWithProgress(progress: Progress<{ message?: string | undefined; increment?: number | undefined; }>, token: CancellationToken): Promise<SymbolItem | undefined> {
    let progressMap = new Map<string, number>();
    function progressTrack(key: string, preKey: string, count: number, message: string): boolean {
      if (token.isCancellationRequested) return false;
      let increment = 0;
      if (progressMap.has(key)) {
        increment = progressMap.get(key)!;
      } else {
        increment = (progressMap.get(preKey) ?? 100) / ((count ?? 0) + 1);
        progressMap.set(key, increment);
      }

      progress.report({
        message: message,
        increment: increment,
      });

      return true;
    }

    return symbolRelationScan(progressTrack);
  }

}

async function symbolRelationScan(progressTrack: Function, uri?: Uri, position?: Position, symbolItem?: SymbolItem): Promise<SymbolItem | undefined> {
  let curUri = uri ?? window.activeTextEditor?.document.uri;
  let curPosition = position ?? window.activeTextEditor?.selection.start;
  if (!curUri || !curPosition) return;
  let curDocument = await workspace.openTextDocument(curUri);
  let curRange = curDocument.getWordRangeAtPosition(curPosition);
  let symbol = curDocument.getText(curRange);
  if (symbolItem == null) symbolItem = new SymbolItem(symbol, uri);
  symbolItem.setCommand(jumpToCommand(curUri, curRange));
  let locations = await commands.executeCommand<Array<Location>>(VSCODE_EXECUTE_REFERENCE_PROVIDER, curUri, curPosition);
  let track = progressTrack(symbol, symbolItem?.parent?.label, locations?.length, symbol);
  if (!track) return;
  if (locations) {
    for await (const location of locations) {
      let rangeText = await getTextFromLocationFillRange(location);
      let extendRegExp = new RegExp(`(?<=((abstract )?class ))(?<symbol>\\\w*).*(?= extends ${symbol})`, 'gmi');
      let match = extendRegExp.exec(rangeText);
      if (match) {
        symbolItem.setExpanded();
        let curSymbolItem = new SymbolItem(match.groups!.symbol, location.uri, symbolItem);
        symbolItem.children.push(curSymbolItem);
        await symbolRelationScan(progressTrack, location.uri, new Position(location.range.start.line, match.index + 1), curSymbolItem);
      } else {
        track = progressTrack(symbol, symbolItem?.parent?.label, locations?.length, rangeText);
        if (!track) return;
      }
    }
  }
  return symbolItem;
}

export class SymbolItem extends TreeNode {
  constructor(title: string, uri?: Uri, parent?: SymbolItem) {
    super(title);
    this.resourceUri = uri;
    this.parent = parent;
  }

  public setCommand(command?: Command) {
    this.command = command;
  }

  public setExpanded() {
    this.collapsibleState = TreeItemCollapsibleState.Expanded;
  }

  public equal(symbolItem: SymbolItem): boolean {
    return this.label === symbolItem.label && this.resourceUri === symbolItem.resourceUri;
  }
}