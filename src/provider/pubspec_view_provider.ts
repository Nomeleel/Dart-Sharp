import { Command, commands, Disposable, Event, EventEmitter, extensions, Position, Range, TextDocument, TextEditor, TreeDataProvider, TreeItem, TreeItemCollapsibleState, Uri, window, workspace } from "vscode";
import * as path from "path";
import { setContext } from "../util/util";

export class PubspecViewProvider implements TreeDataProvider<PubspecItem>, Disposable {

  protected disposables: Disposable[] = [];

  protected rootNode: PubspecItem | undefined;

  protected pubFiles: Array<Uri> | undefined;
  
  private pubCancel = false;

  protected onDidChangeTreeDataEmitter: EventEmitter<PubspecItem | undefined> = new EventEmitter<PubspecItem | undefined>();
  public readonly onDidChangeTreeData: Event<PubspecItem | undefined> = this.onDidChangeTreeDataEmitter.event;

  constructor() {
    this.disposables.push(
      window.createTreeView("pubspec.view", { treeDataProvider: this, showCollapseAll: true }),
      commands.registerCommand('dart_sharp.pub.get', () => this.pubGet()),
      commands.registerCommand('dart_sharp.pub.upgrade', () => this.pubUpgrade()),
      commands.registerCommand('dart_sharp.pub.cancel', () => this.setPubCancel(false)),
    );

    this.listenerPubspecFile();
  }

  public async listenerPubspecFile() {
    this.onDidChangeTreeDataEmitter.fire(undefined);
    this.pubFiles = await workspace.findFiles('**/pubspec.yaml');
    if (this.pubFiles.length > 0) {
      this.rootNode = new PubspecItem('Pubspec View');
      let children = this.pubFiles.map((p) => {
        let dirList = path.parse(p.path).dir.split(path.sep);
        let pub = new PubspecItem(dirList[dirList.length - 1], undefined, undefined, this.jumpToCommand(p.path));
        pub.setChildren([new PubspecItem(p.path)]);
        return pub;
      });
      this.rootNode.setChildren(children);
    } else {
      this.rootNode = undefined;
    }
    this.onDidChangeTreeDataEmitter.fire(this.rootNode);
  }

  public async pubGet() {
    this.pub('getPackages');
  }

  public async pubUpgrade() {
    this.pub('upgradePackages');
  }

  // TODO: progress...
  private async pub(command: string) {
    if (this.pubFiles) {
      this.setPubCancel(true);
      for await (const pubFile of this.pubFiles) {
        if (this.isCancel()) return;
        let result = await commands.executeCommand(`dart.${command}`, pubFile);
        if (result === 0) {
          console.log('success');
        }
      }
      this.setPubCancel(false);
    }
  }

  private setPubCancel(cancel: boolean) {
    this.pubCancel = cancel;
    setContext('dart_sharp.pubCancel', this.pubCancel);
  }

  private isCancel() {
    return !this.pubCancel;
  }

  public jumpToCommand(path: string, range?: Range): Command {
    return {
      command: "dart_sharp.jumpToEditor",
      arguments: [
        path,
        range,
        range,
      ],
      title: "Jump To",
    };
  }

  public getTreeItem(element: PubspecItem): TreeItem {
    return element;
  }

  public getChildren(element: PubspecItem): PubspecItem[] {
    if (element) {
      return element.children;
    }
    if (this.rootNode) {
      return this.rootNode.children;
    }
    return [];
  }

  public getParent(element: PubspecItem): PubspecItem | undefined {
    return element.parent;
  }

  public dispose() {
    this.disposables.forEach((d) => d.dispose());
  }
}

export class PubspecItem extends TreeItem {
  public parent: PubspecItem | undefined;
  public children: PubspecItem[] = [];

  constructor(title: string, iconPath?: Uri, description?: string, command?: Command) {
    super(title);
    this.iconPath = iconPath;
    this.command = command;
    this.description = description;
  }

  public setChildren(children: PubspecItem[]) {
    this.children = children;
    this.collapsibleState = (children && children.length > 0) ?
      TreeItemCollapsibleState.Expanded : TreeItemCollapsibleState.None;
  }

  public equal(PubspecItem: PubspecItem): boolean {
    return this.label === PubspecItem.label && this.description === PubspecItem.description;
  }
}