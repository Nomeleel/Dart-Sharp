import * as path from "path";
import { commands, Uri, window, workspace } from "vscode";
import { DisposableBase } from "../common/disposable_base";
import { PUB_DEV, PUB_UPGRADE_SPECIFIC } from "../constant/constant";
import { VSCODE_OPEN } from "../constant/vscode";
import { activeSelectionText } from "../util/document";
import { dependencyRemotePackages } from "../util/packages";

export class PubExtensionCommand extends DisposableBase {
  constructor() {
    super();

    this.disposables.push(
      commands.registerCommand(PUB_DEV, this.openPubDev),
      commands.registerCommand(PUB_UPGRADE_SPECIFIC, this.pubUpgradeSpecific),
    );
  }

  private async openPubDev() {
    return commands.executeCommand(VSCODE_OPEN, Uri.parse('https://pub.dev/'));
  }

  private async pubUpgradeSpecific() {
    let pkgs, dir : string;
    if (isActivePubspecFile()) {
      pkgs = activeSelectionText();
      dir = path.dirname(window.activeTextEditor!.document.uri.fsPath);
    } else {
      dir = workspace.workspaceFolders![0].uri.fsPath;
    }

    if (!pkgs) pkgs = await pickDependencyPackages(dir);
    if (pkgs) {
      let terminal = window.terminals.find(t => t.name === dir) ?? window.createTerminal({ name: dir, cwd: dir });
      terminal.show(true);
      terminal.sendText(`flutter pub upgrade ${pkgs}`);
    }
  }
}

function isActivePubspecFile() : boolean {
  return path.basename(window.activeTextEditor?.document.fileName ?? '') === 'pubspec.yaml'
}

async function pickDependencyPackages(dir : string): Promise<Thenable<string | undefined>> {
  let pkgs = dependencyRemotePackages(dir)?.map((p) => ({
    label: p.name,
    detail: p.absolutePath,
    location: p.absolutePath,
  }));

  if (pkgs) {
    let selected = await window.showQuickPick(
      pkgs,
      {
        canPickMany: true,
        matchOnDescription: true,
        matchOnDetail: true,
      }
    );
    return selected?.map(e => e.label).join(' ');
  }
}
