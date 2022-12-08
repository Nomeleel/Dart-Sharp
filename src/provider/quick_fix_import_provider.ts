import { CodeAction, CodeActionContext, CodeActionKind, CodeActionProvider, commands, Disposable, languages, Position, Range, Selection, SymbolInformation, TextDocument, Uri, workspace, WorkspaceEdit } from "vscode";
import { DART_MODE } from "../constant/constant";
import { VSCODE_EXECUTE_CODE_ACTION_PROVIDER, VSCODE_EXECUTE_WORKSPACE_SYMBOL_PROVIDER } from "../constant/vscode";
import { dependencyPackages, Package } from "../util/packages";

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
      let result = await commands.executeCommand<Array<SymbolInformation>>(VSCODE_EXECUTE_WORKSPACE_SYMBOL_PROVIDER, word);
      if (result && result.length > 0) {
        let symbol = result.find((s) => s.name == word);
        if (!symbol) return;
        let imports = await commands.executeCommand<Array<CodeAction>>(VSCODE_EXECUTE_CODE_ACTION_PROVIDER, document.uri, position);
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
    this.packages = dependencyPackages(workspacePath);

    //TODO(Nomeleel) .packages
  }

  public dispose(): any {
    this.disposables.forEach((e) => e.dispose());
  }
}
