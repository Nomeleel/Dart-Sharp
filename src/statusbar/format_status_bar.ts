import { StatusBarAlignment, StatusBarItem, window, workspace } from "vscode";
import { DisposableBase } from "../common/disposable_base";
import { DART_ENABLE_SDK_FORMATTER, TOGGLE_FORMAT_COMMAND } from "../constant/constant";
import { getFormatConfig } from "../util/format";

const STATUS_BAR_LABEL = 'Dart Format';
const STATUS_BAR_TOOLTIP = 'Toggle Format';

export class FormatStatusBar extends DisposableBase {
  private format: StatusBarItem;
  
  constructor() {
    super();
    this.format = window.createStatusBarItem('dartFormatStatusBar', StatusBarAlignment.Right, 100);
    this.disposables.push(this.format);
    
    this.disposables.push(workspace.onDidChangeConfiguration((e) => {
      if (e.affectsConfiguration(DART_ENABLE_SDK_FORMATTER)) {
        this.formatStatusSync();
      }
    }));

    this.formatStatusSync();
  }

  async formatStatusSync() {
    let format = getFormatConfig();
    if (format !== undefined) {
      this.format.text = STATUS_BAR_LABEL;
      this.format.command = {
        title: STATUS_BAR_TOOLTIP,
        command: TOGGLE_FORMAT_COMMAND
      };
      this.format.color = format ? undefined : '#FFF7';
      this.format.tooltip = STATUS_BAR_TOOLTIP;
      this.format.show();
    } else {
      this.format.hide();
    }
  }
}