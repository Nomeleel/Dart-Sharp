import * as fs from "fs";
import { join } from "path";
import { CodeAction, CodeActionContext, CodeActionKind, CodeActionProvider, commands, Disposable, languages, Position, Range, Selection, SymbolInformation, TextDocument, Uri, workspace, WorkspaceEdit } from "vscode";
import { DART_MODE } from "../constant/constant";
import { VSCODE_EXECUTE_CODE_ACTION_PROVIDER } from "../constant/vscode";

const quickImportImportCodeActionKind = 'quickfix.import';
export class QuickFixImportProvider implements CodeActionProvider {

  public disposables: Disposable[] = [];

  public packages?: Package[];

  constructor() {
    this.disposables.push(
      languages.registerCodeActionsProvider(DART_MODE, this),
    );
  }

  public async provideCodeActions(document: TextDocument, range: Range | Selection, context: CodeActionContext): Promise<CodeAction[] | undefined> {
    if (context && context?.only?.value == quickImportImportCodeActionKind) return;

    if (range.start) {
      let position = document.getWordRangeAtPosition(range.start);
      let word = document.getText(position);
      let result = (await commands.executeCommand('vscode.executeWorkspaceSymbolProvider', word)) as SymbolInformation[];
      if (result && result.length > 0) {
        let symbol = result.find((s) => s.name == word);
        if (!symbol) return;
        let imports = (await commands.executeCommand(VSCODE_EXECUTE_CODE_ACTION_PROVIDER, document.uri, position,)) as CodeAction[];
        if (!imports || imports.length == 0) {
          if (!this.packages) {
            this.collectPackages();
          }
          if (this.packages) {
            let codeActions: CodeAction[] = [];
            this.packages.forEach((pkg) => {
              if (symbol?.location.uri.path.startsWith(pkg.absolutePath)) {
                //TODO(Nomeleel) imp
                let importPackage = `Import ${pkg.name}`
                let codeAction = new CodeAction(importPackage, CodeActionKind.QuickFix);
                let workspaceEdit = new WorkspaceEdit();
                workspaceEdit.insert(document.uri, new Position(0, 0), importPackage);
                codeAction.edit = workspaceEdit;

                //TODO(Nomeleel) command
                // util/dartFileEdit
              }
            });
            return codeActions;
          }
        }
      }
    }
  }

  /// .dart_tool/package_config.json or .packages
  public collectPackages(): any {
    let workspacePath = workspace.workspaceFolders![0].uri.path;
    let packageConfigPath = join(workspacePath, '.dart_tool', 'package_config.json');
    if (fs.existsSync(packageConfigPath)) {
      let content = fs.readFileSync(packageConfigPath, 'utf-8');
      this.packages = JSON.parse(content).packages as Package[];

      this.packages.forEach((pkg) => {
        if (pkg.rootUri.startsWith('file://')) {
          pkg.absolutePath = Uri.parse(pkg.rootUri).path;
        } else if (pkg.rootUri.startsWith('../')) {
          pkg.absolutePath = Uri.joinPath(Uri.file(workspacePath), 'lib', pkg.rootUri).path;
        }
      });
    }

    //TODO(Nomeleel) .packages
  }

  public dispose(): any {
    this.disposables.forEach((e) => e.dispose());
  }
}

class Package {
  public name: string;
  public rootUri: string;
  public absolutePath: string;

  constructor(name: string, rootUri: string) {
    this.name = name;
    this.rootUri = rootUri;
    this.absolutePath = rootUri;
  }
}