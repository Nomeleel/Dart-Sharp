import { commands, ConfigurationTarget, window, workspace } from "vscode";
import { DisposableBase } from "../common/disposable_base";
import { DART_ENABLE_SDK_FORMATTER } from "../constant/constant";

export class ToggleFormatCommand extends DisposableBase {
  constructor() {
    super();

    this.disposables.push(
      commands.registerCommand('dart_sharp.toggleFormat', this.toggleFormat),
    );
  }

  public toggleFormat() {
    let current = workspace.getConfiguration().get(DART_ENABLE_SDK_FORMATTER);
    if (current !== undefined) {
      workspace.getConfiguration().update(DART_ENABLE_SDK_FORMATTER, !current, ConfigurationTarget.Global, true);
      let msg = current ? '小弟, 你歇一歇, 格式化常规操作我自己来～～～' : '主人, 你随便写, 格式化就交给我吧～～～';
      window.showInformationMessage(`😊 😊 😊 ${msg}😊 😊 😊`);
    } else {
      window.showWarningMessage('😂 😂 😂 我怀疑你没有装Dart/Flutter插件，赶快去装～～～😂 😂 😂');
    }
  }
}