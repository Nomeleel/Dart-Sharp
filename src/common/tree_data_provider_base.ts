import { Event, EventEmitter, TreeDataProvider, TreeItem } from "vscode";
import { DisposableBase } from "./disposable_base";

export class TreeDataProviderBase<T extends TreeNode> extends DisposableBase implements TreeDataProvider<TreeNode> {

  protected rootNode: T | undefined;

  protected onDidChangeTreeDataEmitter: EventEmitter<TreeNode | undefined | null | void> = new EventEmitter<TreeNode | undefined | null | void>();
  public readonly onDidChangeTreeData: Event<TreeNode | undefined | null | void> = this.onDidChangeTreeDataEmitter.event;

  public updateTreeView(treeNode?: T) {
    this.rootNode = treeNode;
    this.onDidChangeTreeDataEmitter.fire();
  }

  getTreeItem(element: TreeNode): TreeNode {
    return element;
  }

  public getChildren(element?: TreeNode): TreeNode[] {
    if (element) {
      return element.children;
    }
    if (this.rootNode) {
      return this.rootNode.children;
    }
    return [];
  }

  public getParent(element: TreeNode): TreeNode | undefined {
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