import * as path from "path";
import { Command, commands, Disposable, Event, EventEmitter, Range, TreeDataProvider, TreeItem, TreeItemCollapsibleState, Uri, window, workspace } from "vscode";
import { getExtensionIconPath, setContext } from "../util/util";

export class PubspecViewProvider implements TreeDataProvider<PubspecItem>, Disposable {

  protected disposables: Disposable[] = [];

  protected rootNode: PubspecItem | undefined;

  // TODO remove...
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
    this.pubFiles = await workspace.findFiles('**/pubspec.yaml', 'ios');
    if (this.pubFiles.length > 0) {
      this.rootNode = new PubspecItem('Pubspec View');
      let children = this.pubFiles.map((uri) => {
        let relativePath = workspace.asRelativePath(uri);
        let dirList = path.parse(uri.path).dir.split(path.sep);
        let command = this.jumpToCommand(uri.path);
        let pub = new PubspecItem(dirList[dirList.length - 1], uri, command);
        pub.setChildren([new PubspecItem(relativePath, uri, command)]);
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

  private async pub(command: string) {
    if (this.pubFiles) {
      this.setPubCancel(true);
      this.pubActionInit();
      for await (const pubFile of this.rootNode!.children) {
        if (!this.isCancel()) {
          await this.pubItemAction(pubFile, async (pub: PubspecItem) => {
            return await commands.executeCommand(`dart.${command}`, pub.resourceUri);
          })
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

  private async pubActionInit() {
    this.rootNode?.children?.forEach((pub) => pub.updateIconPath(true));
    this.updatePubspecView();
  }

  private async pubItemAction(item: PubspecItem, action: Function) {
    this.updatePubItem(item);
    // TODO  status...
    let result = await action(item);
    this.updatePubItem(item);
  }

  private updatePubItem(item: PubspecItem) {
    item.updateIconPath();
    this.updatePubspecView();
  }

  private updatePubspecView() {
    this.onDidChangeTreeDataEmitter.fire(undefined);
    console.log(this.rootNode);
    this.onDidChangeTreeDataEmitter.fire(this.rootNode);
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
  public progress: Progress;

  constructor(title: string, uri?: Uri, command?: Command, description?: string) {
    super(title);
    this.resourceUri = uri;
    this.progress = new Progress();
    this.command = command;
    this.description = description;
    this.updateIconPath();
  }

  public setChildren(children: PubspecItem[]) {
    this.children = children;
    this.collapsibleState = (children && children.length > 0) ?
      TreeItemCollapsibleState.Expanded : TreeItemCollapsibleState.None;
  }

  public updateIconPath(reset = false) {
    if (reset) this.progress.reset();
    this.iconPath = getExtensionIconPath(this.progress.currentAndNext());
  }

  public equal(PubspecItem: PubspecItem): boolean {
    return this.label === PubspecItem.label && this.description === PubspecItem.description;
  }
}

export class Progress {
  private progress = 0;

  public static progressMap : Map<number, string | undefined> = new Map([
    [0, undefined],
    [1, 'cancel.png'],
    [2, 'get_dark.svg'],
  ]);

  public next() {
    this.progress = (this.progress + 1) % Progress.progressMap.size;
  }

  public current(): string | undefined {
    return Progress.progressMap.get(this.progress);
  }

  public currentAndNext(): string | undefined {
    let current = this.current();
    this.next();
    return current;
  }

  public reset() {
    this.progress = 0;
  }
}