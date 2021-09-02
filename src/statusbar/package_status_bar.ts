import { commands, StatusBarAlignment, StatusBarItem, Uri, window, workspace } from "vscode";
import { DisposableBase } from "../common/disposable_base";

const command = 'pubGetForAllProject';

export class PackageStatusBar extends DisposableBase {
  private package: StatusBarItem;
  
  constructor() {
    super();
    this.package = window.createStatusBarItem(StatusBarAlignment.Left, 0);
    this.disposables.push(this.package);
    this.updatePackageInfo();

    this.disposables.push(commands.registerCommand(command, this.pubGetForAllProject));
  }

  async updatePackageInfo() {
    let pubFiles = await workspace.findFiles('**/pubspec.yaml', 'ios');
    if (pubFiles.length > 0) {
      this.package.command = {
        title: command,
        command: command,
        arguments: [pubFiles],
      };
      this.package.text = `$(megaphone) pubspec.yaml: ${pubFiles.length}`;
      this.package.show();
    } else {
      this.package.hide();
    }
  }

  async pubGetForAllProject(pubFiles: Array<Uri>) {
    console.log(pubFiles);
    for await (const pubFile of pubFiles) {
      let result = await commands.executeCommand("dart.getPackages", pubFile);
      if (result === 0) {
        console.log('success');
      }
    }
  }
}