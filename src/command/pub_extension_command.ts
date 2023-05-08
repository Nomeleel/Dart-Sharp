import * as path from "path";
import { commands, TerminalOptions, Uri, window, workspace } from "vscode";
import { DisposableBase } from "../common/disposable_base";
import { PUB_DEV, PUB_UPGRADE_SPECIFIC } from "../constant/constant";
import { VSCODE_OPEN } from "../constant/vscode";
import { activeSelectionText } from "../util/document";
import { dependencyRemotePackages } from "../util/packages";
import { lastDir } from "../util/util";

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
    let pkgs, dir: string;
    if (isActivePubspecFile()) {
      pkgs = activeSelectionText();
      dir = path.dirname(window.activeTextEditor!.document.uri.fsPath);
    } else {
      dir = workspace.workspaceFolders![0].uri.fsPath;
    }

    if (!pkgs) pkgs = await pickDependencyPackages(dir);
    if (pkgs) {
      let project = lastDir(dir, true);
      let terminal = window.terminals.find(t => (t.creationOptions as Readonly<TerminalOptions>).cwd === dir) ?? window.createTerminal({ name: project, cwd: dir });
      terminal.show(true);
      terminal.sendText(`flutter pub upgrade ${pkgs}`, false);
      terminal.sendText('; exit');
    }
  }
}

function isActivePubspecFile(): boolean {
  return path.basename(window.activeTextEditor?.document.fileName ?? '') === 'pubspec.yaml'
}

async function pickDependencyPackages(dir: string): Promise<Thenable<string | undefined>> {
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
