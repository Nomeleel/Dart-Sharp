import { Event, EventEmitter, TreeDataProvider, TreeItem } from "vscode";
import { DisposableBase } from "./disposable_base";

export class TreeDataProviderBase<T extends TreeNode> extends DisposableBase implements TreeDataProvider<TreeNode> {

  protected rootNode: T | undefined;

  protected onDidChangeTreeDataEmitter: EventEmitter<T | undefined | null | void> = new EventEmitter<T | undefined | null | void>();
  public readonly onDidChangeTreeData: Event<T | undefined | null | void> = this.onDidChangeTreeDataEmitter.event;

  public updateTreeView(treeNode?: T) {
    this.rootNode = treeNode;
    this.onDidChangeTreeDataEmitter.fire();
  }

  public getTreeItem(element: T): TreeNode {
    return element;
  }

  public getChildren(element?: T): TreeNode[] {
    if (element) {
      return element.children;
    }
    if (this.rootNode) {
      return [this.rootNode];
    }
    return [];
  }

  public getParent(element: T): TreeNode | undefined {
    return element.parent;
  }
}

export class TreeNode extends TreeItem {
  public parent: TreeNode | undefined;
  public children: TreeNode[] = [];

  public equal(symbolItem: TreeNode): boolean {
    return this.label === symbolItem.label && this.resourceUri === symbolItem.resourceUri;
  }
}