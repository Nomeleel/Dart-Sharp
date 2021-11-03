import { commands, window } from "vscode";
import { DisposableBase } from "../common/disposable_base";
import { getFormatConfig, setFormatConfig } from "../util/format";

export class ToggleFormatCommand extends DisposableBase {
  constructor() {
    super();

    this.disposables.push(
      commands.registerCommand('dart_sharp.toggleFormat', this.toggleFormat),
    );
  }

  public toggleFormat() {
    let current = getFormatConfig();
    if (current !== undefined) {
      setFormatConfig(!current);
      let msg = current ? '小弟, 你歇一歇, 格式化常规操作我自己来～～～' : '主人, 你随便写, 格式化就交给我吧～～～';
      window.showInformationMessage(`😊 😊 😊 ${msg}😊 😊 😊`);
    } else {
      window.showWarningMessage('😂 😂 😂 我怀疑你没有装Dart/Flutter插件，赶快去装～～～😂 😂 😂');
    }
  }
}