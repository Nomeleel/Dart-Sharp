import { CodeAction, commands, Position, Range, Selection, SnippetString, window, workspace } from "vscode";
import { DisposableBase } from "../common/disposable_base";
import { DART_ENABLE_SDK_FORMATTER } from "../constant/constant";

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

      // 插入未引入的符号 尝试进行引入
      const codeActions = await (commands.executeCommand("vscode.executeCodeActionProvider", editor.document.uri, targetRange) as Thenable<CodeAction[]>);
      let quickfixImport = codeActions.find((e) => e.kind?.value.startsWith('quickfix.import'));
      let importOffset = 0;
      if (quickfixImport && quickfixImport.edit) {
        if (await workspace.applyEdit(quickfixImport.edit))
          importOffset = quickfixImport.edit.get(editor.document.uri)[0].newText.split('\n').length - 1;
      }

      // 以上无需修正插入字符串缩进格式 直接局部格式化即可
      let lineCount = wrapedText.split('\n').length;
      let startPosition = targetRange.start.translate(importOffset);
      editor.selection = new Selection(startPosition, new Position(startPosition.line + lineCount, 0));
      workspace.getConfiguration().update(DART_ENABLE_SDK_FORMATTER, true, true);
      await commands.executeCommand('editor.action.formatSelection');
      editor.selection = new Selection(new Position(0, 0), new Position(0, 0));
    }
  }
}