import { CodeAction, Command, commands, QuickPickItem, window, workspace, WorkspaceEdit } from "vscode";
import { DisposableBase } from "../common/disposable_base";
import { WRAP_WITH_WIDGET_COMMAND } from "../constant/constant";
import { VSCODE_EXECUTE_CODE_ACTION_PROVIDER } from "../constant/vscode";

export class WrapWithWidgetCommand extends DisposableBase {
  constructor() {
    super();

    this.disposables.push(
      commands.registerCommand(WRAP_WITH_WIDGET_COMMAND, this.wrapWithWidget),
    );
  }

  public async wrapWithWidget() {
    const editor = window.activeTextEditor;

    if (editor && editor.selection.active) {
      const codeActions = await commands.executeCommand<Array<CodeAction>>(VSCODE_EXECUTE_CODE_ACTION_PROVIDER, editor.document.uri, editor.selection);
      let wrapWithWidgets = codeActions?.filter((e) => (e.kind?.value.startsWith('refactor') ?? false) && e.title.startsWith('Wrap with'));
      if (wrapWithWidgets && wrapWithWidgets.length > 0) {
        let items = wrapWithWidgets.map<QuickPickItemWithAction>((e) => ({
          label: e.title,
          command: e.command,
          edit: e.edit,
        }))

        let selected = await window.showQuickPick(
          items,
          {
            title: 'Wrap With Widget',
            placeHolder: 'Wrap with...',
          }
        );

        if (selected?.edit) workspace.applyEdit(selected.edit);
        if (selected?.command) commands.executeCommand(selected.command.command, ...(selected.command.arguments ?? []));
      }
    }
  }
}

interface QuickPickItemWithAction extends QuickPickItem {
  command?: Command;
  edit?: WorkspaceEdit;
}