import { commands, Position, Range, Selection, SnippetString, window } from "vscode";
import { DisposableBase } from "../common/disposable_base";

export class WrapSnippetCommand extends DisposableBase {
  constructor() {
    super();

    this.disposables.push(
      commands.registerCommand('dart_sharp.wrapSnippet', this.wrapSnippet),
    );
  }

  public async wrapSnippet(targetRange: Range, wrapSnippet: string, wrapFlag = '${WIDGET}') {
    if (!targetRange || !wrapSnippet) return;
    const editor = window.activeTextEditor;
    if (editor) {
      const targetText = editor.document.getText(targetRange);
      const wrapedText = wrapSnippet.replace(wrapFlag, targetText);
      editor.insertSnippet(new SnippetString(wrapedText), targetRange);
      // 以上无需修正插入字符串缩进格式 直接局部格式化即可
      let lineCount = wrapedText.split('\n').length;
      editor.selection = new Selection(targetRange.start, new Position(targetRange.start.line + lineCount, 0));
      await commands.executeCommand('editor.action.formatSelection');
      editor.selection = new Selection(new Position(0, 0), new Position(0, 0));
    }
  }
}